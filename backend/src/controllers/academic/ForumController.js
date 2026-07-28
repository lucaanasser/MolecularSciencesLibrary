/**
 * Fachada de compatibilidade: mantem o caminho antigo do controller do Fórum.
 * O controller foi modularizado em ./forum/ (orquestrador + handlers).
 * Reexporta o singleton novo para preservar os imports existentes.
 */

module.exports = require('./forum/ForumController');
