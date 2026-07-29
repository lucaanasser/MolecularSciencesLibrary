/**
 * Responsabilidade: orquestrador unico de controller para grades/planos de usuarios.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de user-schedules e delega aos handlers especializados.
 * Dependencias criticas: handlers de schedules, turmas, customizadas, conflitos/creditos e disciplinas.
 */

const schedulesController = require('./handlers/schedulesController');
const scheduleClassesController = require('./handlers/scheduleClassesController');
const customDisciplinesController = require('./handlers/customDisciplinesController');
const conflictsCreditsController = require('./handlers/conflictsCreditsController');
const scheduleDisciplinesController = require('./handlers/scheduleDisciplinesController');

class UserSchedulesController {}

Object.assign(
    UserSchedulesController.prototype,
    schedulesController,
    scheduleClassesController,
    customDisciplinesController,
    conflictsCreditsController,
    scheduleDisciplinesController
);

module.exports = new UserSchedulesController();
