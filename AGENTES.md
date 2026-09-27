# Agentes de Desenvolvimento

Este projeto usa agentes especializados para desenvolvimento com Spec Driven Development (SDD).

## Ciclo SDD

1. **Product Owner (PO)** → `spec.md` (requisitos de negócio)
2. **Arquiteto** → `plan.md` (decisões arquiteturais)
3. **DevOps** → `devops.md` (infraestrutura, deploy, operações)
4. **Desenvolvedor (Dev)** → `tasks.md` (tarefas de implementação)
5. **QA** → `qa.md` (planos de teste)

Para detalhes completos do ciclo e responsabilidades, consulte `SDD_CYCLE.md`.

## Agentes Disponíveis

### 📋 Product Owner (PO)
- **Arquivo**: `PO-agent.md`
- **Função**: Define requisitos e especificações de negócio
- **Saída**: `spec.md`
- **Ciclo**: Atua primeiro, antes do Arquiteto

### 🏗️ Arquiteto
- **Arquivo**: `Architect-agent.md`
- **Função**: Define arquitetura e tecnologias
- **Saída**: `plan.md`
- **Ciclo**: Atua após PO, antes do DevOps

### ⚙️ DevOps
- **Arquivo**: `DevOps-agent.md`
- **Função**: Define infraestrutura, deploy e operações
- **Saída**: `devops.md`
- **Ciclo**: Atua após Arquiteto, antes do Dev

### 👩‍💻 Desenvolvedor
- **Arquivo**: `Dev-agent.md`
- **Função**: Cria tarefas de implementação
- **Saída**: `tasks.md`
- **Ciclo**: Atua após DevOps, antes do QA

### 🧪 QA
- **Arquivo**: `QA-agent.md`
- **Função**: Cria planos de teste
- **Saída**: `qa.md`
- **Ciclo**: Atua após Dev, valida todo o ciclo

## Como Usar

### 1. Inicie uma nova conversa com o agente
Carregue o arquivo `.md` correspondente como contexto inicial.

### 2. Exemplo de prompt
```
"Você é o Product Owner descrito em PO-agent.md.
Preciso adicionar um novo requisito ao spec.md..."
```

### 3. Continue na mesma sessão
Mantenha o contexto para preservar o histórico do projeto.

## Responsabilidades e Limites

Cada agente tem responsabilidades claras e limites de escopo definidos em `SDD_CYCLE.md`:
- **PO**: Define requisitos de negócio, não detalha implementação
- **Arquiteto**: Define decisões técnicas, não detalha tarefas
- **DevOps**: Define infraestrutura, não define código
- **Dev**: Implementa código, não define requisitos
- **QA**: Cria testes, não define implementação

## Para Colegas

Basta clonar o repositório e usar os arquivos `.md` na raiz para iniciar conversas com cada agente. Consulte `SDD_CYCLE.md` para entender o ciclo completo e responsabilidades.

## Fluxo de Trabalho Adaptado

### Sem Acesso Direto ao GitHub
1. **Agentes trabalham em branches locais**
2. **Fazem commits locais** com mensagens descritivas
3. **Informam quando branch está pronta**
4. **Usuário faz transferência manual** para máquina com GitHub
5. **Cria PRs e faz merge** seguindo ordem SDD
6. **Retorna repositório atualizado** para continuar trabalho

### Coordenação
- Manter branches separadas por agente
- Seguir ordem do SDD para merge
- Resolver conflitos durante processo de transferência
- Consultar `MERGE_PROCESS.md` para instruções detalhadas
- Manter `BRANCH_STATUS.md` atualizado com status das branches
