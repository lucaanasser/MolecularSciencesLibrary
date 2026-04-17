/**
 * Responsabilidade: orquestrar persistencia unificada de usuarios.
 * Camada: model.
 * Entradas/Saidas: expoe API de leitura/escrita para users.
 * Dependencias criticas: coreUserModel e queryUserModel.
 */

const coreUserModel = require('./modules/coreUserModel');
const queryUserModel = require('./modules/queryUserModel');

class UsersModel {}

Object.assign(
    UsersModel.prototype,
    coreUserModel,
    queryUserModel
);

module.exports = new UsersModel();
