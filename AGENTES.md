# Agentes de Desenvolvimento - Guia de Uso

Este projeto utiliza um processo de Spec Driven Development (SDD) com agentes especializados para diferentes papéis no desenvolvimento.

## 🤖 Agentes Disponíveis

### Skills Nativos (Devin)
Estes agentes estão disponíveis como skills nativos do Devin e podem ser invocados automaticamente:

#### 📊 Report Generator
- **Localização**: `.devin/skills/report-generator/`
- **Uso**: Gera relatórios de progresso do projeto final
- **Quando usar**: Para criar ou atualizar relatórios de andamento
- **Como invocar**: O Devin sugere automaticamente ou peça explicitamente

#### 🧪 QA Agent
- **Localização**: `.devin/skills/qa-agent/`
- **Uso**: Cria planos de testes e cenários de QA
- **Quando usar**: Para derivar testes de critérios de aceitação
- **Como invocar**: O Devin sugere automaticamente ou peça explicitamente

### Agentes de Conversa
Estes agentes funcionam através de sessões de conversa com contexto específico:

#### 📋 Product Owner (PO)
- **Arquivo**: `PO-agent.md`
- **Papel**: Traduz necessidades de negócio em especificações
- **Saída**: `spec.md` - Especificações estruturadas
- **Como usar**: Inicie nova sessão com o contexto do PO-agent.md

#### 🏗️ Arquiteto de Software
- **Arquivo**: `Architect-agent.md`
- **Papel**: Propõe soluções técnicas e decisões arquiteturais
- **Saída**: `plan.md` - Planos técnicos
- **Como usar**: Inicie nova sessão com o contexto do Architect-agent.md

#### 👩‍💻 Desenvolvedor
- **Arquivo**: `Dev-agent.md`
- **Papel**: Transforma planos em tarefas práticas e código
- **Saída**: `tasks.md` - Listas de tarefas detalhadas
- **Como usar**: Inicie nova sessão com o contexto do Dev-agent.md

## 🔄 Fluxo de Trabalho SDD

### Fluxo Recomendado:
1. **PO** → Cria/atualiza `spec.md` com requisitos
2. **Architect** → Cria/atualiza `plan.md` com decisões técnicas
3. **Dev** → Cria/atualiza `tasks.md` com tarefas de implementação
4. **QA** → Cria `qa.md` com planos de teste
5. **Report Generator** → Gera relatórios de progresso quando necessário

### Exemplo de Uso:

#### Para adicionar novo requisito:
```
1. Sessão PO: "Adicione ao spec.md o requisito X"
2. Sessão Architect: "Revise o plan.md para o requisito X"
3. Sessão Dev: "Atualize tasks.md para implementar X"
4. QA Agent: "Crie plano de testes para X"
```

#### Para gerar relatório de progresso:
```
Use o report-generator skill para criar um relatório atualizado do projeto.
```

## 📁 Arquivos de Saída dos Agentes

- `spec.md` - Especificações funcionais e não funcionais
- `plan.md` - Decisões arquiteturais e tecnologias
- `tasks.md` - Tarefas detalhadas de implementação
- `qa.md` - Planos de teste e cenários
- `report.md` - Relatórios de progresso (quando gerado)

## 🚀 Configuração para Colegas

### Para usar os agentes neste projeto:

1. **Clone o repositório**
2. **Skills nativos** estarão disponíveis automaticamente em `.devin/skills/`
3. **Para agentes de conversa**, inicie nova sessão com o arquivo .md correspondente:
   - Carregue `PO-agent.md` para sessões com Product Owner
   - Carregue `Architect-agent.md` para sessões com Arquiteto
   - Carregue `Dev-agent.md` para sessões com Desenvolvedor

### Exemplo de início de sessão:
```
"Você é o agente Product Owner descrito em PO-agent.md. 
Preciso adicionar um novo requisito ao spec.md..."
```

## 💡 Dicas de Uso

- **Mantenha o contexto**: Continue nas sessões existentes quando possível para preservar histórico
- **Fluência natural**: Os agentes seguem um fluxo SDD estruturado
- **Documentação**: Cada saída de agente é documentada nos arquivos correspondentes
- **Colaboração**: Skills nativos podem ser usados por qualquer pessoa no projeto

## 🔧 Manutenção dos Agentes

- **Skills nativos**: Modifique arquivos em `.devin/skills/{nome}/SKILL.md`
- **Agentes de conversa**: Modifique arquivos `.md` na raiz do projeto
- **Para compartilhar**: Commit as alterações no Git

## 📝 Notas

- Este projeto usa uma abordagem híbrida: skills nativos para tarefas específicas (QA, relatórios) e sessões de conversa para agentes principais (PO, Architect, Dev)
- A abordagem permite flexibilidade mantendo estrutura do processo SDD
- Skills nativos oferecem integração automática com o Devin
- Sessões de conversa permitem contexto mais rico e iterativo
