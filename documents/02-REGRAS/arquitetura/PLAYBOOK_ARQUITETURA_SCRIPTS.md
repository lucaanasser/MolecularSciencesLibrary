# PLAYBOOK DE ARQUITETURA DE SCRIPTS (PARA IA)

## 1) Objetivo
Padronizar criacao, organizacao e manutencao de scripts em todo o repositorio.

Este playbook e obrigatorio para qualquer refatoracao ou criacao de script.

---

## 2) Regra Mestra de Localizacao
Escolha a pasta pelo escopo real de execucao:

- `scripts/` (raiz): scripts globais, DevOps local, automacao multi-servico.
- `backend/scripts/`: scripts de dominio backend (dados, jobs, integracoes backend).
- `frontend/scripts/`: scripts de runtime/build/deploy do frontend.

Proibicoes:
- nao criar script backend em `scripts/` sem justificativa.
- nao criar script de frontend na raiz de `frontend/` (usar `frontend/scripts/`).
- nao colocar script de banco em `frontend/scripts/`.

---

## 3) Estrutura Canonica
### 3.1 Backend
- `backend/scripts/operations/` -> jobs recorrentes (cron, scraping operacional)
- `backend/scripts/data/` -> seed, importacao, limpeza de cenarios
- `backend/scripts/integration/` -> sincronizacao backend->frontend
- `backend/scripts/legacy-migrations/` -> historico de migracoes manuais

### 3.2 Frontend
- `frontend/scripts/runtime/` -> inicializacao de container/web server (SSL, bootstrap)

### 3.3 Root
- `scripts/` -> aliases, start/stop, troubleshooting, backup global, utilitarios de ambiente

---

## 4) Regra de Compatibilidade
Durante reorganizacao:
- manter wrappers nos caminhos antigos (`require`/`exec`) para evitar quebra imediata.
- wrappers devem conter comentario explicito de compatibilidade.
- remover wrappers apenas apos janela de migracao documentada.

Janela recomendada: 1-2 releases.

---

## 5) Padrao Minimo de Script
Todo script novo deve ter:
1. shebang (`#!/usr/bin/env node` ou `#!/bin/sh`)
2. cabecalho com responsabilidade, entradas e saidas
3. validacao de parametros obrigatorios
4. codigos de saida (`0` sucesso, `1` erro)
5. logs padronizados com `getLogger(__filename)` para Node

Para Node:
- usar `backend/src/shared/logging/logger.js`
- preferir funcoes nomeadas para inferencia automatica de `FunctionName`

---

## 6) Regras de Manutencao
- evitar logica de negocio complexa em scripts; delegar para service/model.
- scripts devem ser idempotentes quando aplicavel.
- caminhos de arquivo devem ser construidos com `path.resolve/path.join`.
- toda mudanca de caminho exige atualizar Docker/compose/package scripts ou manter wrapper.
- script sem dono claro nao deve ser criado.

---

## 7) Processo Obrigatorio (IA)
1. mapear referencias do script (compose, npm scripts, cron, docs)
2. definir pasta canonica pelo escopo
3. mover/implementar script
4. criar wrapper de compatibilidade se houver risco de quebra
5. validar execucao minima
6. atualizar documentacao

---

## 8) Checklist de Entrega
- [ ] Script no diretorio correto
- [ ] Sem script novo solto na raiz de backend/frontend
- [ ] Wrapper criado (quando necessario)
- [ ] Compose/npm continuam funcionando
- [ ] Logs e codigos de saida padronizados
- [ ] Documentacao atualizada

Fim.
