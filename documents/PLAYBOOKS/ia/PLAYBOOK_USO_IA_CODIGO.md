# PLAYBOOK DE USO DE IA PARA CODIGO (PARA IA E REVISORES)

## 1) Objetivo
Padronizar o uso de IA na implementacao de codigo para evitar:
- mudancas sem criterio
- quebra de arquitetura
- codigo sem rastreabilidade
- dependencia cega da IA

Este playbook e obrigatorio para qualquer contribuicao com apoio de IA.

---

## 2) Principios obrigatorios
1. IA acelera, humano decide.
2. Nenhuma resposta de IA e verdade sem validacao local.
3. Arquitetura do repositorio prevalece sobre sugestao da IA.
4. Toda mudanca relevante precisa de justificativa tecnica simples.
5. Compatibilidade e seguranca vem antes de "codigo bonito".

---

## 3) O que a IA PODE fazer
- propor refatoracao com passos pequenos
- criar boilerplate de modulo, controller, service e script
- sugerir testes e cenarios de validacao
- ajudar a localizar acoplamento, duplicacao e risco de regressao
- gerar documentacao tecnica e checklists

## 4) O que a IA NAO PODE fazer sem aprovacao explicita
- apagar codigo legado em producao
- alterar contratos de API publicos
- mover arquivos em massa sem plano de compatibilidade
- editar secrets, credenciais ou configuracoes sensiveis
- introduzir dependencia externa sem justificativa e revisao

---

## 5) Fluxo obrigatorio para tarefas com IA
1. Diagnostico
- mapear arquivos impactados
- mapear referencias cruzadas (npm/compose/scripts/routes)
- listar risco de quebra

2. Plano curto
- definir objetivo da mudanca
- definir estrategia de compatibilidade
- definir validacao minima

3. Implementacao incremental
- mudancas pequenas e reversiveis
- preservar comportamento externo na primeira entrega
- manter logs e comentarios obrigatorios

4. Validacao tecnica
- verificar erros de analise nos arquivos alterados
- executar pelo menos 1 smoke test real do fluxo alterado
- validar comandos/scripts impactados

5. Documentacao
- atualizar guia/playbook/template impactado no mesmo ciclo

---

## 6) Prompt padrao para pedir codigo para IA
Use os templates em `documents/TEMPLATES/ia/`.

Template base:

"Siga os guias em documents/GUIAS.
Objetivo: <objetivo claro em 1 frase>.
Escopo permitido: <arquivos/pastas>.
Escopo proibido: <arquivos/pastas>.
Regras obrigatorias:
- manter compatibilidade externa
- usar logger padronizado
- respeitar arquitetura de camadas
- criar/atualizar comentarios obrigatorios
Validacao obrigatoria:
- checar erros nos arquivos alterados
- executar smoke test minimo
Entrega:
- resumo do que mudou
- riscos remanescentes
- proximo passo recomendado."

---

## 7) Regras de qualidade para codigo gerado por IA
- sem funcoes gigantes sem justificativa
- sem duplicacao evitavel
- sem comentarios vagos
- sem logs sem contexto
- sem nomes genericos (ex: data2, tempFinal, helperX)
- sem "TODO" sem ticket associado

---

## 8) Criterio minimo de aprovacao de mudanca com IA
- O PR descreve onde a IA foi usada.
- Mudancas seguem os playbooks do projeto.
- Nao houve quebra de contrato externo.
- Logs e comentarios obrigatorios foram aplicados.
- Validacao minima foi executada e registrada.
- Documentacao impactada foi atualizada.

---

## 9) Politica de rastreabilidade
No PR, incluir secao:
- "Uso de IA"
- "Partes geradas com IA"
- "Partes revisadas/ajustadas manualmente"
- "Validacoes executadas"

Sem isso, PR deve ser considerado incompleto.

Fim.
