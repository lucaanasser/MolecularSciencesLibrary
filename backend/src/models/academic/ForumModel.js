/**
 * Fachada de compatibilidade do ForumModel.
 * O modelo real foi modularizado em ./forum/ (orquestrador ForumModel.js + modules/).
 * Este arquivo apenas reexporta a instancia singleton para nao quebrar imports
 * existentes que ainda apontam para este caminho antigo.
 */

module.exports = require('./forum/ForumModel');
