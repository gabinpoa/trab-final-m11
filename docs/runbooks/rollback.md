# Rollback Runbook

## Quando Fazer Rollback

- Deploy causou regressão crítica
- Performance severamente degradada
- Erros de produção afetando usuários
- Database migration falhou
- Security issue detectada

## Rollback via Render Dashboard

### Passo a Passo

1. **Acessar Render Dashboard**
   - Login em https://dashboard.render.com
   - Selecionar o serviço "ecommerce-app"

2. **Navegar para Events**
   - Clicar em "Events" tab
   - Ver histórico de deploys

3. **Identificar deploy estável**
   - Encontrar último deploy bem-sucedido
   - Verificar timestamp
   - Confirmar que era uma versão estável

4. **Executar rollback**
   - Clicar no botão "Rollback" ao lado do deploy
   - Confirmar ação
   - Aguardar conclusão

5. **Verificar rollback**
   - Monitorar progresso em "Events"
   - Verificar logs em "Logs"
   - Testar health check

## Rollback via CLI

### Comando Básico

```bash
render rollback
```

### Rollback para Deploy Específico

```bash
render rollback --deploy-id <deploy-id>
```

### Listar Deploys Disponíveis

```bash
render ps
```

## Rollback de Database Migrations

### Quando Necessário

- Migration causou corrupção de dados
- Migration não pode ser revertida automaticamente
- Schema change quebrou aplicação

### Procedimento

1. **Identificar migration problemática**
   ```bash
   npx prisma migrate status
   ```

2. **Criar migration de reversão**
   ```bash
   npx prisma migrate revert
   ```

3. **Se reversão automática falhar**:
   - Criar migration manual para reverter changes
   - Aplicar migration manual
   - Verificar integridade dos dados

4. **Rollback do aplicativo**
   - Fazer rollback do código para versão anterior
   - Verificar compatibilidade com schema atual

## Rollback de Frontend

### Via CDN (Cloudflare)

1. **Acessar Cloudflare Dashboard**
   - Selecionar domínio
   - Navegar para "Caching"
   - Clicar em "Purge Cache"

2. **Purge Everything**
   - Clicar em "Purge Everything"
   - Aguardar conclusão

3. **Verificar**
   - Limpar cache do browser
   - Testar aplicação

## Rollback Parcial

### Apenas Backend

1. **Fazer rollback do backend**
   - Via Render Dashboard ou CLI
   - Não afeta frontend

2. **Verificar compatibilidade**
   - Testar API endpoints
   - Verificar se frontend ainda funciona

### Apenas Frontend

1. **Reverter commit do frontend**
   ```bash
   git revert <commit-hash>
   git push
   ```

2. **Deploy do frontend**
   - Via CI/CD ou manual
   - Limpar cache CDN

## Verificação Pós-Rollback

### Checklist

- [ ] Health check retornando 200
- [ ] Logs sem erros críticos
- [ ] Endpoints principais funcionando
- [ ] Database migrations compatíveis
- [ ] Frontend carregando corretamente
- [ ] Cache CDN limpo (se aplicável)
- [ ] Monitoramento sem alertas

### Testes Manuais

1. **Testar health check**:
   ```bash
   curl https://seu-app.onrender.com/health
   ```

2. **Testar endpoints críticos**:
   - Login
   - Listagem de produtos
   - Criação de pedido
   - Upload de arquivos

3. **Testar frontend**:
   - Carregar página principal
   - Navegar entre páginas
   - Testar formulários

## Troubleshooting de Rollback

### Rollback Falha

1. **Verificar causa**:
   - Logs do Render
   - Erros de rollback
   - Status do serviço

2. **Soluções**:
   - Tentar rollback para deploy mais antigo
   - Corrigir código e fazer novo deploy
   - Escalar para suporte Render

### Database Migration Rollback Falha

1. **Verificar status**:
   ```bash
   npx prisma migrate status
   ```

2. **Soluções**:
   - Criar migration manual de reversão
   - Restaurar backup do banco
   - Contatar DBA se necessário

## Prevenção de Rollbacks

### Boas Práticas

- Testar migrations em staging antes de produção
- Usar database transactions em migrations
- Ter backups recentes disponíveis
- Implementar feature flags para mudanças arriscadas
- Monitorar métricas após deploy

### Pré-Deploy

- [ ] Testes completos passando
- [ ] Migrations testadas em staging
- [ ] Backup do banco realizado
- [ ] Plano de rollback documentado
- [ ] Equipe notificada sobre deploy

## Documentação de Rollback

### Após Rollback

1. **Documentar incidente**:
   - Causa do rollback
   - Versão revertida
   - Impacto nos usuários
   - Tempo de downtime

2. **Atualizar runbooks**:
   - Adicionar lições aprendidas
   - Atualizar procedimentos se necessário
   - Compartilhar com equipe

3. **Post-mortem**:
   - Agendar reunião de post-mortem
   - Analisar causa raiz
   - Definir ações preventivas
