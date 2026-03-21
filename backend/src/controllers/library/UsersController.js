/**
 * Responsabilidade: compatibilidade de import para controller legado de users.
 * Camada: controller.
 * Entradas/Saidas: reexporta controller unificado do dominio users.
 * Dependencias criticas: controllers/library/users/UsersController.
 */

module.exports = require('./users/UsersController');
