# PADRAO OFICIAL DE USO DE IA

## Objetivo
Definir regras obrigatorias para uso de IA na geracao, revisao e manutencao de codigo.

## Regras obrigatorias
1. IA é apoio, nao autoridade tecnica final.
2. Toda mudanca de IA deve ser validada localmente.
3. Nao alterar contrato externo sem plano de compatibilidade.
4. Nao aceitar codigo sem logs e comentarios exigidos pelos guias.
5. Nao fazer mudancas grandes sem fatiar em etapas pequenas.
6. Nao introduzir dependencias novas sem justificativa.

## Proibicoes
- copiar resposta de IA direto para producao sem revisao
- remover legado sem janela de migracao
- editar credenciais/secrets orientado por IA
- fazer refatoracao transversal sem mapear referencias

## Padrao minimo de entrega com IA
- contexto da mudanca
- escopo permitido/proibido
- validacao executada
- riscos remanescentes

## Comportamento esperado de codigo gerado
- coeso
- legivel
- sem duplicacao evitavel
- com nomes semanticos
- com logs e comentarios padronizados

## Referencias
- PLAYBOOKS/ia/PLAYBOOK_USO_IA_CODIGO.md
- GUIAS/ia/GUIA_USO_IA_PARA_ALUNOS.md
- TEMPLATES/ia/
