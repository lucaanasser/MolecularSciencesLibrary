/**
 * O que faz: fachada de compatibilidade — reexporta ProfileTransformer e os erros do submodulo profileTransformer/.
 * Camada: Service.
 * Entradas/Saidas: N/A (reexport).
 * Dependencias criticas: ./profileTransformer/ProfileTransformer.
 * Efeitos colaterais: nenhum.
 */
module.exports = require('./profileTransformer/ProfileTransformer');
