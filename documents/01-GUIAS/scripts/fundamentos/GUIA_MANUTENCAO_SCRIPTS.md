# GUIA DE MANUTENCAO E CRIACAO DE SCRIPTS

## Objetivo
Fornecer regras operacionais para humanos criarem e manterem scripts sem gerar caos de pastas ou quebrar automacoes.

---

## 1) Onde criar cada script
Use esta matriz de decisao:

- Se roda em automacao de banco, seed, import, scraper, notificacao backend:
  - criar em `backend/scripts/*`
- Se roda para inicializar/operar frontend (Nginx/SSL/build runtime):
  - criar em `frontend/scripts/*`
- Se o script e global (aliases, start/stop, deploy geral, troubleshooting local):
  - criar em `scripts/*`

Regra:
- script deve morar onde seu contexto de execucao pertence.

---

## 2) Como criar um script novo (passo a passo)
1. definir objetivo e periodicidade (manual, npm, cron, compose)
2. escolher pasta canonica pela matriz acima
3. implementar com cabecalho claro e validacao de argumentos
4. usar logger padronizado (Node) ou formato de log padrao (Shell)
5. adicionar comando em `package.json`/compose se necessario
6. documentar no README da pasta
7. validar em ambiente local

---

## 3) Convencoes obrigatorias
### Nome
- usar nomes descritivos em lowerCamelCase para Node: `syncSomething.js`
- usar kebab-case para shell: `setup-aliases.sh`

### Comentarios
- topo do arquivo: objetivo, entradas, saidas, efeitos colaterais
- funcoes principais: o que fazem e quais dependencias chamam

### Logs
- Node: usar `getLogger(__filename)`
- Shell: seguir cor/semantica do projeto (inicio/sucesso/aviso/erro)

### Saida
- sucesso: `process.exit(0)` / `exit 0`
- erro: `process.exit(1)` / `exit 1`

---

## 4) Reorganizacao sem quebra
Quando mover script ja existente:
1. mover para pasta canonica
2. criar wrapper no caminho antigo
3. atualizar chamadas diretas (quando seguro)
4. validar comandos existentes
5. remover wrapper apenas apos janela de migracao

Exemplo de wrapper Node:
```js
#!/usr/bin/env node
require('./operations/checkOverdues');
```

Exemplo de wrapper shell:
```sh
#!/bin/sh
exec /bin/sh /app/scripts/runtime/init-ssl.sh
```

---

## 5) Erros comuns a evitar
- colocar script de backend em `frontend/`
- duplicar script com mesma responsabilidade em duas pastas
- mover arquivo sem criar wrapper de compatibilidade
- usar caminho relativo fragil apos mudar profundidade de pasta
- deixar script sem documentacao de uso

---

## 6) Checklist rapido antes do merge
- [ ] Localizacao correta
- [ ] Nome padronizado
- [ ] Cabecalho e comentarios atualizados
- [ ] Logs padronizados
- [ ] Wrapper de compatibilidade (se aplicavel)
- [ ] Compose/npm/cron validos
- [ ] README da pasta atualizado

Fim.
