/**
 * Responsabilidade: compatibilidade de import para service legado de donators.
 * Camada: service.
 * Entradas/Saidas: reexporta service unificado do dominio donators.
 * Dependencias criticas: services/library/donators/DonatorsService.
 */

module.exports = require('./donators/DonatorsService');
