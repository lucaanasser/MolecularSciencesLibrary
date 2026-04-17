/**
 * Responsabilidade: compatibilidade de import para service legado de users.
 * Camada: service.
 * Entradas/Saidas: reexporta service unificado do dominio users.
 * Dependencias criticas: services/library/users/UsersService.
 */

module.exports = require('./users/UsersService');
