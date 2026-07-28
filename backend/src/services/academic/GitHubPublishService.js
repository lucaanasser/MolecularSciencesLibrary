/**
 * O que faz: fachada de compatibilidade — reexporta a CLASSE GitHubPublishService do submodulo gitHubPublish/.
 * Camada: Service.
 * Entradas/Saidas: N/A (reexport).
 * Dependencias criticas: ./gitHubPublish/GitHubPublishService.
 * Efeitos colaterais: nenhum.
 */
module.exports = require('./gitHubPublish/GitHubPublishService');
