# QA Plan: Plataforma de E-commerce para Produtos Personalizados

## Visão Geral

Este plano de testes abrange a plataforma de e-commerce para produtos personalizados, implementando uma abordagem de Spec Driven Development (SDD). O plano cobre todos os domínios implementados e planejados, incluindo testes funcionais, não funcionais e de segurança.

## Cenários de Teste por Domínio

### Domínio de Autenticação

#### Cenários Funcionais
- Usuário se registra com credenciais válidas
- Usuário se registra com email já existente (deve falhar)
- Usuário faz login com credenciais corretas
- Usuário faz login com credenciais incorretas (deve falhar)
- Usuário faz login com senha fraca (deve falhar validação)
- Token JWT expirado é rejeitado
- Token JWT inválido é rejeitado
- Refresh token funciona corretamente
- Refresh token inválido é rejeitado
- Usuário com role 'admin' acessa endpoints protegidos
- Usuário com role 'user' é bloqueado em endpoints de admin
- Middleware de idempotência previne duplicação de requests
- Request sem header de idempotência é processado normalmente
- Request com idempotência retorna resposta cacheada

#### Cenários de Segurança
- Senha é armazenada com hash bcrypt
- Senha em plain text nunca é logada
- Token JWT tem assinatura válida
- Token JWT não pode ser forjado
- Rate limiting em endpoints de autenticação
- Proteção contra brute force em login
- Refresh token é armazenado de forma segura

### Domínio de Estoque

#### Cenários Funcionais
- Material é criado com dados válidos
- Material é atualizado com novos dados
- Material é deletado (soft delete)
- Consulta de disponibilidade considera reservas pendentes
- Reserva de material com quantidade suficiente
- Reserva de material com quantidade insuficiente (deve falhar)
- Lock otimista previne race conditions em reservas simultâneas
- Alerta é gerado quando estoque atinge nível mínimo
- Histórico de reservas é mantido
- Rollback de reserva em caso de conflito de versão

#### Cenários de Concorrência
- 10 requests simultâneos para reservar o mesmo material
- Verificação de version em atualizações concorrentes
- Tratamento de conflitos de lock otimista
- Isolamento de transações de banco

#### Cenários de Não Funcionais
- Performance: consulta de disponibilidade < 100ms
- Performance: reserva de material < 200ms
- Cache de disponibilidade funciona corretamente
- TTL de cache é respeitado

### Domínio de Catálogo

#### Cenários Funcionais
- Produto é criado com foto obrigatória
- Produto é criado sem foto (deve falhar)
- Produto é listado com paginação
- Produto é buscado por nome
- Produto é filtrado por categoria
- Produto é filtrado por complexidade
- Foto do produto é servida publicamente
- Foto do produto tem cache HTTP de 1 dia
- Produto é atualizado com nova foto
- Foto do produto é deletada (admin apenas)
- Cache de catálogo é invalidado em atualizações
- Validação de complexidade é aplicada

#### Cenários de Upload de Fotos
- Upload de foto com formato válido (JPG, PNG, WEBP)
- Upload de foto com formato inválido (deve falhar)
- Upload de foto com tamanho > 5MB (deve falhar)
- Upload de foto com resolução < 300x300 (deve falhar)
- Upload de foto com MIME type falso (deve falhar validação de magic bytes)
- Upload de foto com path traversal attempt (deve falhar)
- Foto é armazenada em estrutura hierárquica correta
- Thumbnail é gerado automaticamente
- Compressão de imagem é aplicada

#### Cenários de Segurança
- Path traversal é prevenido em nomes de arquivos
- MIME type real é validado (não apenas extensão)
- Arquivos executáveis são rejeitados
- Upload de arquivos maliciosos é prevenido
- Nomes de arquivos são sanitizados (UUID)

### Domínio de Pedidos

#### Cenários Funcionais
- Pedido é criado com dados válidos
- Pedido é criado com itens inválidos (deve falhar)
- Pedido é listado por usuário
- Pedido é detalhado por ID
- Status do pedido é atualizado
- Histórico de status é mantido
- Factory Pattern cria pedido corretamente
- DTOs validam dados de entrada
- Validação com Zod rejeita dados inválidos

#### Cenários de Saga
- Saga completa todos os passos com sucesso
- Saga falha no passo de reserva de materiais (compensação executada)
- Saga falha no passo de cálculo de frete (compensação executada)
- Saga falha no passo de criação de pedido (compensação executada)
- Transação de banco é commitada em sucesso
- Transação de banco é rollback em falha
- Logs de saga são mantidos para auditoria

#### Cenários de Validação
- Endereço CEP inválido é rejeitado
- CEP válido retorna dados corretos
- Cálculo de frete usa ViaCEP quando disponível
- Cálculo de frete usa fallback quando ViaCEP falha
- Prazo de entrega considera feriados
- Prazo de entrega usa fallback quando API de feriados falha

### Domínio de Integrações Externas

#### Cenários de ViaCEP
- Chamada à API ViaCEP com CEP válido
- Chamada à API ViaCEP com CEP inválido
- Circuit breaker abre após falhas consecutivas
- Circuit breaker fecha após período de cooldown
- Retry com exponential backoff funciona
- Fallback é usado quando circuit breaker está aberto
- Cache de CEPs funciona (TTL 24h)
- Timeout de 3s é respeitado

#### Cenários de API de Feriados
- Chamada à API de feriados com ano válido
- Chamada à API de feriados com ano inválido
- Circuit breaker funciona para feriados
- Retry com exponential backoff funciona
- Fallback usa dias corridos quando API falha
- Cache de feriados funciona (TTL 1 ano)
- Timeout de 2s é respeitado

#### Cenários de Resiliência
- Bulkhead isola chamadas de APIs externas
- Thread pools têm limites de concorrência
- Falha em uma API não afeta outras
- Sistema continua operacional com APIs externas indisponíveis

### Domínio de Upload de Personalizações (Planejado)

#### Cenários Funcionais
- Usuário faz upload de personalização para pedido
- Upload de personalização com formato válido
- Upload de personalização com tamanho > 10MB (deve falhar)
- Upload de personalização com resolução < 300dpi (deve falhar)
- Personalização é armazenada em estrutura hierárquica
- Thumbnail é gerado para personalização
- Compressão é aplicada à personalização
- Progresso de upload é reportado ao usuário

#### Cenários de Segurança
- Upload de personalização requer autenticação
- Usuário só pode fazer upload para seus próprios pedidos
- Path traversal é prevenido
- MIME type real é validado
- Arquivos maliciosos são rejeitados

### Domínio de Fluxo de Aprovação (Planejado)

#### Cenários Funcionais
- Usuário faz upload de personalização
- Personalização fica com status 'pending'
- Admin aprova personalização
- Admin rejeita personalização
- Usuário é notificado de mudança de status
- Histórico de aprovações é mantido
- Pedido é bloqueado para edição após aprovação

#### Cenários de Notificação
- Notificação é enviada quando personalização é aprovada
- Notificação é enviada quando personalização é rejeitada
- Notificação contém motivo da rejeição
- Histórico de notificações é mantido

### Domínio de Produção (Planejado)

#### Cenários Funcionais
- Pedido aprovado entra na fila de produção
- Fila de produção é ordenada por prioridade
- Etapa de produção é atualizada
- Status de produção é atualizado
- Histórico de produção é mantido
- Pedido é marcado como shipped quando completo
- Pedido é marcado como delivered quando entregue

#### Cenários de Gestão
- Admin visualiza fila de produção
- Admin atualiza etapa de produção
- Admin visualiza histórico de produção
- Admin filtra pedidos por status de produção

### Domínio de QR Code (Planejado)

#### Cenários Funcionais
- QR Code é gerado para pedido
- QR Code contém URL de rastreamento
- QR Code é armazenado corretamente
- QR Code é servido ao usuário
- Scanner de QR Code funciona no frontend
- Página de rastreamento mostra status em tempo real
- Histórico de produção é exibido na página de rastreamento

### Domínio de Frontend (Planejado)

#### Cenários de Autenticação
- Usuário faz login no frontend
- Usuário se registra no frontend
- Token é armazenado no contexto
- Rotas protegidas redirecionam para login
- Refresh token funciona automaticamente

#### Cenários de Catálogo
- Usuário visualiza lista de produtos
- Usuário filtra produtos por categoria
- Usuário busca produtos por nome
- Usuário visualiza detalhes do produto
- Usuário adiciona produto ao carrinho
- Carrinho calcula total corretamente
- Frete é calculado no frontend

#### Cenários de Personalização
- Usuário preenche formulário de personalização
- Usuário faz upload de imagem
- Usuário visualiza preview de personalização
- Validação de upload funciona no frontend
- Progresso de upload é exibido

#### Cenários de Pedidos
- Usuário finaliza checkout
- Usuário visualiza confirmação de pedido
- Usuário visualiza lista de pedidos
- Usuário visualiza detalhes do pedido
- Status do pedido é atualizado em tempo real

#### Cenários de Rastreamento
- Usuário scaneia QR Code
- Usuário visualiza página de rastreamento
- Usuário visualiza status de produção
- Usuário visualiza histórico de produção

#### Cenários de Admin
- Admin visualiza dashboard
- Admin gerencia estoque
- Admin gerencia fila de produção
- Admin aprova personalizações
- Admin visualiza relatórios básicos

## Critérios de Aceitação

### Autenticação
- [ ] Usuários podem se registrar e fazer login
- [ ] Senhas são armazenadas com hash bcrypt
- [ ] Tokens JWT são gerados com expiração de 1h
- [ ] RBAC funciona corretamente (admin vs user)
- [ ] Idempotência previne duplicação de requests
- [ ] Rate limiting protege contra brute force

### Estoque
- [ ] Materiais podem ser criados, atualizados e deletados
- [ ] Reservas funcionam com lock otimista
- [ ] Concorrência é tratada corretamente
- [ ] Alertas de estoque mínimo são gerados
- [ ] Consulta de disponibilidade considera reservas
- [ ] Cache melhora performance de consultas

### Catálogo
- [ ] Produtos podem ser criados com foto obrigatória
- [ ] Fotos são validadas (formato, tamanho, resolução, MIME type)
- [ ] Produtos podem ser listados, buscados e filtrados
- [ ] Cache de catálogo funciona corretamente
- [ ] Validação de complexidade é aplicada
- [ ] Fotos são servidas publicamente com cache HTTP

### Pedidos
- [ ] Pedidos podem ser criados com validação
- [ ] Saga orquestra criação de pedido
- [ ] Compensação funciona em caso de falha
- [ ] Transações de banco garantem consistência
- [ ] Histórico de status é mantido
- [ ] DTOs validam dados de entrada

### Integrações Externas
- [ ] ViaCEP é integrado com circuit breaker
- [ ] API de feriados é integrada com circuit breaker
- [ ] Retry com exponential backoff funciona
- [ ] Fallback é usado quando APIs falham
- [ ] Cache funciona para CEPs e feriados
- [ ] Bulkhead isola chamadas externas

### Upload de Personalizações
- [ ] Usuários podem fazer upload de personalizações
- [ ] Validação de formato, tamanho e resolução funciona
- [ ] Estrutura hierárquica de storage é usada
- [ ] Thumbnails são gerados
- [ ] Compressão é aplicada
- [ ] Autenticação é requerida

### Fluxo de Aprovação
- [ ] Personalizações podem ser aprovadas/rejeitadas
- [ ] Notificações são enviadas
- [ ] Histórico de aprovações é mantido
- [ ] Pedidos são bloqueados após aprovação

### Produção
- [ ] Fila de produção é gerenciada
- [ ] Etapas de produção são atualizadas
- [ ] Histórico de produção é mantido
- [ ] Status de pedidos é atualizado

### QR Code
- [ ] QR Codes são gerados para pedidos
- [ ] QR Codes contêm URL de rastreamento
- [ ] Scanner funciona no frontend
- [ ] Página de rastreamento mostra status

### Frontend
- [ ] Autenticação funciona no frontend
- [ ] Catálogo é exibido corretamente
- [ ] Personalização pode ser feita
- [ ] Pedidos podem ser criados
- [ ] Rastreamento funciona
- [ ] Admin dashboard funciona

## Testes Automatizados

### Testes Unitários

#### Serviços de Autenticação
- `AuthService.login()` - Teste de login com credenciais válidas
- `AuthService.login()` - Teste de login com credenciais inválidas
- `AuthService.register()` - Teste de registro com email único
- `AuthService.register()` - Teste de registro com email duplicado
- `AuthService.verifyToken()` - Teste de verificação de token válido
- `AuthService.verifyToken()` - Teste de verificação de token inválido
- `AuthService.hashPassword()` - Teste de hash de senha
- `AuthService.generateToken()` - Teste de geração de token JWT

#### Serviços de Estoque
- `MaterialService.reserve()` - Teste de reserva com quantidade suficiente
- `MaterialService.reserve()` - Teste de reserva com quantidade insuficiente
- `MaterialService.reserve()` - Teste de lock otimista
- `MaterialService.checkAvailability()` - Teste de consulta de disponibilidade
- `MaterialService.checkMinLevel()` - Teste de verificação de nível mínimo
- `MaterialService.createReservation()` - Teste de criação de reserva

#### Serviços de Catálogo
- `ProductService.create()` - Teste de criação com foto válida
- `ProductService.create()` - Teste de criação sem foto (deve falhar)
- `ProductService.search()` - Teste de busca por nome
- `ProductService.findByCategory()` - Teste de filtro por categoria
- `ProductService.validateComplexity()` - Teste de validação de complexidade
- `ProductService.invalidateCache()` - Teste de invalidação de cache

#### Serviços de Pedidos
- `OrderService.create()` - Teste de criação de pedido
- `OrderService.create()` - Teste de validação de DTO
- `OrderFactory.createOrder()` - Teste de factory pattern
- `OrderSagaCoordinator.execute()` - Teste de saga completa
- `OrderSagaCoordinator.execute()` - Teste de compensação
- `ReserveMaterialsStep.execute()` - Teste de passo de reserva
- `CalculateFreightStep.execute()` - Teste de passo de frete
- `CreateOrderStep.execute()` - Teste de passo de criação

#### Clientes de Integração
- `ViaCEPClient.getAddress()` - Teste de chamada com CEP válido
- `ViaCEPClient.getAddress()` - Teste de chamada com CEP inválido
- `ViaCEPClient.getAddress()` - Teste de circuit breaker
- `HolidaysAPIClient.getHolidays()` - Teste de chamada com ano válido
- `HolidaysAPIClient.getHolidays()` - Teste de circuit breaker
- `RetryUtil.execute()` - Teste de retry com exponential backoff

#### Middlewares
- `authMiddleware` - Teste de validação de token
- `roleMiddleware` - Teste de verificação de role
- `idempotencyMiddleware` - Teste de idempotência
- `imageValidationMiddleware` - Teste de validação de imagem
- `uploadMiddleware` - Teste de upload de arquivo

### Testes de Integração

#### Autenticação
- POST /auth/register - Integração com banco de dados
- POST /auth/login - Integração com geração de token
- GET /auth/me - Integração com middleware de autenticação

#### Estoque
- POST /materials - Integração com repository
- GET /materials - Integração com paginação
- GET /materials/availability - Integração com cache
- PUT /materials/:id - Integração com lock otimista

#### Catálogo
- POST /products - Integração com upload de foto
- GET /products - Integração com cache
- GET /products/:id - Integração com serving de foto
- PATCH /products/:id/photo - Integração com atualização de foto

#### Pedidos
- POST /orders - Integração com saga
- GET /orders - Integração com repository
- GET /orders/:id - Integração com histórico
- PUT /orders/:id/status - Integração com atualização

#### Integrações Externas
- GET /cep/:cep - Integração com ViaCEP
- GET /holidays/:year - Integração com API de feriados
- Teste de circuit breaker em chamadas reais
- Teste de fallback em falhas de API

### Testes de Concorrência

#### Estoque
- Teste de 10 reservas simultâneas do mesmo material
- Teste de conflito de versão em atualizações concorrentes
- Teste de isolamento de transações

#### Pedidos
- Teste de criação de pedidos simultâneos
- Teste de saga com concorrência

### Testes de Performance

#### Load Testing
- 100 requisições simultâneas em /health
- 50 requisições simultâneas em /products
- 20 requisições simultâneas em /orders
- 10 requisições simultâneas em /materials/availability

#### Response Time
- GET /health < 50ms
- GET /products < 200ms
- GET /products/:id < 100ms
- POST /orders < 500ms
- GET /materials/availability < 100ms

### Testes de Segurança

#### Autenticação
- Teste de brute force em /auth/login
- Teste de token JWT forjado
- Teste de token JWT expirado
- Teste de refresh token inválido

#### Upload
- Teste de upload de arquivo executável
- Teste de upload com path traversal
- Teste de upload com MIME type falso
- Teste de upload de arquivo malicioso

#### Autorização
- Teste de acesso de user a endpoint de admin
- Teste de acesso sem token a endpoint protegido
- Teste de acesso com token de outro usuário

#### SQL Injection
- Teste de SQL injection em parâmetros de busca
- Teste de SQL injection em IDs

#### XSS
- Teste de XSS em campos de texto
- Teste de XSS em upload de arquivos

### Testes E2E (Cypress)

#### Fluxo de Usuário
- Cenário: Usuário se registra, faz login, cria pedido
- Cenário: Usuário busca produto, adiciona ao carrinho, finaliza
- Cenário: Usuário faz upload de personalização, aprovação, rastreamento

#### Fluxo de Admin
- Cenário: Admin faz login, gerencia estoque
- Cenário: Admin aprova personalização, gerencia produção
- Cenário: Admin visualiza relatórios

## Riscos de Qualidade

### Riscos Técnicos

#### Alta Prioridade
- **Race conditions em estoque**: Concorrência pode causar overselling de materiais
  - **Mitigação**: Lock otimista, testes de concorrência, transações de banco
- **Falha em APIs externas**: ViaCEP ou API de feriados indisponíveis
  - **Mitigação**: Circuit breaker, retry, fallback, cache
- **Upload de arquivos maliciosos**: Arquivos podem conter malware
  - **Mitigação**: Validação de MIME type real, sanitização de paths, limitação de tamanho
- **SQL Injection**: Queries vulneráveis podem comprometer banco
  - **Mitigação**: Prisma ORM (parameterized queries), validação de input

#### Média Prioridade
- **Performance de cache**: Cache pode não invalidar corretamente
  - **Mitigação**: Testes de cache, TTL apropriado, invalidação manual
- **Consistência de saga**: Compensação pode falhar parcialmente
  - **Mitigação**: Logs de auditoria, transações de banco, retry de compensação
- **Networking issue**: Podman networking pode causar problemas de conexão
  - **Mitigação**: Documentação de troubleshooting, testes de conectividade

#### Baixa Prioridade
- **Escalabilidade de storage local**: Storage local pode não escalar
  - **Mitigação**: Documentação para migração para S3, monitoramento de espaço
- **Performance de upload de imagens**: Processamento de imagens pode ser lento
  - **Mitigação**: Compressão, thumbnails, processamento assíncrono

### Riscos de Negócio

#### Alta Prioridade
- **Overselling de estoque**: Venda de produtos sem material suficiente
  - **Mitigação**: Lock otimista, alertas de estoque mínimo, testes de concorrência
- **Perda de dados**: Falha no backup pode causar perda de dados
  - **Mitigação**: Backups automáticos, testes de restore, documentação de backup
- **Fraude em pedidos**: Pedidos fraudulentos podem ser criados
  - **Mitigação**: Validação de CEP, verificação de email, rate limiting

#### Média Prioridade
- **Experiência do usuário**: Upload lento pode frustrar usuários
  - **Mitigação**: Progresso de upload, compressão, thumbnails
- **Disponibilidade**: Sistema pode ficar indisponível
  - **Mitigação**: Monitoramento, health checks, graceful degradation

### Riscos de Segurança

#### Alta Prioridade
- **Exposição de dados sensíveis**: Senhas ou tokens podem ser expostos
  - **Mitigação**: Hash de senhas, variáveis de ambiente, não logar dados sensíveis
- **Autenticação fraca**: Tokens podem ser forjados
  - **Mitigação**: Assinatura JWT, expiração de tokens, refresh tokens
- **Upload de arquivos maliciosos**: Arquivos podem comprometer o servidor
  - **Mitigação**: Validação de MIME type, sanitização, isolamento de storage

#### Média Prioridade
- **DDoS**: Ataques de DDoS podem derrubar o sistema
  - **Mitigação**: Rate limiting, circuit breaker, CDN
- **XSS**: Scripts maliciosos podem ser injetados
  - **Mitigação**: Sanitização de input, CSP, validação

### Riscos de Testes

#### Alta Prioridade
- **Cobertura de testes insuficiente**: Bugs podem não ser detectados
  - **Mitigação**: Métricas de cobertura, testes de integração, testes E2E
- **Testes de concorrência ausentes**: Race conditions podem não ser detectadas
  - **Mitigação**: Testes de carga, testes de concorrência, monitoramento em produção

#### Média Prioridade
- **Testes lentos**: Suite de testes pode demorar muito
  - **Mitigação**: Mock de APIs externas, testes paralelos, testes unitários vs integração
- **Flaky tests**: Testes instáveis podem causar falsos positivos
  - **Mitigação**: Retry de testes, isolamento de testes, fixtures determinísticos

## Estratégia de Execução de Testes

### Fase 1: Testes Unitários (Contínuo)
- Executar a cada commit
- Foco em lógica de negócio isolada
- Mock de dependências externas
- Cobertura mínima: 80%

### Fase 2: Testes de Integração (Contínuo)
- Executar a cada commit em pipeline CI
- Foco em integração entre componentes
- Banco de dados de teste isolado
- Mock de APIs externas

### Fase 3: Testes de Concorrência (Diário)
- Executar em pipeline noturno
- Foco em race conditions e lock otimista
- Carga simulada de usuários simultâneos
- Monitoramento de deadlocks

### Fase 4: Testes de Performance (Semanal)
- Executar em pipeline semanal
- Foco em response time e throughput
- Load testing com ferramentas como k6
- Baseline de performance estabelecido

### Fase 5: Testes de Segurança (Mensal)
- Executar em pipeline mensal
- Foco em vulnerabilidades conhecidas
- Ferramentas: OWASP ZAP, npm audit
- Penetration testing básico

### Fase 6: Testes E2E (Semanal)
- Executar em pipeline semanal
- Foco em fluxos de usuário completos
- Cypress ou Playwright
- Ambiente de staging

## Ferramentas de Teste

### Testes Unitários e Integração
- **Jest**: Framework de testes
- **Supertest**: Testes de HTTP
- **ts-jest**: Suporte a TypeScript

### Testes E2E
- **Cypress**: Testes end-to-end
- **Playwright**: Alternativa ao Cypress

### Testes de Performance
- **k6**: Load testing
- **Artillery**: Alternativa ao k6

### Testes de Segurança
- **OWASP ZAP**: Security scanning
- **npm audit**: Vulnerability scanning
- **Snyk**: Dependency scanning

### Mocking
- **msw**: Mock Service Worker
- **nock**: Mock HTTP requests

### Cobertura
- **Istanbul/nyc**: Cobertura de código
- **Codecov**: Integração com CI

## Métricas de Qualidade

### Cobertura de Testes
- Cobertura de linhas: > 80%
- Cobertura de branches: > 75%
- Cobertura de funções: > 90%
- Cobertura de statements: > 80%

### Performance
- Response time p95: < 500ms
- Response time p99: < 1000ms
- Throughput: > 100 req/s
- Error rate: < 0.1%

### Segurança
- Vulnerabilidades críticas: 0
- Vulnerabilidades altas: 0
- Vulnerabilidades médias: < 5
- Vulnerabilidades baixas: < 10

### Confiabilidade
- Uptime: > 99.5%
- MTTR (Mean Time To Recovery): < 1 hora
- MTBF (Mean Time Between Failures): > 30 dias

## Plano de Continuidade

### Monitoramento em Produção
- Health checks: /health endpoint
- Logs estruturados com Pino
- Métricas de performance
- Alertas de erro
- Alertas de estoque mínimo

### Backup e Restore
- Backup diário do banco de dados
- Backup semanal da pasta uploads
- Teste mensal de restore
- Retenção de backups: 30 dias

### Incident Response
- Documentação de incidentes
- Canais de comunicação
- Escalation matrix
- Post-mortem após incidentes

## Conclusão

Este plano de testes abrange todos os domínios da plataforma de e-commerce para produtos personalizados, garantindo qualidade através de testes funcionais, não funcionais e de segurança. A estratégia de execução em fases permite uma abordagem incremental, com testes contínuos no desenvolvimento e testes mais abrangentes em pipelines regulares.

Os riscos identificados têm mitigações claras, e as métricas de qualidade estabelecem objetivos mensuráveis para garantir a entrega de um produto robusto e confiável.
