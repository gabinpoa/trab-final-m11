# Processo de Merge Local Sequencial

## Quando Usar
Quando não há acesso direto ao GitHub/GitLab na máquina de desenvolvimento.

## Estratégia: Merge Local Sequencial
Cada agente trabalha em sua branch específica, e você faz merge local sequencialmente seguindo o ciclo SDD. Apenas uma transferência no final.

## Fluxo Completo

### 1. PO Trabalha em Branch
```bash
# PO cria branch e trabalha
git checkout -b spec/nome-da-feature
# PO faz commits locais
```

### 2. Merge Local da Branch do PO
```bash
# Quando PO terminar
git checkout master
git merge spec/nome-da-feature
# Resolver conflitos se houver
git branch -d spec/nome-da-feature
```

### 3. Architect Trabalha em Branch
```bash
# Architect cria branch baseado no master atualizado
git checkout -b arch/nome-da-feature
# Architect faz commits locais
```

### 4. Merge Local da Branch do Architect
```bash
# Quando Architect terminar
git checkout master
git merge arch/nome-da-feature
# Resolver conflitos se houver
git branch -d arch/nome-da-feature
```

### 5. Repetir para DevOps, Dev, QA
```bash
# DevOps: ops/nome-da-feature → merge local
# Dev: backend/nome-da-feature → merge local
# QA: test/nome-da-feature → merge local
```

### 6. Transferência Final para GitHub
1. Zipar repositório completo (incluindo .git)
2. Transferir para máquina com acesso GitHub
3. Descompactar

### 7. Push Final para GitHub
```bash
# Push do master atualizado com todos os merges
git push origin master
```

## Ordem de Merge Local (SDD)
1. **PO** (spec/*) → merge local → master
2. **Architect** (arch/*) → merge local → master
3. **DevOps** (ops/*) → merge local → master
4. **Dev** (backend/*, frontend/*) → merge local → master
5. **QA** (test/*) → merge local → master

## Resolução de Conflitos Locais
Se houver conflito durante merge local:
```bash
# Durante merge local
git merge nome-da-branch
# Resolver conflitos nos arquivos
git add .
git commit -m "resolve: merge conflicts for nome-da-branch"
```

## Benefícios
- Apenas uma transferência no final
- Merge local é rápido e simples
- Histórico organizado por agente
- Menos propenso a conflitos durante desenvolvimento
- Pode testar entre cada merge
