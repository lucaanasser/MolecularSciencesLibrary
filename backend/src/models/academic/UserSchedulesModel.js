/**
 * Responsabilidade: adaptador legado de modelo para compatibilidade da importacao antiga de grades/planos.
 * Camada: model.
 * Entradas/Saidas: reexporta o orquestrador unificado academic/userSchedules.
 * Dependencias criticas: UserSchedulesModel (orquestrador).
 */

module.exports = require('./userSchedules/UserSchedulesModel');
