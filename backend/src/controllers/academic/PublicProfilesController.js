/**
 * Responsabilidade: compatibilidade de import para controller legado de perfis publicos.
 * Camada: controller.
 * Entradas/Saidas: reexporta controller unificado sem alterar contrato publico.
 * Dependencias criticas: controllers/academic/publicProfiles/PublicProfilesController.
 */

module.exports = require('./publicProfiles/PublicProfilesController');
