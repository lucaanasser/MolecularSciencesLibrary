/**
 * Responsabilidade: orquestrar casos de uso unificados de usuarios.
 * Camada: service.
 * Entradas/Saidas: expoe API publica para controllers de users.
 * Dependencias criticas: lifecycleUserService, authUserService e csvUserService.
 */

const lifecycleUserService = require('./modules/lifecycleUserService');
const authUserService = require('./modules/authUserService');
const csvUserService = require('./modules/csvUserService');

class UsersService {}

Object.assign(
    UsersService.prototype,
    lifecycleUserService,
    authUserService,
    csvUserService
);

module.exports = new UsersService();
