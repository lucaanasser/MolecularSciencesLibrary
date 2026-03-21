# Como Criar Documentacao

Este guia define quando criar uma documentacao nova e em qual pasta ela deve ficar.

## 1) Escolha a pasta certa (decisao rapida)
- Quero ensinar o basico para quem esta entrando:
  - `00-COMECE-AQUI/`
- Quero ensinar como executar uma tarefa:
  - `01-GUIAS/`
- Quero definir regra obrigatoria:
  - `02-REGRAS/`
- Quero fornecer um modelo pronto para copiar:
  - `03-MODELOS/`
- Quero instruir resposta a incidente/operacao:
  - `04-OPERACAO/`
- Quero guardar contexto antigo sem poluir o atual:
  - `05-HISTORICO/`

## 2) Regra para nao inflar documentacao
Antes de criar um novo arquivo, responda:
1. Esse conteudo ja existe em outro arquivo?
2. O que muda se este arquivo nao existir?
3. Essa informacao e recorrente (vai ser usada de novo)?

Se nao for recorrente, prefira atualizar um arquivo existente.

## 3) Guia geral vs guia especifico
- Guia geral:
  - explica fluxo amplo de uma area
  - aponta links para casos especificos
- Guia especifico:
  - cobre uma tarefa pontual (ex.: importacao CSV)
  - deve ser curto e pratico

Evite duplicacao: o geral referencia o especifico, nao copia.

## 4) Tamanho e formato recomendado
- objetivo claro nas primeiras linhas
- passos curtos e operacionais
- exemplos minimos
- linguagem simples

## 5) Nomeacao recomendada
- iniciar com `GUIA_`, `PADRAO_`, `MODELO_` ou `RUNBOOK_` quando fizer sentido
- usar nomes diretos sobre o assunto

## 6) Ciclo de vida do documento
- ativo: usado no fluxo atual
- historico: somente referencia antiga

Quando um documento for substituido, mover para `05-HISTORICO/`.
