# DevOps Plan: Plataforma de E-commerce para Produtos Personalizados

## Infraestrutura

### Plataforma de Deploy
- **Plataforma Principal**: Render Free Tier
  - Justificativa: Suporte nativo a Node.js, PostgreSQL, e storage persistente
  - Plano: Free (750 horas/mês, sleep após 15min inatividade)
  - Limitações: Spin-up time ~30s, sem custom domains no free tier
- **Banco de Dados**: PostgreSQL Free Tier (Render)
  - Versão: PostgreSQL 14+
  - Plano: Free (90 dias, depois $7/mês ou migrar para alternativa gratuita)
  - Alternativa gratuita: Supabase Free Tier (500MB, 2 conexões)
  - Backup: Manual via pg_dump (automatizado com GitHub Actions)
- **Storage**: Disk persistente gratuito (Render)
  - Tamanho: 100MB (limitado no free tier)
  - Estrutura mantida: `uploads/products/`, `uploads/customizations/`, `uploads/qrcodes/`
  - Limitação: Monitorar uso, implementar limpeza automática
- **Cache**: Memória local (sem Redis no MVP)
  - Justificativa: Economizar custo, MVP não exige cache distribuído
  - Alternativa: Upstash Redis Free (10k comandos/dia) se necessário
- **CDN**: Cloudflare Free
  - Cache de fotos do catálogo
  - DDoS protection básica
  - SSL/TLS automático

### Ambiente de Desenvolvimento
- **Containerização**: Docker + Docker Compose
  - Serviços: app, postgres, redis (opcional)
  - Volume persistente para `uploads/`
- **Local Storage**: Sistema de arquivos local com mesma estrutura de produção
- **Variáveis de Ambiente**: Arquivo `.env` com template `.env.example`

## CI/CD

### Workflow de GitHub Actions
```yaml
# .github/workflows/ci-cd.yml
stages:
  - test
  - build
  - deploy
```

### Pipeline Detalhado
1. **Test Stage** (on push to any branch)
   - Run backend unit tests: `npm test`
   - Run frontend unit tests: `npm run test:frontend`
   - Run integration tests: `npm run test:integration`
   - Lint: `npm run lint`
   - Type check: `npm run type-check`
   - Frontend type check: `npm run type-check:frontend`

2. **E2E Test Stage** (on push to main/develop)
   - Run Playwright E2E tests: `npm run test:e2e`
   - Testar fluxos críticos em navegadores reais (Chrome, Firefox, WebKit)
   - Gerar screenshots e vídeos em caso de falha
   - Gerar relatório HTML de testes

3. **Build Stage** (on push to main/develop)
   - Build Docker image
   - Build frontend: `npm run build:frontend`
   - Security scan básico (npm audit)
   - Push para GitHub Container Registry (gratuito)

4. **Deploy Stage** (on push to main)
   - Deploy para Render (via webhook ou render CLI)
   - Run database migrations
   - Health check verification
   - Notification via GitHub Actions (email)

### Estratégias de Deploy
- **Main Branch**: Deploy automático para produção
- **Develop Branch**: Deploy manual para staging (mesma infra, branch diferente)
- **Feature Branches**: Deploy manual via render CLI (sem preview environments no free tier)
- **Rollback**: Revert para commit anterior + redeploy manual
- **Blue-Green**: Não implementado no MVP (simples deploy)

### Automação
- **Dependências**: `npm ci` para builds determinísticos
- **Migrations**: Automáticas via Prisma Migrate
- **Health Checks**: Endpoint `/health` com verificação de banco e serviços
- **Zero Downtime**: Platform-managed (Render)
- **Keep-Alive**: GitHub Actions para ping periódico (evitar sleep)

### Workflow de Keep-Alive (GitHub Actions)
```yaml
# .github/workflows/keep-alive.yml
on:
  schedule:
    - cron: '*/10 * * * *' # A cada 10 minutos
  workflow_dispatch:

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping health endpoint
        run: curl -f $APP_URL/health || exit 1
```

### Workflow de Testes Frontend (GitHub Actions)
```yaml
# .github/workflows/test-frontend.yml
on:
  push:
    paths:
      - 'frontend/**'
      - 'package.json'
  pull_request:
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:frontend
      - run: npm run test:coverage:frontend
```

### Workflow de Testes E2E (Playwright)
```yaml
# .github/workflows/test-e2e.yml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-screenshots
          path: test-results/
          retention-days: 7
```

## Monitoramento

### Métricas Coletadas
- **Application Metrics**:
  - CPU e memória do container
  - Latência de API (p50, p95, p99)
  - Taxa de erro (4xx, 5xx)
  - Throughput (requests/segundo)
- **Business Metrics**:
  - Pedidos criados/hora
  - Uploads processados
  - QR Codes gerados
- **Database Metrics**:
  - Conexões ativas
  - Query performance
  - Table size growth

### Ferramentas de Monitoramento
- **Plataforma**: Render Dashboard
  - Métricas básicas de infraestrutura (CPU, memória)
  - Logs centralizados (retenção 7 dias)
- **Application Monitoring**: Sentry Free Tier
  - 5k errors/mês
  - Captura de stack traces e contexto
- **Uptime Monitoring**: UptimeRobot Free
  - 50 monitors, check a cada 5 minutos
  - Alerta por email
  - **Uso adicional**: Ping endpoint `/health` a cada 10 minutos para evitar app sleep
- **Test Coverage**: Codecov ou Coveralls (gratuito)
  - Integração com Jest (backend) e Vitest (frontend)
  - Badge no README com cobertura
  - Alerta se cobertura cair abaixo do threshold (60% frontend, 70% backend)
- **Custom Metrics**: Não implementado no MVP (opcional para v2)

### Alertas
- **Críticos** (Email via UptimeRobot):
  - Downtime > 5 minutos
  - Error rate > 5% (via Sentry)
  - Database connection failures (via logs)
- **Avisos** (Email via Sentry):
  - Error rate > 1%
  - Latência p95 > 2s
  - CPU > 80% por 10 minutos
  - Memory > 80% por 10 minutos
- **Informativos** (Dashboard):
  - Deploy completados
  - Migrations executadas

### Logs
- **Centralização**: Plataforma (Render/Railway) ou Logtail
- **Retenção**: 7 dias (free tier), 30 dias (paid)
- **Estrutura**: JSON formatado com Pino/Winston
- **Níveis**: error, warn, info, debug
- **Context**: Request ID, user ID, timestamp

## Backup e Recuperação

### Estratégia de Backup
- **Database**:
  - Backup manual via pg_dump (GitHub Actions semanal)
  - Armazenamento: GitHub Releases (gratuito)
  - RPO: 7 dias
  - RTO: 4 horas (restore manual)
  - Workflow: `.github/workflows/backup-db.yml`
- **Storage (uploads/)**:
  - Backup semanal via GitHub Actions (commit em repo privado)
  - Limitação: Arquivos grandes no Git não recomendado
  - Alternativa: Download manual periódico via dashboard
  - RPO: 7 dias
  - RTO: 24 horas
- **Configuration**:
  - Version control de `.env.example`
  - Secrets gerenciados via plataforma (Render)

### Workflow de Backup (GitHub Actions)
```yaml
# .github/workflows/backup-db.yml
on:
  schedule:
    - cron: '0 2 * * 0' # Domingo 2AM
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup database
        run: pg_dump $DATABASE_URL > backup.sql
      - name: Upload to release
        uses: softprops/action-gh-release@v1
        with:
          files: backup.sql
          tag_name: backup-$(date +%Y%m%d)
```

### Procedimento de Recovery
1. **Database Recovery**:
   - Download do backup do GitHub Release
   - Restore via pg_restore localmente
   - Verificar integridade dos dados
   - Testar endpoints críticos
2. **Storage Recovery**:
   - Restore do backup do GitHub (se aplicável)
   - Ou download manual do storage
   - Verificar estrutura de pastas
   - Testar upload/download
3. **Validation**:
   - Smoke tests automatizados
   - Verificação manual de funcionalidades críticas

### Disaster Recovery
- **Documentação**: Runbook detalhado em `docs/disaster-recovery.md`
- **Testes**: Simulação de recovery trimestral
- **Comunicação**: Plano de notificação para stakeholders
- **RTO Alvo**: 4 horas para recuperação completa

## Segurança Operacional

### Secrets Management
- **Variáveis de Ambiente**: Gerenciadas via plataforma (Render/Railway)
  - JWT_SECRET, DATABASE_URL, REDIS_URL
  - API keys (ViaCEP, Brasil API)
  - Nunca commitar no repositório
- **Rotacionamento**: Quarterly para secrets críticos
- **Acesso**: Apenas administradores da plataforma

### Acesso e Autenticação
- **SSH**: Acesso via plataforma (sem SSH direto)
- **VPN**: Não necessário (PaaS)
- **Autenticação**: 2FA obrigatório para conta da plataforma
- **RBAC**: Roles definidos na plataforma (Admin, Developer, Viewer)

### SSL/TLS
- **Certificados**: Automáticos via plataforma (Let's Encrypt)
- **HTTPS**: Obrigatório para todos os endpoints
- **HSTS**: Habilitado com max-age de 6 meses
- **Headers**: Security headers (CSP, X-Frame-Options, etc.)

### Políticas de Acesso
- **IP Whitelist**: Não implementado no MVP (acesso público)
- **Rate Limiting**: Implementado no nível de aplicação
  - 100 requests/minuto por IP
  - 10 requests/minuto para endpoints sensíveis
- **WAF**: Cloudflare WAF (plano gratuito)
  - Proteção contra SQL injection, XSS
  - Regras customizáveis se necessário

### Compliance
- **LGPD**: Logs de acesso por 6 meses
- **Data Retention**: Política de retenção de dados documentada
- **Audit Logs**: Acesso a recursos críticos logado

## Operações

### Procedimentos de Deploy
1. **Deploy Automático**:
   - Push para branch `main`
   - CI/CD executa testes
   - Deploy automático para produção
   - Verificação de health check

2. **Deploy Manual**:
   - Via dashboard da plataforma
   - Ou via CLI: `railway up` / `render deploy`
   - Trigger manual via webhook

3. **Rollback**:
   - Via dashboard (1-click rollback)
   - Ou via CLI: `railway rollback`
   - Notificação para equipe

### Troubleshooting
- **Logs**: Acesso via dashboard da plataforma
- **Debug Mode**: Variável `DEBUG=true` para logs detalhados
- **Database Access**: Via plataforma (console SQL)
- **Common Issues**:
  - **Slow queries**: Analisar via EXPLAIN, adicionar índices
  - **Memory leaks**: Analisar heap dumps, reiniciar serviço
  - **Upload failures**: Verificar espaço em disco, permissões
  - **API timeouts**: Verificar latência de APIs externas

### Manutenção
- **Janelas de Manutenção**: Domingo 2-4 AM (horário de menor tráfego)
- **Comunicação**: Aviso 24h antes para stakeholders
- **Procedimentos**:
  - Colocar aplicação em modo manutenção
  - Executar migrations
  - Reiniciar serviços
  - Verificar health checks
  - Remover modo manutenção

### Escalation
- **Nível 1**: Desenvolvedor (issues comuns)
- **Nível 2**: Tech Lead (issues complexos)
- **Nível 3**: Suporte da plataforma (infrastructure issues)
- **Contatos**: Documentados em `docs/contacts.md`

### Performance Optimization
- **Database**: Índices monitorados, vacuum regular
- **Cache**: Redis para dados frequentes (CEPs, feriados)
- **Images**: Compressão automática via sharp
- **CDN**: Cloudflare para assets estáticos
- **Load Testing**: K6 ou Artillery antes de releases maiores

### Documentação Operacional
- **Runbooks**: `docs/runbooks/`
  - `deploy.md`
  - `rollback.md`
  - `backup-recovery.md`
  - `troubleshooting.md`
- **Onboarding**: `docs/onboarding.md` para novos desenvolvedores
- **Architecture Decisions**: ADRs em `docs/adr/`

## Limitações do Free Tier e Mitigações

### App Sleep (Render)
- **Problema**: App sleep após 15min inatividade, spin-up ~30s
- **Mitigação**:
  - Implementar ping via UptimeRobot a cada 10 minutos
  - Usar webhook para acordar app antes de uso crítico
  - Documentar para usuários que primeiro acesso pode ser lento
- **Impacto**: Aceitável para MVP com baixo tráfego

### Storage Limitado (100MB)
- **Problema**: Espaço limitado para uploads
- **Mitigação**:
  - Implementar limpeza automática de arquivos antigos
  - Compressão agressiva de imagens
  - Limitar tamanho de uploads (já definido: 5MB fotos, 10MB personalizações)
  - Monitorar uso via dashboard
- **Impacto**: Requer monitoramento ativo

### Database 90 Dias (Render)
- **Problema**: PostgreSQL free expira após 90 dias
- **Mitigação**:
  - Migrar para Supabase Free antes de 90 dias
  - Ou aceitar pagar $7/mês após período de teste
  - Backup semanal via GitHub Actions
- **Impacto**: Planejamento necessário

### Sem Custom Domains
- **Problema**: Apenas subdomínio .onrender.com
- **Mitigação**:
  - Usar Cloudflare Workers para redirect de domínio próprio
  - Ou aceitar subdomínio no MVP
- **Impacto**: Menor profissionalismo, mas funcional

## Restrições Operacionais para Desenvolvedor

### Implementação
- **Health Check**: Implementar endpoint `/health` que verifica:
  - Conexão com banco de dados
  - Disponibilidade de APIs externas (opcional)
- **Graceful Shutdown**: Implementar shutdown signals (SIGTERM)
- **Logging**: Estruturado com contexto (request ID, user ID)
- **Error Handling**: Capturar erros não tratados e logar
- **Metrics**: Não implementado no MVP (opcional para v2)
- **Cache**: Implementar cache em memória local (sem Redis)

### Upload de Arquivos
- **Validação**: MIME type real, tamanho máximo
- **Sanitização**: Prevenir path traversal
- **Storage**: Usar estrutura definida (`uploads/products/`, etc.)
- **Serving**: Fotos do catálogo via endpoint público (sem auth)
- **Personalizações**: Via endpoint com autenticação

### Database
- **Migrations**: Usar Prisma Migrate
- **Indexes**: Adicionar índices para queries frequentes
- **Constraints**: Validar no nível de aplicação e banco
- **Transactions**: Usar para operações críticas (saga)

### Cache
- **Idempotência**: Usar memória local (Map/objeto) no MVP
- **TTL**: Definir apropriado para cada tipo de dado
- **Invalidation**: Estratégia clara de cache invalidation
- **Nota**: Cache local é perdido em restarts (aceitável para MVP)

### External APIs
- **Circuit Breaker**: Implementar para ViaCEP e API de Feriados
- **Timeout**: Máximo 5s para chamadas externas
- **Fallback**: Implementar comportamento degradado
- **Retry**: Com exponential backoff

### Testes
- **Backend**: Implementar testes com Jest + Supertest
  - Cobertura mínima: 70-75%
  - Tipos: Unitários, integração e E2E
  - Mocking: Jest mocks para serviços externos
- **Frontend Unitários**: Implementar testes com Vitest + React Testing Library
  - Cobertura mínima: 60%
  - Tipos: Unitários (stores, services), componentes, integração
  - MSW para mocking de APIs
  - Ambiente: jsdom para simulação de browser
- **Frontend E2E**: Implementar testes com Playwright
  - Tipos: Fluxos de usuário completos em navegadores reais
  - Cenários: Login, carrinho, pedidos, upload de arquivos
  - Ambiente: Navegadores reais (Chrome, Firefox, WebKit) via headless mode
  - Artifacts: Screenshots, vídeos e relatório HTML em caso de falha
  - Compatibilidade: Funciona melhor em Windows 11 que Cypress
- **CI/CD**: Testes devem passar antes de deploy
- **Coverage**: Thresholds configurados para falhar se cobertura cair abaixo do mínimo

## Custos Estimados (MVP)

### Mensal (100% Gratuito)
- **Plataforma (Render)**: $0 (Free Tier)
- **Database**: $0 (Render Free - 90 dias) ou $0 (Supabase Free)
- **Redis**: $0 (memória local) ou $0 (Upstash Free se necessário)
- **Storage**: $0 (Render Free - 100MB)
- **CDN**: $0 (Cloudflare Free)
- **Monitoring**: $0 (Sentry Free + UptimeRobot Free)
- **Test Coverage**: $0 (Codecov ou Coveralls Free)
- **CI/CD**: $0 (GitHub Actions Free)
- **Total**: $0/mês

### Limitações do Free Tier
- **Render**: App sleep após 15min inatividade (spin-up ~30s)
- **Database**: 90 dias grátis no Render, depois migrar para Supabase ou pagar $7/mês
- **Storage**: 100MB limitado (monitorar uso, implementar limpeza)
- **Custom Domains**: Não disponível no free tier (subdomínio .onrender.com)

### Escalabilidade (quando necessário)
- **Vertical**: Upgrade para Starter ($7/mês)
- **Horizontal**: Adicionar instâncias (v2)
- **Storage**: Upgrade de disk size ou migrar para S3/R2
- **Database**: Upgrade para plano pago ou migrar para Supabase Pro

## Próximos Passos (v2)
- Migrar storage local para S3/R2
- Implementar CDN para uploads
- Adicionar monitoring avançado (Prometheus/Grafana)
- Implementar blue-green deployments
- Adicionar load balancing
- Implementar autoscaling

## Alternativas Gratuitas de Longo Prazo

### Opção 1: Supabase (Recomendado)
- **Database**: Supabase PostgreSQL Free (500MB, 2 conexões)
- **Auth**: Supabase Auth (incluído)
- **Storage**: Supabase Storage (1GB)
- **Realtime**: Supabase Realtime (incluído)
- **Custo**: $0/mês
- **Vantagem**: Sem limite de tempo, mais recursos que Render

### Opção 2: Railway + Supabase
- **App**: Railway Free ($5 créditos/mês)
- **Database**: Supabase Free
- **Storage**: Railway Free (500MB)
- **Custo**: $0/mês (créditos Railway renovam mensalmente)
- **Vantagem**: Melhor experiência de dev

### Opção 3: Vercel + Supabase
- **Frontend**: Vercel Free (ilimitado)
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase Free
- **Storage**: Supabase Storage
- **Custo**: $0/mês
- **Vantagem**: Melhor performance para frontend

### Recomendação para MVP
Começar com Render Free + Supabase Free (para database) para evitar limite de 90 dias do Render PostgreSQL.
