/**
 * Responsabilidade: adaptador legado de controller para compatibilidade da importacao antiga de avaliacao.
 * Camada: controller.
 * Entradas/Saidas: reexporta o orquestrador unificado academic/disciplines.
 * Dependencias criticas: AcademicDisciplinesController.
 */

module.exports = require('./disciplines/AcademicDisciplinesController');
