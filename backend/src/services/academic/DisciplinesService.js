/**
 * Responsabilidade: adaptador legado de service para compatibilidade da importacao antiga de disciplinas.
 * Camada: service.
 * Entradas/Saidas: reexporta o orquestrador unificado academic/disciplines.
 * Dependencias criticas: AcademicDisciplinesService.
 */

module.exports = require('./disciplines/AcademicDisciplinesService');
