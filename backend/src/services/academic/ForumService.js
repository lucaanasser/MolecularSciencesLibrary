/**
 * Fachada de compatibilidade: mantem o caminho antigo do ForumService.
 * A implementacao vive em ./forum (orquestrador + modulos).
 */
module.exports = require('./forum/ForumService');
