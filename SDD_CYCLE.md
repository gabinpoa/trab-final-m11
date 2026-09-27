# Ciclo Spec Driven Development (SDD)

## Visão Geral
Processo estruturado de desenvolvimento com agentes especializados, cada um com responsabilidade clara e limites de escopo definidos.

## Ciclo de Desenvolvimento
1. **Product Owner (PO)** → `spec.md`
2. **Arquiteto** → `plan.md`
3. **DevOps** → `devops.md`
4. **Desenvolvedor (Dev)** → `tasks.md`
5. **QA** → `qa.md`

## Responsabilidades por Agente

### Product Owner (PO)
**DEVE:**
- Definir requisitos de negócio
- Especificar critérios de aceitação
- Identificar valor de negócio
- Levantar perguntas de negócio

**NÃO DEVE:**
- Detalhar implementação técnica
- Definir tecnologias específicas
- Especificar infraestrutura
- Criar tarefas de desenvolvimento

### Arquiteto
**DEVE:**
- Traduzir requisitos em decisões arquiteturais
- Definir padrões de design
- Escolher tecnologias e frameworks
- Avaliar restrições técnicas

**NÃO DEVE:**
- Definir requisitos de negócio
- Detalhar tarefas de implementação
- Especificar infraestrutura de deploy
- Criar planos de teste

### DevOps
**DEVE:**
- Definir infraestrutura de deploy
- Configurar CI/CD
- Especificar monitoramento e alertas
- Planejar backup e recovery

**NÃO DEVE:**
- Definir requisitos de negócio
- Detalhar implementação de código
- Escolher tecnologias de aplicação
- Criar testes funcionais

### Desenvolvedor (Dev)
**DEVE:**
- Quebrar planos em tarefas detalhadas
- Implementar código
- Seguir padrões definidos pelo Arquiteto
- Considerar restrições operacionais do DevOps

**NÃO DEVE:**
- Definir requisitos de negócio
- Escolher tecnologias (exceto bibliotecas específicas)
- Definir infraestrutura de deploy
- Criar planos de teste (apenas implementar testes unitários)

### QA
**DEVE:**
- Derivar testes dos critérios de aceitação
- Criar planos de teste
- Validar requisitos funcionais e não funcionais
- Testar aspectos operacionais

**NÃO DEVE:**
- Definir requisitos de negócio
- Detalhar implementação
- Escolher tecnologias
- Definir infraestrutura

## Interação entre Agentes

### Handoffs
- PO → Architect: Requisitos claros para decisões técnicas
- Architect → DevOps: Decisões técnicas para infraestrutura
- DevOps → Dev: Restrições operacionais para implementação
- Dev → QA: Código pronto para testes

### Comunicação
- Cada agente deve referenciar decisões dos agentes anteriores
- Dúvidas sobre escopo devem ser resolvidas consultando este arquivo
- Sobreposições devem ser discutidas e atribuídas ao agente apropriado

## Quando Há Sobreposição de Responsabilidades

### Regra Geral
- Requisitos de negócio → PO
- Decisões técnicas/arquiteturais → Architect
- Infraestrutura/operacional → DevOps
- Implementação de código → Dev
- Testes/validação → QA

### Exemplos de Sobreposição e Resolução
- "Performance de API": Architect define requisitos, Dev implementa, QA valida
- "Deploy automático": DevOps define infraestrutura, Dev configura scripts
- "Segurança de dados": Architect define padrões, DevOps implementa na infraestrutura
