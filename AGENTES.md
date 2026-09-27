# Agentes de Desenvolvimento

Este projeto usa agentes especializados para desenvolvimento com Spec Driven Development (SDD).

## Agentes Disponíveis

### 📋 Product Owner (PO)
- **Arquivo**: `PO-agent.md`
- **Função**: Define requisitos e especificações
- **Saída**: `spec.md`

### 🏗️ Arquiteto
- **Arquivo**: `Architect-agent.md`
- **Função**: Define arquitetura e tecnologias
- **Saída**: `plan.md`

### 👩‍💻 Desenvolvedor
- **Arquivo**: `Dev-agent.md`
- **Função**: Cria tarefas de implementação
- **Saída**: `tasks.md`

### 🧪 QA
- **Arquivo**: `QA-agent.md`
- **Função**: Cria planos de teste
- **Saída**: `qa.md`

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

## Fluxo de Trabalho

1. **PO** → Cria `spec.md` com requisitos
2. **Arquiteto** → Cria `plan.md` com decisões técnicas
3. **Dev** → Cria `tasks.md` com tarefas
4. **QA** → Cria `qa.md` com testes

## Para Colegas

Basta clonar o repositório e usar os arquivos `.md` na raiz para iniciar conversas com cada agente.
