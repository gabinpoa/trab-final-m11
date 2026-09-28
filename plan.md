# Plan: Plataforma de E-commerce para Produtos Personalizados

## Visão Geral
Implementar uma plataforma monolítica modular para gestão de pedidos de produtos personalizados, com foco no MVP que inclui autenticação, catálogo com fotos de produtos, upload de personalizações, fluxo de aprovação, fila de produção e rastreabilidade via QR Code. O sistema deve garantir consistência de dados através de padrões de saga, resiliência na integração com APIs externas, e controle de estoque básico.

## Decisões Arquiteturais

### Arquitetura Geral
- **Padrão Arquitetural**: Monolito Modular com separação por domínio (pedidos, produção, estoque, autenticação, catálogo)
- **Padrão de Saga**: Orchestration Pattern com coordenador central para gerenciar transações distribuídas (reserva de materiais → cálculo de frete → criação de pedido)
- **Controle de Concorrência**: Lock otimista no estoque usando versionamento de registros para evitar race conditions
- **Organização de Storage**: Estrutura hierárquica separada por tipo de conteúdo:
  - `uploads/products/` - Fotos do catálogo (JPG, PNG, WEBP, máx 5MB)
  - `uploads/customizations/` - Personalizações de clientes (JPG, PNG, WEBP, PDF, máx 10MB)
  - `uploads/qrcodes/` - QR Codes de rastreamento

### Estrutura de Domínios
- **Domínio de Catálogo**: Gerencia produtos, categorias e fotos do catálogo
- **Domínio de Pedidos**: Gerencia ciclo de vida do pedido, status e aprovações
- **Domínio de Produção**: Controla fila de produção e etapas de manufatura
- **Domínio de Estoque**: Gerencia insumos, reservas e alertas de nível mínimo
- **Domínio de Autenticação**: Sistema de autenticação e controle de acesso
- **Domínio de Integrações**: ViaCEP, API de Feriados, geração de QR Code

### Padrões de Design
- **Repository Pattern**: Abstração de acesso a dados para cada domínio
- **Service Layer**: Lógica de negócio isolada dos controladores
- **DTO Pattern**: Transferência de dados entre camadas com validação
- **Factory Pattern**: Criação de pedidos e objetos complexos
- **Strategy Pattern**: Cálculo de prazos dinâmicos baseado em diferentes fatores

### Segurança
- **Autenticação**: Sistema de autenticação com tokens de expiração de 1 hora
- **Autorização**: Middleware de autorização baseado em roles (Admin/User)
- **Prevenção de Duplicação**: Header obrigatório com armazenamento em cache Redis ou memória
- **Validação de Upload**: Verificação de MIME type real, não apenas extensão
- **Sanitização de Paths**: Prevenção de path traversal em uploads

### Resiliência
- **Circuit Breaker**: Para APIs externas (ViaCEP, Feriados)
- **Retry com Exponential Backoff**: Para erros transitórios (5xx)
- **Timeout Configurável**: Máximo 5s para chamadas externas
- **Fallback**: Cálculo de prazos sem API de feriados (dias corridos)
- **Bulkhead**: Separação de thread pools para integrações externas

## Tecnologias

### Backend
- **Runtime**: Node.js 18+ (LTS)
- **Linguagem**: TypeScript 5+
- **Framework**: Express.js ou Fastify (Fastify recomendado por performance)
- **ORM**: Prisma ou TypeORM (Prisma recomendado por type-safety)
- **Validação**: Zod ou Joi (Zod recomendado por integração com TypeScript)
- **Autenticação**: jsonwebtoken + bcrypt
- **Upload**: Multer com storage local
- **Processamento de Imagens**: sharp (validação de resolução, compressão)
- **QR Code**: qrcode library
- **Documentação**: swagger-ui-express + swagger-jsdoc
- **Logs**: Winston ou Pino (Pino recomendado por performance)
- **Testes**: Jest + Supertest

### Frontend
- **Framework**: React 18+ com TypeScript
- **Build Tool**: Vite
- **State Management**: Context API ou Zustand (Zustand recomendado por simplicidade)
- **HTTP Client**: Axios
- **Formulários**: React Hook Form + Zod
- **UI Components**: Material UI, Chakra UI ou shadcn/ui
- **QR Code Scanner**: react-qr-reader ou html5-qrcode
- **Testes**: Vitest + React Testing Library + MSW

### Banco de Dados
- **SGBD**: PostgreSQL 14+ (recomendado sobre MySQL por features avançadas)
- **Migrations**: Prisma Migrate ou migrations manuais
- **Schema de Produtos**: Campo `imageUrl` obrigatório (não nullable) para armazenar path da foto
- **Constraint**: Check constraint para garantir que `imageUrl` não seja nulo ou vazio

### Infraestrutura de Desenvolvimento
- **Storage Local**: Sistema de arquivos com pasta `uploads/` organizada por tipo de conteúdo
  - `uploads/products/` - Fotos do catálogo (JPG, PNG, WEBP, máx 5MB)
  - `uploads/customizations/` - Personalizações de clientes (JPG, PNG, WEBP, PDF, máx 10MB)
  - `uploads/qrcodes/` - QR Codes de rastreamento
- **Cache**: Redis (opcional para idempotência e cache de catálogo)
- **Containerização**: Docker + Docker Compose para desenvolvimento

## Integrações

### ViaCEP (API de Endereços)
- **Endpoint**: `https://viacep.com.br/ws/{cep}/json/`
- **Uso**: Extração de Cidade e UF para cálculo de frete
- **Timeout**: 3 segundos
- **Retry**: 3 tentativas com exponential backoff (1s, 2s, 4s)
- **Fallback**: Tabela de estados com frete padrão se API falhar
- **Cache**: Redis com TTL de 24h para CEPs frequentes

### API de Feriados (Brasil API)
- **Endpoint**: `https://brasilapi.com.br/api/feriados/v1/{ano}`
- **Uso**: Cálculo de prazos desconsiderando feriados
- **Timeout**: 2 segundos
- **Retry**: 2 tentativas com exponential backoff
- **Fallback**: Considerar dias corridos se API falhar
- **Cache**: Redis com TTL de 1 ano (feriados são estáticos)

### Geração de QR Code
- **Biblioteca**: `qrcode` (Node.js) ou `qrcode.react` (Frontend)
- **Conteúdo**: URL pública de rastreamento: `https://dominio.com/rastreamento/{codigo}`
- **Formato**: PNG com tamanho 300x300px
- **Armazenamento**: Arquivo local em `uploads/qrcodes/{pedido_id}.png`

### Upload de Imagens
- **Validação**: MIME type real (magic bytes), tamanho máximo 10MB
- **Formatos Aceitos**: JPG, PNG, WEBP, PDF
- **Resolução Mínima**: 300dpi (validação via sharp ou imagemagick)
- **Estrutura**: `uploads/customizations/{pedido_id}/personalizacao.{ext}`
- **Thumbnails**: Geração automática de versão reduzida para preview
- **Otimização**: Compressão de imagens para reduzir tamanho de armazenamento

### Gerenciamento de Fotos do Catálogo
- **Validação**: MIME type real (magic bytes), tamanho máximo 5MB
- **Formatos Aceitos**: JPG, PNG, WEBP (PDF não permitido para fotos de produtos)
- **Resolução Mínima**: 72dpi para exibição web (validação via sharp)
- **Estrutura**: `uploads/products/{produto_id}/foto.{ext}`
- **Regra de Negócio**: Cada produto deve ter pelo menos uma foto obrigatória no cadastro
- **Múltiplas Fotos**: MVP suporta apenas uma foto principal por produto (sem galeria)
- **Thumbnails**: Não implementado no MVP (foto original servida diretamente)
- **Cache**: Cache de headers HTTP para fotos estáticas do catálogo
- **Serving**: Fotos do catálogo são públicas (sem autenticação) para exibição no frontend
- **Validação de Cadastro**: Produto não pode ser criado sem foto anexada
- **Atualização**: Admin pode substituir foto existente via endpoint específico

### Endpoints de API para Fotos de Produtos
- `POST /produtos` - Criar produto com upload de foto (multipart/form-data)
- `PATCH /produtos/:id/foto` - Atualizar foto do produto (multipart/form-data)
- `GET /uploads/products/:produto_id/foto.{ext}` - Servir foto do produto (público)
- `DELETE /produtos/:id/foto` - Remover foto do produto (admin apenas)

## Estratégia de Testes

### Backend
- **Framework**: Jest + Supertest
- **Tipos de Testes**: Unitários, Integração, E2E
- **Cobertura**: Threshold de 70-75% configurado
- **Mocking**: Jest mocks para serviços externos

### Frontend
- **Framework**: Vitest (nativo para Vite, mais rápido que Jest)
- **Component Testing**: React Testing Library (padrão da indústria)
- **API Mocking**: MSW (Mock Service Worker) para consistência
- **Tipos de Testes**:
  - Unitários: Stores (Zustand), Services, Utilitários
  - Componentes: Páginas e componentes reutilizáveis
  - Integração: Fluxos de usuário completos
- **Cobertura**: Target inicial de 60% (realista para MVP)
- **Ambiente**: jsdom para simulação de browser

## Riscos Técnicos

### Alto Impacto
- **Falha no Storage Local**: Perda de imagens de personalização e fotos do catálogo em caso de falha de disco
  - *Mitigação*: Estratégia de backup (definida pelo DevOps), considerar migração para S3 em v2
- **Race Condition no Estoque**: Pedidos simultâneos podem reservar o mesmo material
  - *Mitigação*: Lock otimista com versionamento, transações de banco
- **Exposição de Arquivos**: Acesso não autorizado a imagens de personalização
  - *Mitigação*: Servir arquivos através de middleware de autenticação, URLs assinadas
- **Inconsistência de Catálogo**: Produtos sem fotos podem quebrar a experiência do usuário
  - *Mitigação*: Validação obrigatória no cadastro, constraint no banco de dados

### Médio Impacto
- **Dependência de APIs Externas**: Falha na ViaCEP ou API de Feriados
  - *Mitigação*: Circuit breaker, fallbacks, cache de dados
- **Performance no Upload**: Lentidão com arquivos grandes (10MB para personalizações, 5MB para fotos)
  - *Mitigação*: Streaming de upload, compressão no cliente, CDN em v2
- **Escalabilidade do Monolito**: Dificuldade em escalar componentes individuais
  - *Mitigação*: Arquitetura preparada para extração de microserviços no futuro
- **Armazenamento de Fotos**: Crescimento descontrolado da pasta uploads/products/
  - *Mitigação*: Limpeza periódica de fotos de produtos descontinuados, compressão automática
- **Performance de Carregamento do Catálogo**: Múltiplas fotos podem impactar tempo de carregamento
  - *Mitigação*: Lazy loading de imagens no frontend, cache HTTP agressivo

### Baixo Impacto
- **Complexidade da Saga**: Orquestração pode se tornar complexa com muitos passos
  - *Mitigação*: Manter saga simples no MVP, documentar fluxo claramente
- **Manutenção de QR Codes**: URLs podem mudar ao longo do tempo
  - *Mitigação*: Usar domínio estável, redirects configuráveis
- **Validação de Imagens**: Arquivos maliciosos podem ser enviados
  - *Mitigação*: Validação rigorosa de MIME type, sandbox de processamento

## Perguntas em Aberto

### Para o Arquiteto
- Qual padrão de saga será implementado (orchestration ou choreography)?
- Como será o controle de concorrência no estoque (lock otimista ou pessimista)?
- Como será a estrutura do monolito modular (separação por domínio)?
- Qual estratégia de organização dos arquivos locais de upload?

### Para o Negócio
- Quais serão as regras de frete por estado (valores fixos ou tabela dinâmica)?
- Qual a complexidade permitida por tipo de produto (critérios objetivos)?
- O cliente poderá editar o design após aprovação inicial?
- Qual será a política de qualidade das fotos dos produtos (resolução mínima, proporção)?
- Será permitido múltiplas fotos por produto ou apenas uma principal no MVP?

### Para o Desenvolvimento
- Qual biblioteca específica de geração de QR Code será utilizada (`qrcode` ou `qrcode.react`)?
- Como será implementado o cálculo de complexidade da personalização (heurísticas ou regras fixas)?
- Qual será a estratégia de cache para dados de catálogo (Redis, memória, ou CDN)?
- Como será o versionamento da API (versionamento na URL ou header)?
- Como será o processamento/otimização das imagens enviadas no MVP (sharp ou biblioteca nativa)?
- Qual será a estratégia de validação de conteúdo das imagens (apenas formato ou também conteúdo ofensivo)?
- Como será o gerenciamento de fotos de produtos vs personalizações (separação de storage)?
- Qual será a estratégia de redimensionamento/thumbnails para fotos de produtos (MVP)?
- Como será implementada a validação obrigatória de foto no cadastro de produtos?
- Qual será a estratégia de serving das fotos do catálogo (estático ou via middleware)?
- Como será a estrutura de organização dos testes do frontend (unitários, componentes, integração)?

### Para o QA
- Quais cenários de teste específicos para a saga de criação de pedido?
- Como simular falhas da API ViaCEP nos testes automatizados?
- Qual estratégia de testes para concorrência no estoque (carga simultânea)?
- Como testar o cálculo de prazos dinâmicos com diferentes cenários?
- Como validar upload de diferentes formatos de imagem em testes automatizados?
- Como testar validação de tamanho e resolução de imagens de forma eficiente?
- Como validar que produtos não podem ser cadastrados sem foto?
- Como testar exibição correta das fotos no catálogo?
- Como validar que fotos de produtos são servidas corretamente no frontend?
- Como testar atualização/substituição de fotos de produtos existentes?
- Como criar testes de integração para fluxos de usuário no frontend?
- Qual estratégia de mocking de APIs para testes do frontend?
