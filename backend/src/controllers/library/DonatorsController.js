/**
 * Responsabilidade: compatibilidade de import para controller legado de donators.
 * Camada: controller.
 * Entradas/Saidas: reexporta controller unificado do dominio donators.
 * Dependencias criticas: controllers/library/donators/DonatorsController.
 */

module.exports = require('./donators/DonatorsController');
