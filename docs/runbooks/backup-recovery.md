# Backup and Recovery Runbook

## Estratégia de Backup

### Database Backup

- **Frequência**: Semanal (domingo 2AM)
- **Método**: pg_dump via GitHub Actions
- **Armazenamento**: GitHub Releases
- **RPO**: 7 dias
- **RTO**: 4 horas

### Storage Backup

- **Frequência**: Semanal
- **Método**: Download manual via dashboard
- **Armazenamento**: Local ou cloud storage
- **RPO**: 7 dias
- **RTO**: 24 horas

## Backup Automático (Database)

### GitHub Actions Workflow

O backup é executado automaticamente via `.github/workflows/backup-db.yml`:

```yaml
schedule:
  - cron: '0 2 * * 0' # Domingo 2AM
```

### Backup Manual

1. **Trigger manual via GitHub**:
   - Acessar repositório no GitHub
   - Navegar para "Actions"
   - Selecionar "Database Backup"
   - Clicar em "Run workflow"

2. **Via CLI local**:
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

3. **Upload manual**:
   - Criar release no GitHub
   - Upload do arquivo backup.sql
   - Documentar timestamp

## Verificação de Backup

### Verificar Integridade

1. **Download do backup**:
   ```bash
   curl -L https://github.com/usuario/repo/releases/download/backup-YYYYMMDD/backup.sql -o backup.sql
   ```

2. **Verificar tamanho**:
   ```bash
   ls -lh backup.sql
   ```

3. **Verificar conteúdo**:
   ```bash
   head -n 50 backup.sql
   ```

### Testar Restore

1. **Restore em banco de teste**:
   ```bash
   psql $TEST_DATABASE_URL < backup.sql
   ```

2. **Verificar tabelas**:
   ```bash
   psql $TEST_DATABASE_URL -c "\dt"
   ```

3. **Verificar dados**:
   ```bash
   psql $TEST_DATABASE_URL -c "SELECT COUNT(*) FROM users"
   ```

## Recovery Procedures

### Database Recovery

#### Scenario 1: Restore Completo

1. **Identificar backup mais recente**:
   - Acessar GitHub Releases
   - Encontrar backup mais recente
   - Download do arquivo

2. **Preparar banco**:
   ```bash
   # Drop database existente
   psql $DATABASE_URL -c "DROP DATABASE ecommerce;"
   
   # Criar database novo
   psql $DATABASE_URL -c "CREATE DATABASE ecommerce;"
   ```

3. **Restore backup**:
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

4. **Verificar integridade**:
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM orders"
   ```

5. **Aplicar migrations pendentes**:
   ```bash
   npx prisma migrate deploy
   ```

6. **Testar aplicação**:
   - Health check
   - Endpoints principais
   - Autenticação

#### Scenario 2: Restore Parcial (Tabela Específica)

1. **Extrair tabela do backup**:
   ```bash
   # Extrair apenas tabela users
   sed -n '/COPY public.users/,/\\\./p' backup.sql > users.sql
   ```

2. **Truncar tabela existente**:
   ```bash
   psql $DATABASE_URL -c "TRUNCATE TABLE users CASCADE;"
   ```

3. **Restore tabela**:
   ```bash
   psql $DATABASE_URL < users.sql
   ```

#### Scenario 3: Point-in-Time Recovery (PostgreSQL)

Se o PostgreSQL suportar PITR:

1. **Identificar timestamp desejado**
2. **Usar pg_restore com opção --single-transaction**
3. **Aplicar changes até o timestamp**

### Storage Recovery

#### Scenario 1: Restore de Backup Local

1. **Localizar backup local**:
   ```bash
   ls -lh ~/backups/uploads/
   ```

2. **Restaurar para servidor**:
   ```bash
   rsync -av ~/backups/uploads/ user@server:/app/uploads/
   ```

3. **Verificar estrutura**:
   ```bash
   ls -R /app/uploads/
   ```

#### Scenario 2: Download Manual do Render

1. **Acessar Render Dashboard**
   - Selecionar serviço
   - Acessar "Files" tab
   - Download da pasta uploads/

2. **Restaurar localmente**:
   ```bash
   unzip uploads-backup.zip
   cp -r uploads/ /app/
   ```

3. **Verificar permissões**:
   ```bash
   chmod -R 755 /app/uploads/
   ```

## Disaster Recovery

### Scenario: Falha Completa do Servidor

1. **Avaliar situação**:
   - Verificar status do Render Dashboard
   - Identificar causa da falha
   - Estimar tempo de recovery

2. **Comunicar stakeholders**:
   - Notificar equipe sobre incidente
   - Estimar tempo de recovery
   - Comunicar RTO (4 horas)

3. **Iniciar recovery**:
   - Provisionar novo servidor se necessário
   - Restore database do backup
   - Restore storage do backup
   - Deploy do aplicativo

4. **Verificar funcionalidade**:
   - Health check
   - Endpoints principais
   - Upload de arquivos
   - Autenticação

5. **Documentar incidente**:
   - Causa raiz
   - Tempo de downtime
   - Ações tomadas
   - Lições aprendidas

### Scenario: Corrupção de Database

1. **Identificar corrupção**:
   - Erros de query
   - Dados inconsistentes
   - Logs de erro

2. **Parar aplicação**:
   - Via Render Dashboard: "Stop Service"
   - Prevenir escrita adicional

3. **Restore do backup**:
   - Usar backup mais recente
   - Seguir procedimento de restore

4. **Verificar integridade**:
   - Rodar verificações de consistência
   - Testar queries críticas
   - Verificar contagem de registros

5. **Reiniciar aplicação**:
   - "Start Service" no Render
   - Monitorar logs
   - Testar funcionalidade

## Backup Monitoring

### Verificar Backups Recentes

1. **Acessar GitHub Releases**:
   - Verificar se backup mais recente existe
   - Verificar timestamp
   - Verificar tamanho do arquivo

2. **Verificar GitHub Actions**:
   - Acessar "Actions" no GitHub
   - Verificar se workflow "Database Backup" está rodando
   - Verificar se última execução foi bem-sucedida

### Alertas de Backup

Configurar alertas no GitHub Actions:
- Notificação por email se backup falhar
- Notificação por Slack se backup não rodar
- Alerta se backup for muito pequeno (possível corrupção)

## Backup Testing

### Teste Mensal

1. **Agendar teste mensal**:
   - Primeiro domingo de cada mês
   - Documentar resultado

2. **Procedimento de teste**:
   - Download do backup mais recente
   - Restore em banco de teste
   - Verificar integridade dos dados
   - Testar queries críticas
   - Documentar resultado

3. **Critérios de sucesso**:
   - Restore completo sem erros
   - Todos os dados presentes
   - Queries funcionando corretamente
   - RTO dentro do esperado (4 horas)

## Backup Retention Policy

### Database

- **Retenção**: Manter últimos 4 backups (1 mês)
- **Limpeza**: Deletar backups antigos manualmente
- **Arquivamento**: Backup mensal por 6 meses (opcional)

### Storage

- **Retenção**: Manter backup semanal por 1 mês
- **Limpeza**: Deletar backups antigos manualmente
- **Arquivamento**: Backup mensal por 3 meses (opcional)

## Contatos de Escalation

- **Nível 1**: Desenvolvedor (backup/restore simples)
- **Nível 2**: Tech Lead (recovery complexo)
- **Nível 3**: DBA (corrupção de database)
- **Nível 4**: Suporte Render (infrastructure issues)

## Documentação de Incidentes

### Após Recovery

1. **Documentar incidente**:
   - Data e hora
   - Causa do incidente
   - Impacto nos usuários
   - Tempo de downtime
   - Ações tomadas
   - Tempo de recovery

2. **Atualizar runbooks**:
   - Adicionar lições aprendidas
   - Atualizar procedimentos se necessário
   - Compartilhar com equipe

3. **Post-mortem**:
   - Agendar reunião de post-mortem
   - Analisar causa raiz
   - Definir ações preventivas
   - Atualizar políticas de backup
