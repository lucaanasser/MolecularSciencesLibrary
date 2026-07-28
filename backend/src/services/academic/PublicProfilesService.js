/**
 * Fachada de compatibilidade: mantem o caminho antigo do PublicProfilesService.
 * Camada: service.
 * Reexporta o orquestrador modularizado em ./publicProfiles/PublicProfilesService.
 */

module.exports = require('./publicProfiles/PublicProfilesService');
