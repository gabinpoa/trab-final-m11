# Git Workflow para Equipes Pequenas com Múltiplos Agentes IA

Este documento define as diretrizes de Git para colaboração eficiente entre desenvolvedores humanos e múltiplos agentes IA em um processo de Spec Driven Development (SDD).

## Branch Strategy

### Branches Principais
- **main/master**: Branch de produção, sempre estável
- **develop**: Branch de integração (opcional para equipes maiores)

### Branches de Trabalho
- **feature/nome-da-feature**: Novas funcionalidades
- **fix/nome-do-bug**: Correções de bugs
- **docs/nome-da-doc**: Documentação geral
- **refactor/nome-da-refatoracao**: Refatorações

### Branches Específicas por Agente
- **spec/nome-da-feature**: Especificações (PO)
- **arch/nome-da-feature**: Decisões arquiteturais (Arquiteto)
- **test/nome-da-feature**: Testes (QA)
- **backend/nome-da-feature**: Implementação backend (Dev)
- **frontend/nome-da-feature**: Implementação frontend (Dev)

## Conventional Commits

### Formato
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types Globais
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, semântica (sem mudança de código)
- `refactor`: Refatoração de código
- `test`: Adiciona ou modifica testes
- `chore`: Atualização de ferramentas, configurações
- `perf`: Melhoria de performance

### Scopes Comuns
- `auth`: Autenticação e autorização
- `catalog`: Catálogo de produtos
- `inventory`: Controle de estoque
- `orders`: Pedidos e saga
- `integrations`: Integrações externas
- `frontend`: Interface do usuário
- `backend`: API e serviços
- `database`: Schema e migrations
- `docs`: Documentação

### Exemplos Globais
```
feat(auth): add JWT refresh token implementation
fix(inventory): resolve race condition in material reservation
docs(readme): update installation instructions for Windows
refactor(saga): simplify compensation logic
test(orders): add integration tests for saga flow
```

## Regras de Commit

### Commits Atômicos
- Cada commit deve fazer uma única mudança lógica
- Evite commits grandes com múltiplas mudanças não relacionadas
- Se necessário, separe em múltiplos commits

### Mensagens Descritivas
- O subject deve explicar "o que" e "por que", não "como"
- Limite de 50 caracteres no subject
- Usar imperativo no subject: "add feature" não "added feature"
- Body opcional para explicar contextos complexos
- Footer opcional para referenciar issues ou breaking changes

### Exemplo de Commit Completo
```
feat(saga): implement compensation logic for order creation

Add automatic compensation in reverse order when saga steps fail.
This ensures data consistency across inventory, freight calculation,
and order creation.

Closes #123
Breaking changes: Order creation now requires CEP parameter
```

## Sincronização de Documentação

### Requisitos Gerais
**Após cada mudança significativa, atualizar:**

1. **README.md**:
   - Atualizar status das fases na tabela
   - Adicionar novos endpoints se aplicável
   - Atualizar stack tecnológico se adicionou dependências
   - Atualizar seção de troubleshooting se encontrou novos problemas

2. **tasks.md**:
   - Marcar tarefas concluídas como ✅
   - Atualizar seção "Em Progresso" com fase atual
   - Adicionar notas sobre mudanças não planejadas
   - Atualizar estimativas se necessário
   - Adicionar seção "Atualizações Recentes" no final

3. **Git commit**:
   - Commitar mudanças na documentação junto com o código
   - Usar type `docs` se for apenas documentação
   - Usar type correspondente se for código + documentação

## Workflow de Desenvolvimento

### Para cada nova fase/feature:

1. **Criar branch**:
```bash
git checkout -b feature/nome-da-feature
```

2. **Implementar** (código, spec, plan, ou testes)

3. **Atualizar documentação** (README.md, tasks.md)

4. **Commitar** com mensagem descritiva:
```bash
git add .
git commit -m "feat(catalog): implement image upload middleware"
```

5. **Push para remote**:
```bash
git push origin feature/nome-da-feature
```

6. **Criar Pull Request** (se usando GitHub/GitLab):
   - Título descritivo seguindo conventional commits
   - Descrição com:
     - Resumo das mudanças
     - Testes realizados
     - Breaking changes (se houver)
     - Screenshots (se aplicável)

7. **Merge** após review (ou direto em equipes pequenas sem review formal)

## Integração com Múltiplos Agentes IA

### Estratégia para Evitar Conflitos

1. **Branches por agente/fase**:
   - Dev-agent: `feature/backend-fase-X`
   - Frontend-agent: `feature/frontend-fase-Y`
   - QA-agent: `fix/bug-z`

2. **Pull requests frequentes**:
   - Pequenos PRs são mais fáceis de revisar
   - Reduz conflitos de merge
   - Permite feedback rápido

3. **Commits descritivos**:
   - Facilita entender o que cada agente fez
   - Ajuda em debugging
   - Melhora rastreabilidade

4. **Documentação em tempo real**:
   - Atualizar README.md e tasks.md após cada commit
   - Isso permite que outros agentes vejam o progresso

5. **Commits de documentação separados**:
   - Se a mudança for grande, separar código e documentação
   - Exemplo: Commit 1: `feat(saga): implement saga pattern`
   - Exemplo: Commit 2: `docs(readme): update phase 7 status`

### Ordem de Trabalho entre Agentes

1. **PO Agent**: Cria spec.md
2. **Architect Agent**: Cria plan.md baseado no spec
3. **Dev Agent**: Implementa baseado no plan
4. **QA Agent**: Cria qa.md e implementa testes

Cada agente deve:
- Criar branch específico
- Commitar mudanças com mensagens descritivas
- Atualizar documentação
- Criar PR para integração

## Comandos Úteis

### Status e Histórico
```bash
# Ver status
git status

# Ver histórico
git log --oneline --graph --all

# Ver mudanças não commitadas
git diff

# Ver mudanças no último commit
git show HEAD

# Ver branches
git branch -a
```

### Branch e Merge
```bash
# Criar branch
git checkout -b feature/nova-feature

# Mudar para branch
git checkout feature/nova-feature

# Merge branch
git merge feature/nova-feature

# Rebase (para manter histórico limpo)
git rebase main

# Deletar branch local
git branch -d feature/nova-feature

# Deletar branch remoto
git push origin --delete feature/nova-feature
```

### Stash
```bash
# Stash mudanças temporárias
git stash

# Ver stashes
git stash list

# Aplicar stash
git stash pop

# Aplicar stash específico
git stash apply stash@{0}
```

### Reset (Cuidado!)
```bash
# Reset mantendo mudanças
git reset --soft HEAD~1

# Reset descartando mudanças
git reset --hard HEAD~1

# Reset para commit específico
git reset --hard <commit-hash>
```

## Boas Práticas

### Antes de Commitar
1. Verifique se mudanças estão funcionando
2. Execute testes se aplicável
3. Atualize documentação
4. Revise mudanças com `git diff`

### Antes de Push
1. Pull latest changes from main
2. Rebase se necessário
3. Resolva conflitos se houver
4. Teste novamente após merge

### Durante Code Review
1. Seja claro no título do PR
2. Forneça contexto nas descrições
3. Responda feedbacks prontamente
4. Faça commits adicionais se necessário

## Convenções Específicas por Agente

Cada agente tem convenções específicas detalhadas em seus respectivos arquivos:
- **PO-agent.md**: Convenções para specs (feat(spec), docs(spec))
- **Architect-agent.md**: Convenções para arquitetura (feat(arch), perf(arch))
- **Dev-agent.md**: Convenções para implementação (feat, fix, refactor)
- **QA-agent.md**: Convenções para testes (test, fix(test), docs(qa))

Consulte os arquivos específicos para detalhes de cada papel.
