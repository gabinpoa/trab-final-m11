# Relatório de Andamento: Projeto Final

## Contrato SDD (Swagger)
Especificação da API definida em `spec.md` com detalhamento completo de requisitos funcionais e não funcionais. Documentação Swagger configurada com swagger-ui-express e swagger-jsdoc. O contrato guia o desenvolvimento através de Spec Driven Development (SDD) com fluxo de agentes: PO → Architect → Dev → QA. Schema Prisma sincronizado com o banco de dados, incluindo campo `imageUrl` obrigatório para produtos do catálogo.

## Backend e Integrações
Framework: Express.js com TypeScript. Domínios implementados: Autenticação (JWT, RBAC), Estoque (lock otimista, reservas), Catálogo (produtos com fotos obrigatórias), Pedidos (CRUD básico), Integrações (ViaCEP, API de Feriados). Endpoints principais configurados: autenticação, produtos (com upload de fotos), materiais, pedidos. Integração com ViaCEP implementada para cálculo de frete e API de Feriados para cálculo de prazos. PostgreSQL e Redis rodando via Podman containers. Stack escolhida pela equipe por ser a mais utilizada em aula e por ser um padrão consolidado na indústria.

## Resiliência
Circuit Breaker implementado para APIs externas (ViaCEP, Feriados). Retry com Exponential Backoff configurado para erros transitórios (5xx). Timeout configurável (máx 5s para chamadas externas). Fallback implementado para cálculo de frete (tabela de estados) e prazos (dias corridos). Tratamento de erros com Try/Catch e mensagens padronizadas.

## Padrões Avançados
Monolito Modular com separação por domínio (auth, catalog, inventory, orders, integrations). Repository Pattern para acesso a dados. Service Layer para lógica de negócio. DTO Pattern para transferência de dados. Factory Pattern para criação de pedidos. Saga Orchestration Pattern planejado para criação de pedidos (reserva materiais → cálculo frete → criação pedido). Lock otimista para controle de concorrência no estoque. Idempotência via header obrigatório em operações de escrita.

## Frontend
Framework planejado: React 18+ com TypeScript e Vite. State Management: Context API ou Zustand (recomendado pelo arquiteto). HTTP Client: Axios. Formulários: React Hook Form + Zod. UI Components: shadcn/ui. Stack escolhida pela equipe por ser a mais utilizada em aula e por ser um padrão consolidado na indústria. Frontend ainda não iniciado - nenhuma biblioteca de frontend instalada no package.json. Foco atual na implementação do backend e infraestrutura base.

## Impedimentos
Problema de networking resolvido: múltiplos processos Node.js causando conflito na porta 3000. Solução aplicada: matar processos antigos e reiniciar servidor. Upload de fotos pode apresentar problemas - validação de MIME type e tamanho implementada, mas testes adicionais necessários. Storage local em vez de S3 pode limitar escalabilidade - mitigação documentada para migração futura. Concorrência no estoque requer testes de carga para validar lock otimista.