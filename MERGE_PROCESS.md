# Processo de Merge Manual

## Quando Usar
Quando não há acesso direto ao GitHub/GitLab na máquina de desenvolvimento.

## Fluxo Completo

### 1. Identificar Branches Prontas para Merge
```bash
# Listar branches locais
git branch -a

# Verificar commits em cada branch
git log nome-da-branch --oneline
```

### 2. Transferir para Máquina com Acesso GitHub
1. Zipar repositório completo (incluindo pasta .git)
2. Transferir para máquina com acesso GitHub
3. Descompactar

### 3. Push das Branches para GitHub
```bash
# Para cada branch
git checkout nome-da-branch
git push origin nome-da-branch
```

### 4. Criar Pull Requests no GitHub
1. Acessar repositório no GitHub
2. Criar PR para cada branch seguindo ordem SDD:
   - spec/* → arch/* → ops/* → backend/* → test/*
3. Revisar mudanças
4. Fazer merge após aprovação

### 5. Pull Atualizações
```bash
# Na máquina com GitHub
git checkout master
git pull origin master
```

### 6. Retornar para Máquina de Desenvolvimento
1. Zipar repositório atualizado
2. Transferir de volta
3. Descompactar
4. Continuar trabalho

## Ordem de Merge (SDD)
1. **PO** (spec/*) - Requisitos de negócio
2. **Architect** (arch/*) - Decisões arquiteturais
3. **DevOps** (ops/*) - Infraestrutura e operações
4. **Dev** (backend/*, frontend/*) - Implementação
5. **QA** (test/*) - Testes

## Resolução de Conflitos
Se houver conflito durante merge:
1. Resolver conflitos no GitHub ou localmente
2. Testar solução
3. Fazer commit da resolução
4. Continuar merge
