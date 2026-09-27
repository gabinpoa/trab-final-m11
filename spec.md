# Spec: Plataforma de E-commerce para Produtos Personalizados

## Contexto
O sistema é uma plataforma de gestão de pedidos para uma loja de produtos sob demanda (personalizados). O catálogo exibe produtos genéricos (camisetas, canecas, etc.) com fotos do produto base ou estampas genéricas. Cada produto deve ter pelo menos uma foto cadastrada. Quando o cliente faz um pedido, ele deve enviar uma imagem personalizada que será aplicada como estampa no produto escolhido, além de um comentário descritivo.

Atualmente, o foco está no fluxo de compra, permitindo seleção de itens do catálogo, upload da personalização, e consolidação de dados de entrega e frete de forma transparente para o usuário final. O sistema possui autenticação com dois papéis (Admin e User) e integração com API externa de endereços para cálculo de frete.

## Objetivo
Evoluir a plataforma para incluir gestão completa do ciclo de produção de produtos personalizados, desde a aprovação do design até o envio ao cliente, com controle de estoque de insumos, fila de produção organizada, prazos dinâmicos e rastreabilidade do pedido.

**Escopo MVP (Primeira Iteração):** Foco nas funcionalidades essenciais para validar o modelo de negócio.

## Requisitos Funcionais

### 1. Fluxo de Aprovação da Personalização
- Pedido criado inicia com status "AGUARDANDO_APROVAÇÃO"
- Cliente deve aprovar o design/personalização antes da produção
- Sistema permite aprovação/rejeição pelo cliente
- Após aprovação, status muda para "APROVADO"
- Pedido só pode entrar em produção após aprovação

### 2. Fila de Produção
- Admin pode visualizar e organizar pedidos por etapa de produção
- Etapas disponíveis: Aguardando Produção, Em Produção, Controle de Qualidade, Pronto para Envio
- Sistema permite movimentação manual entre etapas
- Visualização em ordem cronológica ou por prioridade definida

### 3. Estoque de Insumos
- Sistema controla materiais usados na produção (camisetas em branco, canecas, tintas, embalagens)
- Cadastro de tipos de insumos com quantidade disponível
- Atualização automática do estoque após uso em produção
- Alerta quando estoque abaixo de mínimo definido

### 4. Reserva de Materiais
- Ao criar pedido, sistema reserva automaticamente insumos necessários
- Reserva considera quantidade de itens e tipo de personalização
- Se estoque insuficiente, pedido é bloqueado com alerta
- Materiais reservados ficam indisponíveis para outros pedidos

### 5. Saga / Ação Compensatória
- Fluxo de criação de pedido: reservar materiais → calcular frete → criar pedido
- Se alguma etapa falhar, sistema desfaz as anteriores automaticamente
- Exemplo: falha no cálculo de frete libera materiais reservados
- Garantia de consistência do estado do sistema

### 6. Prazo de Produção Dinâmico
- Cálculo de prazo considera:
  - Quantidade de pedidos na fila de produção
  - Complexidade da personalização (simples, média, complexa)
  - Disponibilidade de materiais no estoque
- Prazo final = prazo de produção + prazo de entrega (frete)
- Cliente visualiza previsão atualizada em tempo real

### 7. API de Feriados
- Integração com API pública de feriados brasileiros
- Cálculo de prazos desconsidera feriados nacionais e estaduais
- Previsão de entrega ajustada automaticamente
- Fallback em caso de falha da API (considera dias corridos)

### 8. QR Code de Acompanhamento
- Sistema gera QR Code único para cada pedido
- Cliente escaneia QR Code para consultar estágio atual
- Informações visíveis: status atual, etapa de produção, previsão de entrega
- Acesso público (sem autenticação) via QR Code

### 9. Autenticação e Controle de Acesso
- Sistema de autenticação para Admin e User
- Admin: visualiza todos os pedidos, altera status
- User: cria pedidos, visualiza apenas próprio histórico

### 10. Integração com API de Endereços
- Sistema integra com API de endereços no checkout
- Extrai Cidade e UF do CEP informado
- Calcula frete e prazo com base no estado
- Retorna informações consolidadas ao usuário

### 11. Prevenção de Duplicação
- Sistema previne duplicação de pedidos em caso de retry/falha de rede
- Reconhecimento de requisições já processadas

### 12. Resiliência em Integrações Externas
- Timeout na comunicação com APIs externas
- Retentativa automática em caso de falhas temporárias
- Tratamento de erros com mensagens claras ao usuário

### 13. Upload de Personalização
- Cliente envia imagem da estampa desejada ao criar pedido
- Formatos aceitos: JPG, PNG, WEBP, PDF
- Cliente adiciona comentário descritivo da personalização
- Sistema valida formato e tamanho do arquivo (máx 10MB)
- Imagem armazenada em serviço de storage (S3 ou equivalente)
- Admin visualiza a personalização enviada em cada pedido
- Personalização é referência para aprovação do design

### 14. Fotos do Catálogo de Produtos
- Cada produto do catálogo deve ter pelo menos uma foto
- Foto deve mostrar o produto base (não personalizado) ou estampa genérica
- Formatos aceitos para fotos de produtos: JPG, PNG, WEBP
- Sistema valida formato e tamanho das fotos (máx 5MB)
- Fotos armazenadas em sistema de arquivos local (pasta `uploads/products/`)
- Admin consegue cadastrar e atualizar fotos dos produtos
- Cliente visualiza fotos dos produtos no catálogo
- Sistema permite múltiplas fotos por produto (opcional no MVP)

## Requisitos Não Funcionais

### Performance
- Resposta da API de pedidos em menos de 500ms (p95)
- Upload de imagem de personalização em menos de 3s (até 10MB)
- Upload de foto de produto em menos de 2s (até 5MB)

### Disponibilidade
- Sistema disponível 99.5% do tempo
- APIs externas com timeout configurável (máx 5s)
- Fallback para cálculo de prazos sem API de feriados

### Segurança
- Tokens JWT com expiração de 1 hora
- Idempotency-Key validada em todas as operações de escrita
- Logs de auditoria para mudanças de status de pedidos

### Escalabilidade
- Sistema deve suportar até 10.000 pedidos simultâneos
- Sistema deve suportar múltiplos usuários concorrentes

### Manutenibilidade
- Sistema deve permitir troubleshooting eficiente
- Logs de auditoria para mudanças críticas

## Critérios de Aceitação

### Fluxo de Aprovação
- [ ] Pedido criado inicia como "AGUARDANDO_APROVAÇÃO"
- [ ] Cliente consegue aprovar pedido via interface
- [ ] Cliente consegue rejeitar pedido com motivo
- [ ] Pedido rejeitado não entra em produção
- [ ] Pedido aprovado muda para "APROVADO"

### Fila de Produção
- [ ] Admin visualiza pedidos organizados por etapa
- [ ] Admin consegue mover pedido entre etapas
- [ ] Sistema mantém ordem cronológica por padrão
- [ ] Etapas: Aguardando Produção → Em Produção → Controle de Qualidade → Pronto para Envio

### Estoque de Insumos
- [ ] Admin consegue cadastrar tipos de insumos
- [ ] Sistema atualiza estoque automaticamente após produção
- [ ] Alerta gerado quando estoque < mínimo
- [ ] Histórico de movimentação de estoque disponível

### Reserva de Materiais
- [ ] Pedido reserva materiais automaticamente ao ser criado
- [ ] Sistema bloqueia pedido se estoque insuficiente
- [ ] Materiais reservados ficam indisponíveis
- [ ] Cancelamento de pedido libera materiais reservados

### Saga
- [ ] Falha em qualquer etapa desfaz as anteriores
- [ ] Logs registram cada etapa da saga
- [ ] Sistema mantém consistência em caso de erro
- [ ] Cliente recebe mensagem de erro clara

### Prazo Dinâmico
- [ ] Prazo considera fila de produção
- [ ] Prazo considera complexidade da personalização
- [ ] Prazo considera disponibilidade de materiais
- [ ] Cliente visualiza previsão atualizada

### API de Feriados
- [ ] Sistema integra com API de feriados
- [ ] Prazos desconsideram feriados
- [ ] Fallback funciona em caso de falha
- [ ] Logs registram chamadas à API

### QR Code
- [ ] Sistema gera QR Code único por pedido
- [ ] QR Code permite consulta de status
- [ ] Consulta via QR Code não requer autenticação
- [ ] Informações visíveis: status, etapa, previsão

### Autenticação
- [ ] Login funciona para Admin e User
- [ ] Admin visualiza todos os pedidos
- [ ] User visualiza apenas seus pedidos
- [ ] Token expira após 1 hora

### ViaCEP
- [ ] BFF consome API ViaCEP com sucesso
- [ ] Sistema extrai Cidade e UF corretamente
- [ ] Frete calculado com base no estado
- [ ] Objeto consolidado retornado ao frontend

### Idempotência
- [ ] Header Idempotency-Key obrigatório em POST /pedidos
- [ ] Retry com mesma chave não duplica pedido
- [ ] Sistema retorna pedido existente se chave já processada

### Resiliência
- [ ] Timeout configurado para API ViaCEP
- [ ] Retry com Exponential Backoff funciona
- [ ] Erros 5xx tratados adequadamente
- [ ] Erro padronizado retornado ao cliente

### Upload de Personalização
- [ ] Cliente consegue enviar imagem (JPG, PNG, WEBP, PDF)
- [ ] Sistema valida formato do arquivo
- [ ] Sistema valida tamanho do arquivo (máx 10MB)
- [ ] Cliente consegue adicionar comentário descritivo
- [ ] Imagem é armazenada corretamente
- [ ] Admin visualiza personalização no pedido
- [ ] Arquivos inválidos são rejeitados com mensagem clara

### Fotos do Catálogo
- [ ] Cada produto tem pelo menos uma foto cadastrada
- [ ] Sistema valida formato da foto (JPG, PNG, WEBP)
- [ ] Sistema valida tamanho da foto (máx 5MB)
- [ ] Admin consegue cadastrar foto de produto
- [ ] Admin consegue atualizar foto de produto
- [ ] Cliente visualiza fotos dos produtos no catálogo
- [ ] Fotos são armazenadas na pasta `uploads/products/`
- [ ] Sistema rejeita produtos sem foto no cadastro

## Escopo MVP (Primeira Iteração)

### Priorização do MVP (MoSCoW)

**Must Have (Obrigatório para MVP):**
- Autenticação de usuários (Admin/User)
- Catálogo de produtos com fotos
- Upload de personalização (imagem + comentário)
- Criação de pedidos
- Cálculo de frete baseado em endereço
- Fluxo de aprovação de design
- Fila de produção básica
- QR Code de acompanhamento
- Histórico de pedidos

**Should Have (Importante, pode ser v2):**
- Validação avançada de imagens
- Sistema de notificações
- Dashboard de métricas para admin
- Edição de pedido antes da aprovação

**Could Have (Desejável, futuro):**
- Controle completo de estoque
- Reserva automática de materiais
- Prazo de produção dinâmico
- API de feriados

**Won't Have (Fora do escopo atual):**
- Pagamento online
- Avaliação e comentários de produtos
- Múltiplas fotos por produto

## Restrições

### De Negócio
- Prazo máximo de produção: 15 dias úteis
- Tempo máximo de aprovação pelo cliente: 7 dias
- Pedidos não aprovados após 7 dias são cancelados automaticamente
- Tamanho máximo de imagem de personalização: 10MB
- Formatos aceitos para personalização: JPG, PNG, WEBP, PDF
- Tamanho máximo de foto de produto: 5MB
- Formatos aceitos para fotos de produtos: JPG, PNG, WEBP
- Imagens devem ter resolução mínima de 300dpi para qualidade de impressão
- Cada produto deve ter pelo menos uma foto no cadastro

## Perguntas em Aberto

### Para o Arquiteto
- Qual padrão de saga será implementado (orchestration ou choreography)?
- Como será o controle de concorrência no estoque (lock otimista ou pessimista)?
- Como será a estrutura do monolito modular (separação por domínio)?
- Qual estratégia de organização dos arquivos locais de upload?

### Para o DevOps
- Qual plataforma de deploy será utilizada?
- Como será configurado o pipeline CI/CD?
- Qual estratégia de backup do banco de dados?
- Como será implementado o rollback manual?
- Como será o gerenciamento de variáveis de ambiente em produção?
- Qual estratégia de monitoramento e alertas?
- Como será o gerenciamento de storage de arquivos em produção?
- Qual será a estratégia de health checks?

### Para o Negócio
- Quais serão as regras de frete por estado?
- Qual a complexidade permitida por tipo de produto?
- O cliente poderá editar o design após aprovação inicial?
- Qual será a política de retenção das imagens enviadas?
- Por quanto tempo as imagens devem ser armazenadas após entrega?
- Qual será a política de qualidade das fotos dos produtos (resolução mínima)?
- Será permitido múltiplas fotos por produto ou apenas uma principal?

## Histórias de Usuário Prioritárias (MVP)

### Epic 1: Autenticação e Catálogo (Must Have)
1. Como usuário, quero fazer login com credenciais para acessar o sistema
2. Como cliente, quero visualizar o catálogo de produtos com fotos
3. Como admin, quero ter acesso total ao sistema
4. Como admin, quero cadastrar produtos com fotos
5. Como admin, quero atualizar fotos dos produtos

### Epic 2: Personalização e Pedido (Must Have)
4. Como cliente, quero enviar imagem da estampa desejada (JPG, PNG, WEBP, PDF)
5. Como cliente, quero adicionar comentário descritivo da personalização
6. Como cliente, quero criar pedido com produtos personalizados
7. Como sistema, quero armazenar imagens localmente
8. Como sistema, quero garantir idempotência na criação de pedidos

### Epic 3: Frete e Endereço (Must Have)
9. Como cliente, quero informar CEP para cálculo de frete
10. Como sistema, quero integrar com ViaCEP para obter endereço
11. Como sistema, quero calcular frete com base no estado
12. Como cliente, quero visualizar resumo do pedido com frete

### Epic 4: Aprovação e Produção (Must Have)
13. Como cliente, quero aprovar o design antes da produção
14. Como admin, quero visualizar fila de produção organizada
15. Como admin, quero mover pedidos entre etapas de produção
16. Como cliente, quero visualizar apenas meus pedidos
17. Como admin, quero visualizar todos os pedidos do sistema

### Epic 5: Rastreabilidade (Should Have)
18. Como cliente, quero acompanhar pedido via QR Code
19. Como cliente, quero consultar status sem login

### Epic 6: Estoque e Prazos (Nice to Have - Futuro)
20. Como admin, quero cadastrar e controlar estoque de insumos
21. Como sistema, quero reservar materiais automaticamente ao criar pedido
22. Como cliente, quero visualizar prazo de produção realista
23. Como sistema, quero calcular prazos considerando fila e complexidade

## Definição de Pronto (DoD) - MVP

### Código
- Código implementado com testes unitários (cobertura > 70%)
- Testes de integração passando
- Code review aprovado
- Linting configurado e passando

### Documentação
- Documentação de API atualizada no Swagger/OpenAPI
- README com instruções de setup e execução

### Qualidade
- Testes de aceitação executados e aprovados
- Performance validada (p95 < 500ms para APIs principais)
- Upload de imagens funcionando (< 3s para 10MB)
- Upload de fotos de produtos funcionando (< 2s para 5MB)
- Validação de segurança básica (JWT, idempotência)
- Validação de que produtos não podem ser cadastrados sem foto
