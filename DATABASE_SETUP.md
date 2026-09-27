# Configuração do Banco de Dados

## Visão Geral

Este projeto utiliza PostgreSQL como banco de dados principal e Redis opcional para cache. A configuração é feita via Podman/Docker Compose para desenvolvimento.

## Tecnologias

- **PostgreSQL 14-alpine**: Banco de dados relacional principal
- **Redis 7-alpine**: Cache e idempotência (opcional no MVP)
- **Prisma ORM**: Type-safe ORM para TypeScript
- **Podman**: Container engine (alternativa ao Docker)
- **Sharp**: Processamento de imagens (validação de resolução, compressão)

## Status Atual

### ✅ Concluído
- **Containers Podman**: PostgreSQL e Redis iniciados e saudáveis
- **Schema Prisma**: Definido e sincronizado com o banco
- **Prisma Client**: Gerado com sucesso
- **Seed**: Dados iniciais populados no banco
- **Gerenciamento de Fotos**: Implementado para produtos do catálogo
- **Documentação**: DATABASE_SETUP.md atualizado

### ⚠️ Problemas Conhecidos
- **Networking**: Servidor Express roda na porta 3000 mas curl não consegue acessar
- **Possível causa**: Firewall do Windows ou configuração de networking do Podman

## Estrutura do Schema

O schema Prisma está definido em `prisma/schema.prisma` e inclui:

### Domínios Implementados
- **Autenticação**: User, Role
- **Catálogo**: Category, Product (com campo `imageUrl` obrigatório)
- **Estoque**: Material, MaterialReservation
- **Pedidos**: Order, OrderItem, OrderHistory
- **Aprovações**: Approval
- **Produção**: ProductionQueue

### Enums
- `OrderStatus`: pending, approved, in_production, shipped, delivered, cancelled
- `ProductionStage`: pending, printing, cutting, assembly, quality_check, packaging, shipped
- `ApprovalStatus`: pending, approved, rejected

### Schema de Produtos
- **Campo `imageUrl`**: Obrigatório (não nullable), armazena path da foto do produto
- **Constraint**: Garante que produtos não podem ser criados sem foto
- **Tamanho máximo**: 500 caracteres para o path

## Gerenciamento de Fotos do Catálogo

### Estrutura de Storage
- **Diretório**: `uploads/products/{produto_id}/foto.{ext}`
- **Formatos aceitos**: JPG, PNG, WEBP
- **Tamanho máximo**: 5MB
- **Resolução mínima**: 300x300 pixels (72dpi para web)
- **Serving**: Público via `/uploads/products/...` (sem autenticação)
- **Cache**: HTTP cache de 1 dia para performance

### Validação de Imagens
- **MIME type real**: Validação via magic bytes (não apenas extensão)
- **Resolução**: Validada via biblioteca sharp
- **Tamanho**: Limite de 5MB configurado no Multer
- **Formato**: Apenas JPG, PNG, WEBP (PDF não permitido)

### Endpoints de Fotos
- `POST /products` - Criar produto com upload de foto (multipart/form-data)
- `PATCH /products/:id/photo` - Atualizar foto do produto (multipart/form-data)
- `DELETE /products/:id/photo` - Remover foto do produto (admin apenas)
- `GET /uploads/products/:produto_id/foto.{ext}` - Servir foto do produto (público)

### Regras de Negócio
- **Foto obrigatória**: Produto não pode ser criado sem foto
- **Uma foto por produto**: MVP suporta apenas uma foto principal
- **Substituição**: Admin pode substituir foto existente
- **Exclusão**: Foto pode ser removida (produto fica sem foto, não recomendado)

## Configuração de Desenvolvimento

### 1. Iniciar Containers

```bash
# Iniciar PostgreSQL, Redis e Backend
podman-compose up -d

# Verificar status
podman-compose ps
```

**Status atual**: ✅ Containers rodando e saudáveis

### 2. Configurar Variáveis de Ambiente

O arquivo `.env` deve conter:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Sincronizar Schema com Banco

```bash
# Sincronizar schema (recomendado para desenvolvimento)
npx prisma db push
```

**Status atual**: ✅ Schema sincronizado com sucesso

### 4. Gerar Prisma Client

```bash
npm run prisma:generate
```

**Status atual**: ✅ Prisma Client gerado com sucesso

### 5. Popular com Dados Iniciais

```bash
npm run prisma:seed
```

**Status atual**: ✅ Seed executado com sucesso

## Dados Iniciais (Seed)

O script `prisma/seed.ts` criou com sucesso:

### Roles
- **admin**: Permissões completas (manage_users, manage_products, manage_orders, manage_production, manage_inventory)
- **user**: Permissões básicas (create_orders, view_orders, upload_customization)

### Usuários
- **admin@example.com** (senha: admin123) - Administrador
- **user@example.com** (senha: user123) - Usuário regular

### Categorias
- Camisetas
- Canecas
- Chaveiros

### Produtos (com fotos)
- Camiseta Personalizada Básica (complexidade: 1, foto: `/uploads/products/prod-1/foto.jpg`)
- Camiseta Premium (complexidade: 3, foto: `/uploads/products/prod-2/foto.jpg`)
- Caneca Cerâmica (complexidade: 1, foto: `/uploads/products/prod-3/foto.jpg`)
- Chaveiro Personalizado (complexidade: 1, foto: `/uploads/products/prod-4/foto.jpg`)

### Materiais
- Camiseta Algodão Branca M (quantidade: 100)
- Camiseta Algodão Preta M (quantidade: 80)
- Tinta para Impressão (quantidade: 50)
- Caneca Cerâmica (quantidade: 60)

## Troubleshooting

### Advisory Lock Error

Se encontrar erro `P1002` ao rodar migrations:

```bash
# Use db push ao invés de migrate para desenvolvimento
npx prisma db push
```

### Permissão ao Gerar Prisma Client

Se encontrar erro `EPERM` ao gerar o client:

```bash
# Limpar cache do Prisma
rm -rf node_modules/.prisma

# Regenerar
npm run prisma:generate
```

### Container Não Inicia

```bash
# Verificar logs
podman-compose logs postgres
podman-compose logs redis
podman-compose logs backend

# Reiniciar containers
podman-compose down
podman-compose up -d
```

### Conexão com Banco Falha

```bash
# Verificar se o banco está aceitando conexões
podman exec ecommerce-postgres pg_isready -U postgres

# Testar conexão direta
podman exec ecommerce-postgres psql -U postgres -d ecommerce
```

### Networking Issue (RESOLVIDO)

**Problema anterior**: Servidor Express roda na porta 3000 mas curl não consegue acessar

**Sintomas**:
- Servidor node.exe rodando (PID 31840)
- Porta 3000 em LISTENING
- curl retorna "Cannot GET /path"

**Causa raiz identificada**: Múltiplos processos Node.js rodando simultaneamente na porta 3000, causando conflitos e impedindo que o servidor correto respondesse às requisições.

**Solução aplicada**:
1. Identificar todos os processos Node.js rodando: `tasklist | findstr node`
2. Matar todos os processos antigos: `taskkill //F //IM node.exe`
3. Reiniciar o servidor: `npm run dev`

**Resultado**: Servidor funcionando corretamente, todos os endpoints acessíveis via navegador e curl

**Comandos úteis para diagnóstico futuro**:
```bash
# Verificar processos na porta
netstat -ano | findstr :3000

# Listar processos Node.js
tasklist | findstr node

# Matar processo específico
taskkill //F //PID <PID>

# Matar todos os processos Node.js
taskkill //F //IM node.exe
```

### Upload de Fotos Falha

Se o upload de fotos falhar:

```bash
# Verificar permissões da pasta uploads
ls -la uploads/

# Criar diretórios necessários
mkdir -p uploads/products/temp
mkdir -p uploads/customizations

# Verificar se sharp está instalado
npm list sharp
```

## Comandos Úteis

### Podman
```bash
podman-compose up -d          # Iniciar containers
podman-compose down           # Parar containers
podman-compose ps             # Status dos containers
podman-compose logs [service] # Logs de um serviço
podman-compose exec [service] [command] # Executar comando no container
```

### Prisma
```bash
npm run prisma:generate       # Gerar Prisma Client
npm run prisma:migrate        # Criar migrations
npm run prisma:studio         # Abrir interface visual
npm run prisma:seed          # Popular banco com dados iniciais
npx prisma db push           # Sincronizar schema (dev)
npx prisma studio            # Abrir studio
```

### PostgreSQL
```bash
# Conectar ao banco
podman exec ecommerce-postgres psql -U postgres -d ecommerce

# Listar tabelas
\dt

# Verificar schema de produtos
\d Product

# Sair
\q
```

## Backup e Restore

### Backup
```bash
# Backup do banco
podman exec ecommerce-postgres pg_dump -U postgres ecommerce > backup.sql

# Backup com dados
podman exec ecommerce-postgres pg_dump -U postgres --data-only ecommerce > data_backup.sql

# Backup da pasta uploads
tar -czf uploads-backup.tar.gz uploads/
```

### Restore
```bash
# Restore do backup
cat backup.sql | podman exec -i ecommerce-postgres psql -U postgres -d ecommerce

# Restore da pasta uploads
tar -xzf uploads-backup.tar.gz
```

## Configuração de Produção

Para produção, considere:

1. **Serviço Gerenciado**: Usar serviço de banco gerenciado (AWS RDS, Google Cloud SQL, etc.)
2. **Segurança**: Usar credenciais fortes e variáveis de ambiente seguras
3. **Migrations**: Usar `prisma migrate deploy` em vez de `db push`
4. **Backup**: Configurar backups automáticos do banco e da pasta uploads
5. **Monitoramento**: Monitorar performance e conexões
6. **SSL**: Habilitar SSL para conexões com o banco
7. **Storage**: Considerar migração para S3 ou serviço similar para fotos
8. **CDN**: Usar CDN para servir fotos do catálogo com melhor performance

## Escolhas Arquiteturais

### Por que PostgreSQL?
- Suporte avançado a tipos e relacionamentos
- Performance para queries complexas
- Compatibilidade com Prisma
- Comunidade ativa e documentação extensa

### Por que Prisma?
- Type-safe com TypeScript
- Migrations automáticas
- Schema intuitivo
- Studio para visualização de dados
- Excelente DX (Developer Experience)

### Por que Redis Opcional?
- Cache de dados frequentes (CEPs, feriados)
- Idempotência de requests
- Pode ser substituído por memória no MVP
- Escalável para produção

### Por que Podman?
- Alternativa ao Docker sem daemon
- Melhor segurança (rootless)
- Compatível com Docker Compose
- Ideal para desenvolvimento local

### Por que Sharp?
- Processamento de imagens eficiente
- Validação de resolução e formato
- Suporte a múltiplos formatos
- Performance superior a bibliotecas alternativas

### Por que Storage Local?
- Simplicidade para MVP
- Sem custos adicionais de serviços cloud
- Fácil migração para S3 no futuro
- Volumes Docker para persistência

## Próximos Passos

1. ✅ Resolver problema de networking
2. ⏳ Testar endpoints com banco funcionando
3. ⏳ Implementar testes de integração reais
4. ⏳ Configurar ambiente de produção
5. ⏳ Implementar backup automático
6. ⏳ Monitorar performance do banco
7. ⏳ Implementar upload de personalizações (separado de fotos de produtos)
8. ⏳ Implementar geração de QR Code

## Resumo da Implementação

### Backend Status
- ✅ Estrutura do projeto configurada
- ✅ TypeScript e ESLint configurados
- ✅ Prisma ORM configurado
- ✅ Banco de dados PostgreSQL rodando
- ✅ Schema sincronizado e populado
- ✅ Domínios implementados: Auth, Inventory, Catalog, Orders
- ✅ Padrões arquiteturais: Repository, Service, DTO
- ✅ Integrações externas: ViaCEP, Feriados
- ✅ Resiliência: Circuit Breaker, Retry, Fallback
- ✅ Gerenciamento de fotos de produtos: Upload, validação, serving
- ⚠️ Networking: Problema com acesso HTTP ao servidor

### Domínios Implementados
1. **Autenticação**: JWT, RBAC, middleware de autorização
2. **Estoque**: Lock otimista, reservas, alertas de nível mínimo
3. **Catálogo**: Produtos, categorias, busca, paginação, **fotos obrigatórias**
4. **Pedidos**: CRUD básico, histórico de status
5. **Integrações**: ViaCEP, API de Feriados com resiliência

### Gerenciamento de Fotos
- ✅ Schema atualizado com campo `imageUrl` obrigatório
- ✅ Biblioteca sharp instalada para validação
- ✅ Middleware de upload configurado (Multer)
- ✅ Middleware de validação de imagem (Sharp)
- ✅ Endpoints de upload/atualização/exclusão de fotos
- ✅ Serving público de fotos via Express static
- ✅ Cache HTTP configurado para performance
- ✅ DTOs atualizados com `imageUrl`
- ✅ Swagger atualizado com novos endpoints

### Próximos Passos do Projeto
1. Resolver problema de networking do servidor
2. Implementar Saga de criação de pedido
3. Implementar upload de personalizações (separado de fotos de produtos)
4. Implementar fluxo de aprovação
5. Implementar domínio de produção
6. Implementar geração de QR Code
7. Implementar Frontend (React)
8. Implementar testes E2E
