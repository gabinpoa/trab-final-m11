# Deploy Runbook

## Deploy Automático

### Via GitHub Actions (Main Branch)

1. **Push para branch main**
   ```bash
   git checkout main
   git pull
   git push origin main
   ```

2. **Pipeline executa automaticamente**:
   - Test Stage: Backend + Frontend tests
   - Build Stage: Docker image + security scan
   - Deploy Stage: Deploy para Render + migrations + health check

3. **Verificar deploy**:
   - Acessar dashboard do Render
   - Verificar logs em "Logs" tab
   - Testar health check: `curl https://seu-app.onrender.com/health`

## Deploy Manual

### Via Render Dashboard

1. **Acessar Render Dashboard**
   - Login em https://dashboard.render.com
   - Selecionar o serviço "ecommerce-app"

2. **Trigger manual deploy**:
   - Clicar em "Manual Deploy"
   - Selecionar branch "main"
   - Clicar em "Deploy"

3. **Verificar status**:
   - Monitorar progresso em "Events"
   - Verificar logs em "Logs"

### Via Render CLI

1. **Instalar Render CLI**:
   ```bash
   npm install -g @render/cli
   ```

2. **Login**:
   ```bash
   render login
   ```

3. **Deploy**:
   ```bash
   render deploy
   ```

## Deploy de Staging

### Via Branch Develop

1. **Push para branch develop**:
   ```bash
   git checkout develop
   git pull
   git push origin develop
   ```

2. **Deploy manual**:
   - Via Render Dashboard selecionar branch "develop"
   - Ou via CLI: `render deploy --branch develop`

## Rollback

### Via Render Dashboard

1. **Acessar dashboard do serviço**
2. **Clicar em "Events"**
3. **Encontrar deploy anterior bem-sucedido**
4. **Clicar em "Rollback"**
5. **Confirmar rollback**

### Via CLI

```bash
render rollback
```

## Troubleshooting de Deploy

### Deploy Falha

1. **Verificar logs**:
   - Acessar "Logs" tab no Render Dashboard
   - Procurar erros de build ou runtime

2. **Common issues**:
   - **Build timeout**: Aumentar timeout nas configurações
   - **Memory limit**: Upgrade do plano
   - **Database connection**: Verificar DATABASE_URL
   - **Missing dependencies**: Verificar package.json

3. **Soluções**:
   - Corrigir código
   - Commit e push novamente
   - Ou fazer rollback para versão estável

### Health Check Falha

1. **Verificar endpoint**:
   ```bash
   curl https://seu-app.onrender.com/health
   ```

2. **Common issues**:
   - **Database disconnected**: Verificar DATABASE_URL
   - **Port conflict**: Verificar PORT env var
   - **Startup timeout**: Aumentar timeout

3. **Soluções**:
   - Verificar logs de startup
   - Testar localmente
   - Corrigir configuração

## Pré-Deploy Checklist

- [ ] Todos os testes passando localmente
- [ ] Lint sem erros
- [ ] Type check sem erros
- [ ] Database migrations testadas
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco realizado (se necessário)
- [ ] Documentação atualizada

## Pós-Deploy Verificação

- [ ] Health check retornando 200
- [ ] Logs sem erros críticos
- [ ] Endpoints principais funcionando
- [ ] Frontend carregando corretamente
- [ ] Upload de arquivos funcionando
- [ ] Monitoramento configurado

## Contatos de Escalation

- **Nível 1**: Desenvolvedor (issues comuns)
- **Nível 2**: Tech Lead (issues complexos)
- **Nível 3**: Suporte Render (infrastructure issues)
