/**
 * Responsabilidade: orquestrador unico de negocio para planos/grades do usuario.
 * Camada: service.
 * Entradas/Saidas: agrega os modulos de service do bloco academic/userSchedules para os controllers.
 * Dependencias criticas: modulos internos combinados no mesmo prototype (compartilham this).
 */

const schedulesService = require('./modules/schedulesService');
const scheduleClassesService = require('./modules/scheduleClassesService');
const customDisciplinesService = require('./modules/customDisciplinesService');
const conflictsCreditsService = require('./modules/conflictsCreditsService');
const scheduleDisciplinesService = require('./modules/scheduleDisciplinesService');

class UserSchedulesService {}

// Combina todos os modulos no mesmo prototype: a guarda de ownership this.getScheduleById
// e os helpers this.getNextColor/getFullSchedule/hasTimeOverlap ficam acessiveis a todos.
Object.assign(
    UserSchedulesService.prototype,
    schedulesService,
    scheduleClassesService,
    customDisciplinesService,
    conflictsCreditsService,
    scheduleDisciplinesService
);

module.exports = new UserSchedulesService();
