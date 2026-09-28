# Plataforma de E-commerce para Produtos Personalizados

Plataforma de e-commerce completa para venda de produtos personalizados com fluxo de aprovação, rastreamento de produção e gerenciamento de estoque.

## 📋 Visão Geral

Este projeto é uma aplicação monolítica modular desenvolvida em Node.js com TypeScript, projetada para gerenciar o ciclo completo de vendas de produtos personalizados, desde o catálogo até a entrega.

### Funcionalidades Principais

- ✅ **Autenticação e Autorização**: JWT com RBAC (Role-Based Access Control)
- ✅ **Gerenciamento de Catálogo**: Produtos, categorias e fotos
- ✅ **Controle de Estoque**: Materiais com lock otimista para controle de concorrência
- ✅ **Saga de Pedidos**: Orquestração transacional com compensação automática
- ✅ **Integrações Externas**: ViaCEP (frete) e BrasilAPI (feriados) com circuit breaker
- ✅ **Gerenciamento de Fotos**: Upload, validação e serving público
- ✅ **Upload de Personalizações**: Validação de MIME type, tamanho, resolução, thumbnails e compressão
- ✅ **Fluxo de Aprovação**: Aprovação/rejeição de pedidos com histórico de alterações
- ✅ **Domínio de Produção**: Fila de produção com etapas de manufatura e cálculo de tempo estimado
- ✅ **Geração de QR Code**: QR Codes para rastreamento com cache e página pública
- ✅ **Frontend React**: Interface completa com catálogo, carrinho, pedidos, personalização e rastreamento
- ✅ **Painel Admin**: Gestão de aprovações e fila de produção
- ✅ **Operacional**: Health check, graceful shutdown, logging estruturado
- ✅ **Testes Frontend**: 52 testes automatizados com Vitest e React Testing Library

## 🛠️ Tecnologias

### Backend
- **Runtime**: Node.js 20+
- **Linguagem**: TypeScript 5.9
- **Framework**: Express 5.2
- **ORM**: Prisma 5.22
- **Banco de Dados**: PostgreSQL 14
- **Cache**: Redis 7
- **Autenticação**: JWT (jsonwebtoken)
- **Hash de Senhas**: bcrypt
- **Logging**: Pino
- **Documentação**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Upload**: Multer
- **Processamento de Imagens**: Sharp
- **Testes**: Jest, Supertest

### DevOps
- **Containerização**: Podman (compatível com Docker)
- **Orquestração**: docker-compose
- **Process Manager**: PM2 (produção)

## 🚀 Como Começar

### Pré-requisitos

- Node.js 20+
- PostgreSQL 14+ (ou Podman/Docker)
- Redis 7+ (opcional para cache)
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd trab-final
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

4. **Inicie o banco de dados**
```bash
# Com Podman
podman-compose up -d

# Ou com Docker
docker-compose up -d
```

5. **Sincronize o schema do banco**
```bash
npm run prisma:generate
npx prisma db push
```

6. **Popule o banco com dados iniciais**
```bash
npm run prisma:seed
```

7. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
trab-final/
├── src/
│   ├── domains/              # Domínios de negócio
│   │   ├── auth/            # Autenticação e autorização
│   │   │   ├── controllers/
│   │   │   ├── dto/
│   │   │   ├── routes.ts
│   │   │   └── services/
│   │   ├── catalog/         # Catálogo de produtos
│   │   │   ├── controllers/
│   │   │   ├── dto/
│   │   │   ├── middlewares/ # Upload e validação de fotos
│   │   │   ├── repositories/
│   │   │   ├── routes.ts
│   │   │   └── services/
│   │   ├── inventory/       # Controle de estoque
│   │   │   ├── controllers/
│   │   │   ├── dto/
│   │   │   ├── repositories/
│   │   │   ├── routes.ts
│   │   │   └── services/
│   │   ├── orders/          # Pedidos e saga
│   │   │   ├── controllers/
│   │   │   ├── dto/
│   │   │   ├── repositories/
│   │   │   ├── routes.ts
│   │   │   ├── services/
│   │   │   └── saga/        # Saga pattern
│   │   │       ├── steps/
│   │   │       ├── types.ts
│   │   │       └── orderSagaCoordinator.ts
│   │   └── integrations/    # Integrações externas
│   │       └── clients/
│   │           ├── viaCep.client.ts
│   │           └── holidays.client.ts
│   ├── shared/              # Código compartilhado
│   │   ├── config/          # Configurações
│   │   ├── middlewares/     # Middlewares globais
│   │   ├── types/           # Tipos TypeScript
│   │   └── utils/           # Utilitários
│   ├── test/                # Configuração de testes
│   ├── app.ts               # Configuração do Express
│   └── index.ts             # Entry point
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   └── seed.ts              # Dados iniciais
├── uploads/                 # Arquivos uploadados
│   └── products/            # Fotos do catálogo
├── .env.example             # Exemplo de variáveis de ambiente
├── docker-compose.yml       # Orquestração de containers
├── Dockerfile               # Imagem do backend
├── package.json             # Dependências
├── tsconfig.json            # Configuração TypeScript
└── README.md                # Este arquivo
```

## 🏗️ Arquitetura

### Padrões Implementados

- **Monolito Modular**: Separação por domínios de negócio
- **Repository Pattern**: Abstração do acesso a dados
- **Service Layer**: Lógica de negócio isolada
- **DTO Pattern**: Transferência de dados com validação
- **Saga Pattern**: Orquestração de processos distribuídos
- **Circuit Breaker**: Resiliência em integrações externas
- **Lock Otimista**: Controle de concorrência no estoque
- **Middleware Pattern**: Interceptação de requests

### Fluxo de Criação de Pedido (Saga)

```
1. ReserveMaterialsStep
   ↓ (sucesso)
2. CalculateFreightStep
   ↓ (sucesso)
3. CreateOrderStep
   ↓ (sucesso)
Pedido criado com sucesso

Em caso de falha em qualquer passo:
→ Compensação em ordem reversa (LIFO)
→ Rollback de todas as mudanças
→ Pedido não é criado
```

## 📊 Status das Fases

| Fase | Descrição | Status |
|------|-----------|--------|
| Fase 1 | Configuração e Infraestrutura Base | ✅ Concluída |
| Fase 2 | Domínio de Autenticação | ✅ Concluída |
| Fase 3 | Domínio de Estoque | ✅ Concluída |
| Fase 4 | Domínio de Catálogo | ✅ Concluída |
| Fase 5 | Integrações Externas | ✅ Concluída |
| Fase 6 | Domínio de Pedidos - Parte 1 | ✅ Concluída |
| Fase 7 | Domínio de Pedidos - Parte 2 (Saga) | ✅ Concluída |
| Fase 8 | Upload de Personalizações | ✅ Concluída |
| Fase 9 | Fluxo de Aprovação | ✅ Concluída |
| Fase 10 | Domínio de Produção | ✅ Concluída |
| Fase 11 | Geração de QR Code | ✅ Concluída |
| Fase 12 | Frontend - Configuração | ✅ Concluída |
| Fase 13 | Frontend - Autenticação | ✅ Concluída |
| Fase 14 | Frontend - Catálogo | ✅ Concluída |
| Fase 15 | Frontend - Personalização | ✅ Concluída |
| Fase 16 | Frontend - Pedidos | ✅ Concluída |
| Fase 17 | Frontend - Rastreamento | ✅ Concluída |
| Fase 18 | Frontend - Admin | ✅ Concluída |
| Fase 19 | Testes e QA | ✅ Concluída (Frontend: 52 testes, Backend: configurado) |
| Fase 20 | Requisitos Operacionais | ✅ Concluída |

## 🔌 API Endpoints

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login e obter token JWT

### Catálogo
- `GET /products` - Listar produtos
- `GET /products/:id` - Detalhes do produto
- `POST /products` - Criar produto (admin)
- `PATCH /products/:id/photo` - Atualizar foto (admin)
- `DELETE /products/:id/photo` - Remover foto (admin)
- `GET /uploads/products/:id/foto.{ext}` - Servir foto (público)

### Estoque
- `GET /materials` - Listar materiais
- `GET /materials/:id` - Detalhes do material
- `POST /materials` - Criar material (admin)
- `PUT /materials/:id` - Atualizar material (admin)
- `DELETE /materials/:id` - Deletar material (admin)
- `GET /materials/availability` - Consultar disponibilidade

### Pedidos
- `POST /orders` - Criar pedido (usa Saga)
- `GET /orders` - Listar pedidos (admin)
- `GET /orders/my` - Pedidos do usuário atual
- `GET /orders/:id` - Detalhes do pedido
- `PATCH /orders/:id/status` - Atualizar status (admin)

### Personalizações
- `POST /customizations/:orderId` - Upload de personalização
- `GET /customizations/:id` - Detalhes da personalização
- `GET /customizations/order/:orderId` - Personalizações do pedido
- `DELETE /customizations/:id` - Deletar personalização
- `GET /uploads/customizations/:orderId/{type}/{filename}` - Servir arquivo (autenticado)

### Aprovações
- `POST /approvals/:id/approve` - Aprovar pedido
- `POST /approvals/:id/reject` - Rejeitar pedido
- `GET /approvals/:id` - Detalhes da aprovação
- `GET /approvals/order/:orderId` - Aprovações do pedido
- `GET /approvals/history/:orderId` - Histórico de alterações do pedido

### Produção
- `POST /production/queue` - Criar entrada na fila de produção (admin)
- `GET /production/queue` - Buscar toda a fila de produção (admin)
- `GET /production/queue/:id` - Buscar fila de produção por ID (admin)
- `GET /production/queue/stage/:stage` - Buscar fila por etapa (admin)
- `PUT /production/queue/:id/stage` - Atualizar etapa de produção (admin)
- `GET /production/queue/:id/estimated-time` - Calcular tempo estimado (admin)

### QR Code e Rastreamento
- `GET /qrcode/orders/:id` - Gerar QR Code para pedido (autenticado)
- `GET /qrcode/rastreamento/:code` - Buscar informações de rastreamento (público)
- `GET /uploads/qrcodes/:id.png` - Servir imagem do QR Code (público)

### Documentação
- `GET /api-docs` - Swagger UI
- `GET /health` - Health check (verifica conexão com banco)

## 🔧 Requisitos Operacionais

O sistema implementa requisitos operacionais definidos em `devops.md`:

### Health Check
- Endpoint `/health` verifica conexão com banco de dados
- Retorna status, timestamp, database status e uptime
- Essencial para monitoramento e alertas

### Graceful Shutdown
- Implementa shutdown signals (SIGINT, SIGTERM)
- Desconecta do banco de dados antes de encerrar
- Timeout de 10 segundos para forced shutdown
- Previna corrupção de dados em deploys

### Logging Estruturado
- Logs com Pino (JSON formatado)
- Request ID em cada requisição para rastreabilidade
- Contexto de ambiente e usuário
- Níveis: error, warn, info, debug

### Tratamento de Erros
- Captura de uncaught exceptions
- Captura de unhandled rejections
- Logs de erro com stack traces
- Respostas HTTP apropriadas

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Executar testes com coverage
```bash
npm run test:coverage
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor com ts-node
npm run build            # Compila TypeScript
npm start                # Inicia servidor compilado

# Prisma
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Cria e aplica migrations
npm run prisma:studio    # Abre Prisma Studio
npm run prisma:seed      # Popula banco com dados

# Testes
npm test                 # Executa testes
npm run test:watch       # Testes em modo watch
npm run test:coverage    # Testes com coverage

# Linting
npm run lint             # Verifica código com ESLint
npm run lint:fix         # Corrige problemas automaticamente
npm run format           # Formata código com Prettier
```

## 🔧 Configuração de Banco de Dados

### Opção 1: Usando Podman/Docker (Recomendado)

```bash
# Iniciar containers
podman-compose up -d

# Verificar status
podman-compose ps

# Ver logs
podman-compose logs -f

# Parar containers
podman-compose down
```

### Opção 2: Usando Docker

Se você tiver Docker em vez de Podman:

```bash
# Iniciar containers
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down
```

### Opção 3: PostgreSQL Local (Sem Containers)

Se você não tiver Podman ou Docker instalado, pode usar PostgreSQL localmente:

#### Windows

1. **Instale PostgreSQL**
   - Baixe o instalador em https://www.postgresql.org/download/windows/
   - Execute o instalador e siga as instruções
   - Anote a senha que você definir para o usuário `postgres`

2. **Crie o banco de dados**
   ```bash
   # Abra o SQL Shell (psql) do PostgreSQL
   # Entre com a senha do usuário postgres
   CREATE DATABASE ecommerce;
   \q
   ```

3. **Configure o .env**
   ```env
   DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/ecommerce?schema=public"
   ```

4. **Sincronize o schema**
   ```bash
   npm run prisma:generate
   npx prisma db push
   ```

5. **Popule com dados iniciais**
   ```bash
   npm run prisma:seed
   ```

#### macOS

1. **Instale PostgreSQL via Homebrew**
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. **Crie o banco de dados**
   ```bash
   createdb ecommerce
   ```

3. **Configure o .env**
   ```env
   DATABASE_URL="postgresql://$(whoami)@localhost:5432/ecommerce?schema=public"
   ```

4. **Sincronize o schema**
   ```bash
   npm run prisma:generate
   npx prisma db push
   ```

5. **Popule com dados iniciais**
   ```bash
   npm run prisma:seed
   ```

#### Linux (Ubuntu/Debian)

1. **Instale PostgreSQL**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Crie o banco de dados**
   ```bash
   sudo -u postgres createdb ecommerce
   ```

3. **Configure o .env**
   ```env
   DATABASE_URL="postgresql://postgres@localhost:5432/ecommerce?schema=public"
   ```

4. **Sincronize o schema**
   ```bash
   npm run prisma:generate
   npx prisma db push
   ```

5. **Popule com dados iniciais**
   ```bash
   npm run prisma:seed
   ```

### Opção 4: Serviço Gerenciado de Banco de Dados

Para produção ou desenvolvimento sem gerenciar o banco localmente, você pode usar serviços gerenciados:

- **Supabase** (gratuito para desenvolvimento)
- **Neon** (PostgreSQL serverless)
- **Railway** (PostgreSQL gerenciado)
- **AWS RDS** (produção)

**Exemplo com Supabase:**
1. Crie uma conta em https://supabase.com
2. Crie um novo projeto
3. Copie a connection string do dashboard
4. Configure no `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"
   ```
5. Sincronize o schema:
   ```bash
   npm run prisma:generate
   npx prisma db push
   ```

### Redis (Opcional)

O Redis é opcional para cache e idempotência. O sistema funciona sem ele, mas perde essas funcionalidades.

#### Com Podman/Docker
Já está configurado no `docker-compose.yml`

#### Localmente
```bash
# Windows
# Baixe e instale de https://redis.io/download

# macOS
brew install redis
brew services start redis

# Linux
sudo apt install redis-server
sudo systemctl start redis
```

Configure no `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

Para mais detalhes, veja [DATABASE_SETUP.md](DATABASE_SETUP.md)

## 🤝 Como Contribuir

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Convenção de Commits

Seguimos a convenção de commits:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, ponto e vírgula, etc.
- `refactor:` Refatoração de código
- `test:` Adiciona ou modifica testes
- `chore:` Atualização de ferramentas, configurações, etc.

## 📄 Documentação Adicional

- [Plan.md](plan.md) - Plano arquitetural detalhado
- [Spec.md](spec.md) - Especificações técnicas
- [Tasks.md](tasks.md) - Backlog de tarefas
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Guia de configuração do banco
- [GIT_WORKFLOW.md](GIT_WORKFLOW.md) - Diretrizes de Git para colaboração
- [AGENTES.md](AGENTES.md) - Documentação dos agentes

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se PostgreSQL está rodando
- Verifique `DATABASE_URL` no `.env`
- Tente `podman-compose ps` para ver status dos containers

### Erro: "ts-node: command not found"
- Rode `npm install`
- Verifique se `node_modules` existe

### Erro: "Module not found"
- Rode `npm install`
- Verifique se `tsconfig.json` está configurado corretamente

### Porta 3000 já em uso
- Matar processo: `taskkill //F //IM node.exe` (Windows)
- Ou mudar PORT no `.env`

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos.

## 👥 Equipe

Desenvolvido como projeto final da disciplina M11.

---

**Nota**: Este projeto está em desenvolvimento ativo. Funcionalidades marcadas como "Pendente" ainda não foram implementadas.
