# PROMPT TEMPLATE - CORRECAO DE BUG

Siga os documentos em `documents/` antes de editar.

Bug observado:
<descreva sintoma, erro e impacto>

Escopo permitido:
- <arquivo/pasta 1>

Escopo proibido:
- <arquivo/pasta 1>

Regras obrigatorias:
- corrigir causa raiz (nao apenas sintoma)
- minimizar risco de regressao
- manter contratos existentes
- aplicar logs de erro com contexto

Validacao obrigatoria:
- reproduzir erro antes (quando possivel)
- validar que o erro sumiu
- validar fluxo principal relacionado

Entrega esperada:
1. causa raiz identificada
2. mudanca aplicada
3. validacao de correcao
4. riscos residuais
