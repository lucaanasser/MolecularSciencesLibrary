# GitHub App Sandbox Smoke Test

## Objetivo
Validar que o GitHub App da Biblioteca consegue criar branch, commit e pull request apenas em repositorios sandbox.

## Workflow
Arquivo: `.github/workflows/sandbox-github-app-smoke.yml`

Execucao manual via `workflow_dispatch`.

## Secrets necessarios no repositorio da Biblioteca
- `GH_APP_ID`
- `GH_APP_PRIVATE_KEY`

## Inputs da execucao
- `target_repo` (default: `ccm-website-public-sandbox`)
- `base_branch` (default: `main`)

## Comportamento esperado
1. Gera token de instalacao do App.
2. Faz checkout do repositorio sandbox selecionado.
3. Cria branch temporaria `bot/sandbox-smoke-...`.
4. Adiciona arquivo canario em `automation/smoke-tests/`.
5. Faz commit e push.
6. Abre pull request para `base_branch`.

## Validacao de seguranca
- O PR deve aparecer somente no repositorio sandbox escolhido.
- Nao deve haver escrita em repositorios oficiais.

## Caso de erro comum
### 403 ao abrir PR ou fazer push
Verificar:
- Instalacao do App apenas nos repositorios sandbox corretos.
- Permissoes do App:
  - Contents: Read and write
  - Pull requests: Read and write

### Secret ausente
Confirmar se os dois secrets estao cadastrados no repositorio da Biblioteca.

## Operacao recomendada
- Rodar primeiro em `ccm-website-public-sandbox`.
- Depois repetir em `CMsite-sandbox`.
- Manter os repositorios oficiais fora da instalacao do App durante testes.
