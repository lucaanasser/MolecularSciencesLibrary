# Utils (compatibilidade)

A pasta `utils` foi mantida para compatibilidade de imports antigos.

## Objetivo atual
- Evitar quebra imediata de codigo legado.
- Reexportar implementacoes que agora moram em pastas semanticas (`shared` e `domain-config`).

## Mapeamento
- `caseConverter.js` -> `../shared/transform/caseConverter`
- `csvUtils.js` -> `../shared/csv/csvUtils`
- `imageUpload.js` -> `../shared/files/imageUpload`
- `validBookAreas.js` -> `../domain-config/library/bookAreas`
- `validLoanRules.js` -> `../domain-config/library/loanRules`
- `generateFrontendConstants.js` -> `../../scripts/generateFrontendConstants`

## Por que existe `module.exports` em todos?
Este backend usa CommonJS (Node com `require`).
Cada arquivo de `utils` exporta o modulo real com `module.exports = require(...)` para funcionar como "ponte" de compatibilidade.
