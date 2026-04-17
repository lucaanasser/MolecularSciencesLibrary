/**
 * Responsabilidade: compatibilidade de import para model legado de users.
 * Camada: model.
 * Entradas/Saidas: reexporta model unificado do dominio users.
 * Dependencias criticas: models/library/users/UsersModel.
 */

module.exports = require('./users/UsersModel');
