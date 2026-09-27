# Tasks: Plataforma de E-commerce para Produtos Personalizados

## Status Atual

### ✅ Concluído

#### Fase 1: Configuração e Infraestrutura Base
- ✅ Configurar projeto Node.js com TypeScript
- ✅ Configurar Prisma ORM com PostgreSQL
- ✅ Configurar estrutura de pastas do monolito modular
- ✅ Configurar Docker e Docker Compose (Podman)
- ✅ Configurar sistema de logs (Pino)
- ✅ Configurar Swagger para documentação
- ✅ Configurar ambiente de testes (Jest + Supertest)

#### Fase 2: Domínio de Autenticação
- ✅ Implementar schema de usuários e roles no Prisma
- ✅ Implementar serviço de autenticação JWT
- ✅ Implementar middleware de autorização RBAC
- ✅ Implementar endpoints de login/registro

#### Fase 3: Domínio de Estoque
- ✅ Implementar schema de insumos e reservas
- ✅ Implementar Repository Pattern para estoque
- ✅ Implementar Service Layer com lock otimista
- ✅ Implementar endpoints CRUD de insumos
- ✅ Implementar endpoint de consulta de disponibilidade

#### Fase 4: Domínio de Catálogo
- ✅ Implementar schema de produtos e categorias
- ✅ Implementar Repository Pattern para catálogo
- ✅ Implementar Service Layer para catálogo
- ✅ Implementar endpoints de listagem de produtos
- ✅ Implementar gerenciamento de fotos de produtos (upload, validação, serving)

#### Fase 5: Integrações Externas
- ✅ Implementar cliente ViaCEP com circuit breaker
- ✅ Implementar cliente API de Feriados com circuit breaker
- ✅ Implementar retry com exponential backoff
- ✅ Implementar fallback para cálculo de frete
- ✅ Implementar fallback para cálculo de prazos

#### Fase 6: Domínio de Pedidos - Parte 1
- ✅ Implementar schema de pedidos e status
- ✅ Implementar Repository Pattern para pedidos
- ✅ Implementar DTOs para transferência de dados
- ✅ Implementar endpoints de criação de pedido

#### Fase 7: Domínio de Pedidos - Parte 2 (Saga)
- ✅ Implementar coordenador de saga
- ✅ Implementar passo de reserva de materiais
- ✅ Implementar passo de cálculo de frete
- ✅ Implementar passo de criação de pedido
- ✅ Implementar compensação em caso de falha
- ✅ Implementar transações de banco de dados

### ⏳ Em Progresso
- Nenhuma fase em progresso

### 📋 Pendente
- Fase 8: Upload de Personalizações
- Fase 9: Fluxo de Aprovação
- Fase 10: Domínio de Produção
- Fase 11: Geração de QR Code
- Fases 12-18: Frontend
- Fase 19: Testes e QA

## Backlog

### Fase 1: Configuração e Infraestrutura Base
- Configurar projeto Node.js com TypeScript
- Configurar Prisma ORM com PostgreSQL
- Configurar estrutura de pastas do monolito modular
- Configurar Docker e Docker Compose
- Configurar sistema de logs (Pino)
- Configurar Swagger para documentação
- Configurar ambiente de testes (Jest + Supertest)

### Fase 2: Domínio de Autenticação
- Implementar schema de usuários e roles no Prisma
- Implementar serviço de autenticação JWT
- Implementar middleware de autorização RBAC
- Implementar middleware de idempotência
- Implementar endpoints de login/registro
- Implementar refresh token (opcional)

### Fase 3: Domínio de Estoque
- Implementar schema de insumos e reservas
- Implementar Repository Pattern para estoque
- Implementar Service Layer com lock otimista
- Implementar alertas de estoque mínimo
- Implementar endpoints CRUD de insumos
- Implementar endpoint de consulta de disponibilidade

### Fase 4: Domínio de Catálogo
- Implementar schema de produtos e categorias
- Implementar Repository Pattern para catálogo
- Implementar Service Layer para catálogo
- Implementar endpoints de listagem de produtos
- Implementar cache de catálogo (Redis ou memória)
- Implementar validação de complexidade de produto

### Fase 5: Integrações Externas
- Implementar cliente ViaCEP com circuit breaker
- Implementar cliente API de Feriados com circuit breaker
- Implementar retry com exponential backoff
- Implementar fallback para cálculo de frete
- Implementar fallback para cálculo de prazos
- Implementar cache Redis para CEPs e feriados
- Implementar bulkhead para thread pools

### Fase 6: Domínio de Pedidos - Parte 1
- Implementar schema de pedidos e status
- Implementar Repository Pattern para pedidos
- Implementar Factory Pattern para criação de pedidos
- Implementar DTOs para transferência de dados
- Implementar validação com Zod
- Implementar endpoints de criação de pedido

### Fase 7: Domínio de Pedidos - Parte 2 (Saga)
- Implementar coordenador de saga
- Implementar passo de reserva de materiais
- Implementar passo de cálculo de frete
- Implementar passo de criação de pedido
- Implementar compensação em caso de falha
- Implementar transações de banco de dados

### Fase 8: Upload de Personalizações
- Implementar middleware de upload com Multer
- Implementar validação de MIME type real
- Implementar validação de tamanho (máx 10MB)
- Implementar validação de resolução (300dpi)
- Implementar sanitização de paths
- Implementar estrutura hierárquica de storage
- Implementar geração de thumbnails
- Implementar compressão de imagens
- Implementar middleware de autenticação para arquivos

### Fase 9: Fluxo de Aprovação
- Implementar schema de aprovações
- Implementar endpoints de upload de personalização
- Implementar endpoints de aprovação/rejeição
- Implementar notificações de status
- Implementar histórico de alterações

### Fase 10: Domínio de Produção
- Implementar schema de fila de produção
- Implementar Repository Pattern para produção
- Implementar Service Layer para produção
- Implementar endpoints de gestão de fila
- Implementar atualização de etapas de manufatura
- Implementar bloqueio de edição após aprovação

### Fase 11: Geração de QR Code
- Implementar biblioteca de geração de QR Code
- Implementar endpoint de geração por pedido
- Implementar armazenamento de QR Codes
- Implementar URL de rastreamento
- Implementar página de rastreamento

### Fase 12: Frontend - Configuração
- Configurar projeto React com TypeScript e Vite
- Configurar Zustand para state management
- Configurar Axios para HTTP client
- Configurar React Hook Form + Zod
- Configurar biblioteca de UI (shadcn/ui)
- Configurar rotas com React Router

### Fase 13: Frontend - Autenticação
- Implementar tela de login
- Implementar tela de registro
- Implementar contexto de autenticação
- Implementar proteção de rotas
- Implementar refresh de token

### Fase 14: Frontend - Catálogo
- Implementar listagem de produtos
- Implementar filtros e busca
- Implementar detalhes do produto
- Implementar carrinho de compras
- Implementar cálculo de frete no frontend

### Fase 15: Frontend - Personalização
- Implementar formulário de personalização
- Implementar upload de imagens
- Implementar preview de personalização
- Implementar validação de upload
- Implementar progresso de upload

### Fase 16: Frontend - Pedidos
- Implementar tela de checkout
- Implementar confirmação de pedido
- Implementar lista de pedidos
- Implementar detalhes do pedido
- Implementar status em tempo real

### Fase 17: Frontend - Rastreamento
- Implementar scanner de QR Code
- Implementar página de rastreamento
- Implementar visualização de status
- Implementar histórico de produção

### Fase 18: Frontend - Admin
- Implementar dashboard administrativo
- Implementar gestão de estoque
- Implementar gestão de fila de produção
- Implementar aprovação de personalizações
- Implementar relatórios básicos

### Fase 19: Testes e QA
- Implementar testes unitários de serviços
- Implementar testes de integração de APIs
- Implementar testes de saga de criação de pedido
- Implementar testes de concorrência no estoque
- Implementar testes de validação de upload
- Implementar testes E2E com Cypress

## Tarefas Detalhadas

### Fase 1: Configuração e Infraestrutura Base

#### Tarefa 1.1: Configurar projeto Node.js com TypeScript
- Inicializar projeto com `npm init`
- Instalar TypeScript e configurar `tsconfig.json`
- Configurar ESLint e Prettier
- Configurar scripts de build e dev
- Configurar variáveis de ambiente com `.env`
- **Estimativa**: 4 horas
- **Dependências**: Nenhuma

#### Tarefa 1.2: Configurar Prisma ORM com PostgreSQL
- Instalar Prisma CLI e client
- Configurar connection string no `.env`
- Inicializar Prisma com `prisma init`
- Configurar schema inicial
- Criar primeira migration
- **Estimativa**: 6 horas
- **Dependências**: Tarefa 1.1, PostgreSQL instalado

#### Tarefa 1.3: Configurar estrutura de pastas do monolito modular
- Criar estrutura: `src/domains/{auth,orders,production,inventory,integrations}`
- Criar camadas: `repositories`, `services`, `controllers`, `dto`
- Criar pasta `shared` para código comum
- Criar pasta `config` para configurações
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 1.1

#### Tarefa 1.4: Configurar Docker e Docker Compose
- Criar `Dockerfile` para backend
- Criar `docker-compose.yml` com PostgreSQL e Redis
- Configurar volumes para persistência
- Configurar network para comunicação entre containers
- Testar build e startup
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 1.2

#### Tarefa 1.5: Configurar sistema de logs (Pino)
- Instalar Pino e pino-pretty
- Configurar logger global
- Criar middleware de logging para Express/Fastify
- Configurar níveis de log (error, warn, info, debug)
- Configurar output para arquivo em produção
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 1.1

#### Tarefa 1.6: Configurar Swagger para documentação
- Instalar swagger-ui-express e swagger-jsdoc
- Configurar Swagger no Express/Fastify
- Criar estrutura de documentação por endpoint
- Configurar autenticação na documentação
- Testar interface Swagger UI
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 1.1

#### Tarefa 1.7: Configurar ambiente de testes (Jest + Supertest)
- Instalar Jest e Supertest
- Configurar Jest para TypeScript
- Criar estrutura de pastas de testes
- Configurar mocks e fixtures
- Criar teste exemplo
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 1.1

### Fase 2: Domínio de Autenticação

#### Tarefa 2.1: Implementar schema de usuários e roles no Prisma
- Criar model `User` com campos: id, email, password, name, role
- Criar model `Role` com campos: id, name, permissions
- Criar relação entre User e Role
- Adicionar índices para email
- Criar migration
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 1.2

#### Tarefa 2.2: Implementar serviço de autenticação JWT
- Instalar jsonwebtoken e bcrypt
- Criar `AuthService` com métodos: login, register, verifyToken
- Implementar hash de senha com bcrypt
- Implementar geração de token JWT (expiração 1h)
- Implementar validação de token
- **Estimativa**: 6 horas
- **Dependências**: Tarefa 2.1

#### Tarefa 2.3: Implementar middleware de autorização RBAC
- Criar middleware `authMiddleware` para validar JWT
- Criar middleware `roleMiddleware` para verificar roles
- Implementar verificação de permissões
- Adicionar middleware às rotas protegidas
- Testar cenários de autorização
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 2.2

#### Tarefa 2.4: Implementar middleware de idempotência
- Criar middleware `idempotencyMiddleware`
- Implementar cache Redis para tracking de requests
- Validar header de idempotência
- Retornar resposta cacheada se existir
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 1.4, Tarefa 2.3

#### Tarefa 2.5: Implementar endpoints de login/registro
- Criar controller `AuthController`
- Implementar endpoint POST /auth/register
- Implementar endpoint POST /auth/login
- Implementar validação de input com Zod
- Adicionar documentação Swagger
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 2.2, Tarefa 2.3

#### Tarefa 2.6: Implementar refresh token (opcional)
- Adicionar campo `refreshToken` no schema User
- Implementar geração de refresh token
- Implementar endpoint POST /auth/refresh
- Implementar rotação de refresh token
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 2.2

### Fase 3: Domínio de Estoque

#### Tarefa 3.1: Implementar schema de insumos e reservas
- Criar model `Material` com campos: id, name, quantity, minLevel, version
- Criar model `MaterialReservation` com campos: id, materialId, orderId, quantity
- Criar relação entre Material e MaterialReservation
- Adicionar índice para version (lock otimista)
- Criar migration
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 1.2

#### Tarefa 3.2: Implementar Repository Pattern para estoque
- Criar interface `IMaterialRepository`
- Implementar `MaterialRepository` com Prisma
- Implementar métodos: findById, findAll, create, update, delete
- Implementar método de reserva com lock otimista
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 3.1

#### Tarefa 3.3: Implementar Service Layer com lock otimista
- Criar `MaterialService`
- Implementar lógica de reserva com version check
- Implementar rollback em caso de conflito
- Implementar verificação de estoque mínimo
- Implementar alerta quando estoque < minLevel
- **Estimativa**: 6 horas
- **Dependências**: Tarefa 3.2

#### Tarefa 3.4: Implementar alertas de estoque mínimo
- Criar job agendado para verificar estoque
- Implementar envio de alerta (log ou notificação)
- Configurar frequência da verificação
- Testar geração de alertas
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 3.3

#### Tarefa 3.5: Implementar endpoints CRUD de insumos
- Criar controller `MaterialController`
- Implementar endpoints: GET, POST, PUT, DELETE /materials
- Implementar validação com Zod
- Adicionar middleware de autorização (Admin)
- Adicionar documentação Swagger
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 3.3, Tarefa 2.3

#### Tarefa 3.6: Implementar endpoint de consulta de disponibilidade
- Implementar endpoint GET /materials/availability
- Retornar quantidade disponível por material
- Considerar reservas pendentes
- Adicionar cache para consultas frequentes
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 3.3

### Fase 4: Domínio de Catálogo

#### Tarefa 4.1: Implementar schema de produtos e categorias
- Criar model `Category` com campos: id, name
- Criar model `Product` com campos: id, name, description, price, complexity, categoryId
- Criar relação entre Product e Category
- Adicionar índices para busca
- Criar migration
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 1.2

#### Tarefa 4.2: Implementar Repository Pattern para catálogo
- Criar interface `IProductRepository`
- Implementar `ProductRepository` com Prisma
- Implementar métodos: findById, findAll, findByCategory, search
- Implementar paginação
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 4.1

#### Tarefa 4.3: Implementar Service Layer para catálogo
- Criar `ProductService`
- Implementar lógica de busca com filtros
- Implementar validação de complexidade
- Implementar cache de produtos
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 4.2

#### Tarefa 4.4: Implementar endpoints de listagem de produtos
- Criar controller `ProductController`
- Implementar endpoint GET /products
- Implementar endpoint GET /products/:id
- Implementar endpoint GET /products/category/:categoryId
- Adicionar parâmetros de paginação e filtros
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 4.3

#### Tarefa 4.5: Implementar cache de catálogo
- Configurar Redis para cache de produtos
- Implementar cache-aside pattern
- Configurar TTL (ex: 1 hora)
- Implementar invalidação de cache em atualizações
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 1.4, Tarefa 4.3

#### Tarefa 4.6: Implementar validação de complexidade de produto
- Definir regras de complexidade (número de áreas, cores, etc.)
- Implementar validação no ProductService
- Documentar critérios de complexidade
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 4.3

### Fase 5: Integrações Externas

#### Tarefa 5.1: Implementar cliente ViaCEP com circuit breaker
- Criar `ViaCEPClient`
- Implementar chamada à API ViaCEP
- Implementar circuit breaker pattern
- Configurar timeout de 3s
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 1.1

#### Tarefa 5.2: Implementar cliente API de Feriados com circuit breaker
- Criar `HolidaysAPIClient`
- Implementar chamada à Brasil API
- Implementar circuit breaker pattern
- Configurar timeout de 2s
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 1.1

#### Tarefa 5.3: Implementar retry com exponential backoff
- Criar utilitário de retry
- Implementar exponential backoff (1s, 2s, 4s)
- Configurar número máximo de tentativas
- Integrar com clientes de API
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 5.1, Tarefa 5.2

#### Tarefa 5.4: Implementar fallback para cálculo de frete
- Criar tabela de estados com frete padrão
- Implementar lógica de fallback quando ViaCEP falha
- Retornar frete baseado em UF
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 5.1

#### Tarefa 5.5: Implementar fallback para cálculo de prazos
- Implementar cálculo de dias corridos quando API de feriados falha
- Considerar finais de semana
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 5.2

#### Tarefa 5.6: Implementar cache Redis para CEPs e feriados
- Configurar cache para CEPs (TTL 24h)
- Configurar cache para feriados (TTL 1 ano)
- Implementar cache-aside pattern
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 1.4, Tarefa 5.1, Tarefa 5.2

#### Tarefa 5.7: Implementar bulkhead para thread pools
- Configurar separação de thread pools
- Isolar chamadas de APIs externas
- Configurar limites de concorrência
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 5.1, Tarefa 5.2

### Fase 6: Domínio de Pedidos - Parte 1

#### Tarefa 6.1: Implementar schema de pedidos e status
- Criar enum `OrderStatus` (pending, approved, in_production, shipped, delivered, cancelled)
- Criar model `Order` com campos: id, userId, status, total, freight, deliveryDate
- Criar model `OrderItem` com campos: id, orderId, productId, quantity, price
- Criar relações entre Order e OrderItem
- Criar migration
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 1.2

#### Tarefa 6.2: Implementar Repository Pattern para pedidos
- Criar interface `IOrderRepository`
- Implementar `OrderRepository` com Prisma
- Implementar métodos: findById, findAll, findByUser, create, update
- Implementar transações para operações complexas
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 6.1

#### Tarefa 6.3: Implementar Factory Pattern para criação de pedidos
- Criar `OrderFactory`
- Implementar método para criar pedido a partir de DTO
- Validar dados de entrada
- Calcular totais
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 6.1

#### Tarefa 6.4: Implementar DTOs para transferência de dados
- Criar DTOs para criação de pedido
- Criar DTOs para atualização de pedido
- Criar DTOs para resposta de pedido
- Implementar validação com Zod
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 6.1

#### Tarefa 6.5: Implementar validação com Zod
- Criar schemas de validação para todos os DTOs
- Implementar middleware de validação
- Testar validação com dados inválidos
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 6.4

#### Tarefa 6.6: Implementar endpoints de criação de pedido
- Criar controller `OrderController`
- Implementar endpoint POST /orders
- Implementar endpoint GET /orders
- Implementar endpoint GET /orders/:id
- Adicionar middleware de autenticação
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 6.3, Tarefa 2.3

### Fase 7: Domínio de Pedidos - Parte 2 (Saga)

#### Tarefa 7.1: Implementar coordenador de saga
- Criar `OrderSagaCoordinator`
- Definir passos da saga
- Implementar orquestração de passos
- Implementar tratamento de erros
- **Estimativa**: 6 horas
- **Dependências**: Tarefa 6.2

#### Tarefa 7.2: Implementar passo de reserva de materiais
- Criar `ReserveMaterialsStep`
- Integrar com MaterialService
- Implementar compensação (liberar reserva)
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 3.3, Tarefa 7.1

#### Tarefa 7.3: Implementar passo de cálculo de frete
- Criar `CalculateFreightStep`
- Integrar com ViaCEPClient
- Implementar compensação
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 5.1, Tarefa 7.1

#### Tarefa 7.4: Implementar passo de criação de pedido
- Criar `CreateOrderStep`
- Integrar com OrderRepository
- Implementar compensação (cancelar pedido)
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 6.2, Tarefa 7.1

#### Tarefa 7.5: Implementar compensação em caso de falha
- Implementar lógica de rollback para cada passo
- Garantir consistência eventual
- Logar falhas para auditoria
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 7.2, Tarefa 7.3, Tarefa 7.4

#### Tarefa 7.6: Implementar transações de banco de dados
- Configurar transações no Prisma
- Envolver passos da saga em transação
- Implementar rollback em caso de erro
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 7.1

### Fase 8: Upload de Personalizações

#### Tarefa 8.1: Implementar middleware de upload com Multer
- Instalar Multer
- Configurar storage local
- Criar estrutura de pastas `uploads/pedidos/{pedido_id}/`
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 1.1

#### Tarefa 8.2: Implementar validação de MIME type real
- Implementar verificação de magic bytes
- Validar MIME type além da extensão
- Rejeitar arquivos inválidos
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 8.1

#### Tarefa 8.3: Implementar validação de tamanho (máx 10MB)
- Configurar limite de tamanho no Multer
- Implementar validação adicional
- Retornar erro claro para usuário
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 8.1

#### Tarefa 8.4: Implementar validação de resolução (300dpi)
- Instalar sharp ou imagemagick
- Implementar verificação de resolução
- Rejeitar imagens abaixo de 300dpi
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 8.1

#### Tarefa 8.5: Implementar sanitização de paths
- Validar e sanitizar nomes de arquivos
- Prevenir path traversal
- Usar nomes seguros (UUID)
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 8.1

#### Tarefa 8.6: Implementar estrutura hierárquica de storage
- Criar pasta `uploads/pedidos/{pedido_id}/personalizacao/`
- Criar pasta `uploads/pedidos/{pedido_id}/thumbnails/`
- Criar pasta `uploads/qrcodes/`
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 8.1

#### Tarefa 8.7: Implementar geração de thumbnails
- Implementar geração automática de thumbnails
- Configurar tamanho (ex: 200x200)
- Salvar na pasta de thumbnails
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 8.4

#### Tarefa 8.8: Implementar compressão de imagens
- Implementar compressão para reduzir tamanho
- Manter qualidade aceitável
- Suportar JPG, PNG, WEBP
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 8.4

#### Tarefa 8.9: Implementar middleware de autenticação para arquivos
- Criar middleware para servir arquivos
- Validar token JWT
- Verificar permissão de acesso ao arquivo
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 2.3

### Fase 9: Fluxo de Aprovação

#### Tarefa 9.1: Implementar schema de aprovações
- Criar model `Approval` com campos: id, orderId, status, approvedBy, approvedAt, rejectionReason
- Criar relação com Order
- Criar migration
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 6.1

#### Tarefa 9.2: Implementar endpoints de upload de personalização
- Implementar endpoint POST /orders/:id/customization
- Integrar com middleware de upload
- Salvar metadados no banco
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 8.1, Tarefa 6.6

#### Tarefa 9.3: Implementar endpoints de aprovação/rejeição
- Implementar endpoint POST /orders/:id/approve
- Implementar endpoint POST /orders/:id/reject
- Atualizar status do pedido
- Registrar quem aprovou/rejeitou
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 9.1, Tarefa 2.3

#### Tarefa 9.4: Implementar notificações de status
- Implementar sistema de notificações (WebSocket ou polling)
- Notificar cliente sobre mudanças de status
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 9.3

#### Tarefa 9.5: Implementar histórico de alterações
- Criar model `OrderHistory` com campos: id, orderId, status, changedAt, changedBy
- Registrar todas as mudanças de status
- Implementar endpoint GET /orders/:id/history
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 6.1

### Fase 10: Domínio de Produção

#### Tarefa 10.1: Implementar schema de fila de produção
- Criar model `ProductionQueue` com campos: id, orderId, stage, startedAt, completedAt
- Criar enum `ProductionStage` (pending, printing, cutting, assembly, quality_check, packaging, shipped)
- Criar relação com Order
- Criar migration
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 6.1

#### Tarefa 10.2: Implementar Repository Pattern para produção
- Criar interface `IProductionRepository`
- Implementar `ProductionRepository` com Prisma
- Implementar métodos: findById, findAll, findByStage, updateStage
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 10.1

#### Tarefa 10.3: Implementar Service Layer para produção
- Criar `ProductionService`
- Implementar lógica de avanço de etapas
- Implementar validação de transições de estado
- Implementar cálculo de tempo estimado
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 10.2

#### Tarefa 10.4: Implementar endpoints de gestão de fila
- Criar controller `ProductionController`
- Implementar endpoint GET /production/queue
- Implementar endpoint GET /production/queue/:id
- Adicionar middleware de autorização (Admin)
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 10.3, Tarefa 2.3

#### Tarefa 10.5: Implementar atualização de etapas de manufatura
- Implementar endpoint PUT /production/queue/:id/stage
- Validar transição de etapa
- Atualizar timestamps
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 10.3

#### Tarefa 10.6: Implementar bloqueio de edição após aprovação
- Implementar verificação de status antes de permitir edição
- Bloquear upload de personalização após aprovação
- Retornar erro apropriado
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 9.3

### Fase 11: Geração de QR Code

#### Tarefa 11.1: Implementar biblioteca de geração de QR Code
- Instalar biblioteca `qrcode`
- Testar geração básica
- Configurar formato PNG
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 1.1

#### Tarefa 11.2: Implementar endpoint de geração por pedido
- Implementar endpoint GET /orders/:id/qrcode
- Gerar QR Code com URL de rastreamento
- Retornar imagem PNG
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 11.1, Tarefa 6.6

#### Tarefa 11.3: Implementar armazenamento de QR Codes
- Salvar QR Code em `uploads/qrcodes/{pedido_id}.png`
- Implementar cache para evitar regeneração
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 11.2

#### Tarefa 11.4: Implementar URL de rastreamento
- Definir padrão de URL: `https://dominio.com/rastreamento/{codigo}`
- Gerar código único por pedido
- **Estimativa**: 1 hora
- **Dependências**: Tarefa 6.1

#### Tarefa 11.5: Implementar página de rastreamento
- Implementar endpoint GET /rastreamento/:codigo
- Retornar status atual do pedido
- Retornar histórico de produção
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 11.4, Tarefa 10.3

### Fase 12: Frontend - Configuração

#### Tarefa 12.1: Configurar projeto React com TypeScript e Vite
- Criar projeto com Vite
- Configurar TypeScript
- Configurar ESLint e Prettier
- **Estimativa**: 2 horas
- **Dependências**: Nenhuma

#### Tarefa 12.2: Configurar Zustand para state management
- Instalar Zustand
- Criar store global
- Criar slices para auth, cart, orders
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 12.1

#### Tarefa 12.3: Configurar Axios para HTTP client
- Instalar Axios
- Configurar baseURL
- Configurar interceptors para token JWT
- Configurar tratamento de erros
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 12.1

#### Tarefa 12.4: Configurar React Hook Form + Zod
- Instalar React Hook Form e Zod
- Configurar integração
- Criar formulários exemplo
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 12.1

#### Tarefa 12.5: Configurar biblioteca de UI (shadcn/ui)
- Instalar shadcn/ui
- Configurar componentes base
- Configurar tema
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 12.1

#### Tarefa 12.6: Configurar rotas com React Router
- Instalar React Router
- Configurar rotas públicas e privadas
- Implementar proteção de rotas
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 12.2

### Fase 13: Frontend - Autenticação

#### Tarefa 13.1: Implementar tela de login
- Criar componente de login
- Integrar com React Hook Form
- Integrar com API de login
- Tratar erros
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 12.4, Tarefa 2.5

#### Tarefa 13.2: Implementar tela de registro
- Criar componente de registro
- Integrar com React Hook Form
- Integrar com API de registro
- Tratar erros
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 12.4, Tarefa 2.5

#### Tarefa 13.3: Implementar contexto de autenticação
- Criar AuthContext
- Gerenciar estado de autenticação
- Gerenciar token JWT
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 12.2

#### Tarefa 13.4: Implementar proteção de rotas
- Criar componente PrivateRoute
- Verificar autenticação
- Redirecionar para login se não autenticado
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 13.3, Tarefa 12.6

#### Tarefa 13.5: Implementar refresh de token
- Implementar lógica de refresh automático
- Tratar expiração de token
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 13.3, Tarefa 2.6

### Fase 14: Frontend - Catálogo

#### Tarefa 14.1: Implementar listagem de produtos
- Criar componente de lista de produtos
- Integrar com API de produtos
- Implementar paginação
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 12.3, Tarefa 4.4

#### Tarefa 14.2: Implementar filtros e busca
- Criar componente de filtros
- Implementar busca por nome
- Implementar filtro por categoria
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 14.1

#### Tarefa 14.3: Implementar detalhes do produto
- Criar componente de detalhes
- Mostrar informações completas
- Mostrar complexidade
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 14.1

#### Tarefa 14.4: Implementar carrinho de compras
- Criar slice de carrinho no Zustand
- Implementar adição/remoção de itens
- Implementar cálculo de total
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 12.2

#### Tarefa 14.5: Implementar cálculo de frete no frontend
- Integrar com API de cálculo de frete
- Mostrar frete estimado
- Atualizar ao mudar CEP
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 12.3, Tarefa 5.1

### Fase 15: Frontend - Personalização

#### Tarefa 15.1: Implementar formulário de personalização
- Criar componente de formulário
- Integrar com React Hook Form
- Validar campos
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 12.4

#### Tarefa 15.2: Implementar upload de imagens
- Implementar componente de upload
- Mostrar preview
- Validar tamanho e formato
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 15.1, Tarefa 8.1

#### Tarefa 15.3: Implementar preview de personalização
- Criar componente de preview
- Mostrar imagem enviada
- Mostrar thumbnail
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 15.2

#### Tarefa 15.4: Implementar validação de upload
- Validar MIME type no cliente
- Validar tamanho no cliente
- Mostrar erros claros
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 15.2

#### Tarefa 15.5: Implementar progresso de upload
- Mostrar barra de progresso
- Atualizar em tempo real
- Tratar cancelamento
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 15.2

### Fase 16: Frontend - Pedidos

#### Tarefa 16.1: Implementar tela de checkout
- Criar componente de checkout
- Mostrar resumo do pedido
- Mostrar frete
- Confirmar pedido
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 14.4, Tarefa 6.6

#### Tarefa 16.2: Implementar confirmação de pedido
- Mostrar tela de sucesso
- Mostrar código do pedido
- Enviar para lista de pedidos
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 16.1

#### Tarefa 16.3: Implementar lista de pedidos
- Criar componente de lista
- Integrar com API de pedidos
- Mostrar status
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 12.3, Tarefa 6.6

#### Tarefa 16.4: Implementar detalhes do pedido
- Criar componente de detalhes
- Mostrar itens
- Mostrar status
- Mostrar personalização
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 16.3

#### Tarefa 16.5: Implementar status em tempo real
- Implementar polling ou WebSocket
- Atualizar status automaticamente
- Notificar mudanças
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 16.4, Tarefa 9.4

### Fase 17: Frontend - Rastreamento

#### Tarefa 17.1: Implementar scanner de QR Code
- Instalar biblioteca de scanner
- Criar componente de scanner
- Integrar com câmera
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 12.1

#### Tarefa 17.2: Implementar página de rastreamento
- Criar página de rastreamento
- Aceitar código ou QR Code
- Buscar pedido
- **Estimativa**: 3 horas
- **Dependências**: Tarefa 17.1, Tarefa 11.5

#### Tarefa 17.3: Implementar visualização de status
- Mostrar status atual
- Mostrar etapas de produção
- Mostrar timeline
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 17.2

#### Tarefa 17.4: Implementar histórico de produção
- Mostrar histórico completo
- Mostrar timestamps
- **Estimativa**: 2 horas
- **Dependências**: Tarefa 17.3

### Fase 18: Frontend - Admin

#### Tarefa 18.1: Implementar dashboard administrativo
- Criar layout admin
- Mostrar métricas básicas
- Mostrar pedidos recentes
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 12.6

#### Tarefa 18.2: Implementar gestão de estoque
- Criar tela de gestão de materiais
- Listar materiais
- Adicionar/editar/remover materiais
- Mostrar alertas de estoque baixo
- **Estimativa**: 6 horas
- **Dependências**: Tarefa 18.1, Tarefa 3.5

#### Tarefa 18.3: Implementar gestão de fila de produção
- Criar tela de fila de produção
- Mostrar pedidos em produção
- Avançar etapas
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 18.1, Tarefa 10.4

#### Tarefa 18.4: Implementar aprovação de personalizações
- Criar tela de aprovações
- Mostrar personalizações pendentes
- Aprovar/rejeitar com motivo
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 18.1, Tarefa 9.3

#### Tarefa 18.5: Implementar relatórios básicos
- Criar tela de relatórios
- Mostrar vendas por período
- Mostrar produtos mais vendidos
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 18.1

### Fase 19: Testes e QA

#### Tarefa 19.1: Implementar testes unitários de serviços
- Criar testes para AuthService
- Criar testes para MaterialService
- Criar testes para ProductService
- Criar testes para OrderService
- **Estimativa**: 8 horas
- **Dependências**: Tarefa 1.7, Tarefas de serviços

#### Tarefa 19.2: Implementar testes de integração de APIs
- Criar testes para endpoints de autenticação
- Criar testes para endpoints de pedidos
- Criar testes para endpoints de estoque
- **Estimativa**: 6 horas
- **Dependências**: Tarefa 1.7, Tarefas de controllers

#### Tarefa 19.3: Implementar testes de saga de criação de pedido
- Criar teste para fluxo completo da saga
- Testar compensação em falhas
- Testar transações
- **Estimativa**: 5 horas
- **Dependências**: Tarefa 7.1

#### Tarefa 19.4: Implementar testes de concorrência no estoque
- Criar teste de carga simultânea
- Verificar lock otimista
- Testar race conditions
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 3.3

#### Tarefa 19.5: Implementar testes de validação de upload
- Testar upload de arquivos válidos
- Testar upload de arquivos inválidos
- Testar validação de MIME type
- Testar validação de tamanho
- **Estimativa**: 4 horas
- **Dependências**: Tarefa 8.1

#### Tarefa 19.6: Implementar testes E2E com Cypress
- Configurar Cypress
- Criar teste de fluxo de compra completo
- Criar teste de fluxo de aprovação
- Criar teste de rastreamento
- **Estimativa**: 8 horas
- **Dependências**: Tarefa 12.1

### Nota sobre DevOps
As tarefas de DevOps e Produção foram movidas para o contexto do agente DevOps.
Consulte `DevOps-agent.md` e `devops.md` para detalhes de infraestrutura, deploy e operações.
- **Dependências**: Tarefa 20.5

## Dependências

### Dependências Externas
- **PostgreSQL 14+**: Banco de dados relacional
- **Redis**: Cache e idempotência (opcional para MVP)
- **Node.js 18+**: Runtime do backend
- **Docker**: Containerização para desenvolvimento

### Dependências de Desenvolvimento
- **ViaCEP API**: API de endereços (externa)
- **Brasil API**: API de feriados (externa)

### Dependências entre Fases
- Fase 1 (Infraestrutura) deve ser completada antes de todas as outras fases
- Fase 2 (Autenticação) deve ser completada antes das fases 3-11 (Backend)
- Fase 5 (Integrações) deve ser completada antes da Fase 7 (Saga)
- Fase 6 (Pedidos Parte 1) deve ser completada antes da Fase 7 (Saga)
- Fase 8 (Upload) deve ser completada antes da Fase 9 (Aprovação)
- Fase 12 (Frontend Config) deve ser completada antes das fases 13-18 (Frontend)
- Fase 19 (Testes) pode ser desenvolvida em paralelo com as fases de implementação
- Fase 20 (DevOps) deve ser a última fase

## Estimativas

### Estimativa por Fase
- **Fase 1: Configuração e Infraestrutura Base**: 27 horas (~3.5 dias)
- **Fase 2: Domínio de Autenticação**: 25 horas (~3 dias)
- **Fase 3: Domínio de Estoque**: 22 horas (~3 dias)
- **Fase 4: Domínio de Catálogo**: 21 horas (~2.5 dias)
- **Fase 5: Integrações Externas**: 24 horas (~3 dias)
- **Fase 6: Domínio de Pedidos - Parte 1**: 23 horas (~3 dias)
- **Fase 7: Domínio de Pedidos - Parte 2 (Saga)**: 25 horas (~3 dias)
- **Fase 8: Upload de Personalizações**: 26 horas (~3.5 dias)
- **Fase 9: Fluxo de Aprovação**: 14 horas (~2 dias)
- **Fase 10: Domínio de Produção**: 19 horas (~2.5 dias)
- **Fase 11: Geração de QR Code**: 11 horas (~1.5 dias)
- **Fase 12: Frontend - Configuração**: 17 horas (~2 dias)
- **Fase 13: Frontend - Autenticação**: 16 horas (~2 dias)
- **Fase 14: Frontend - Catálogo**: 18 horas (~2.5 dias)
- **Fase 15: Frontend - Personalização**: 17 horas (~2 dias)
- **Fase 16: Frontend - Pedidos**: 20 horas (~2.5 dias)
- **Fase 17: Frontend - Rastreamento**: 14 horas (~2 dias)
- **Fase 18: Frontend - Admin**: 25 horas (~3 dias)
- **Fase 19: Testes e QA**: 35 horas (~4.5 dias)

### Estimativa Total
- **Backend (Fases 1-11)**: ~237 horas (~30 dias)
- **Frontend (Fases 12-18)**: ~127 horas (~16 dias)
- **Testes (Fase 19)**: ~35 horas (~4.5 dias)
- **Total**: ~399 horas (~50 dias úteis)

### Notas sobre Estimativas
- Estimativas assumem 1 desenvolvedor trabalhando 8 horas/dia
- Fases de Backend e Frontend podem ser desenvolvidas em paralelo por 2 desenvolvedores
- Testes podem ser desenvolvidos em paralelo com implementação
- Estimativas não incluem tempo para reuniões, code review e correção de bugs
- Perguntas em aberto do plan.md devem ser respondidas para refinar estimativas
- Tarefas de DevOps foram movidas para o contexto do agente DevOps (consulte DevOps-agent.md)

## Atualização Recente (Setembro 2026)

### Conclusões Adicionais Além do Backlog
- **Gerenciamento de Fotos do Catálogo**: Implementado upload, validação (Sharp), serving público
- **Correção de Compatibilidade Node.js**: Atualizado para Node.js 20+ para suportar dependências modernas
- **Resolução de Problema de Networking**: Múltiplos processos Node.js causando conflitos na porta 3000
- **Docker Compose Atualizado**: Incluindo serviço backend com volume para uploads
- **Testes Configurados**: Jest com setup de banco de dados e timeout aumentado

### Status do Servidor
- ✅ Servidor rodando em http://localhost:3000
- ✅ Banco de dados PostgreSQL conectado via Podman
- ✅ Endpoints funcionando e testáveis via navegador
- ✅ Produtos com fotos retornando corretamente do banco
