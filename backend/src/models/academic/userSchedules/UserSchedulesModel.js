/**
 * Responsabilidade: orquestrador unico de persistencia das grades/planos do usuario.
 * Camada: model.
 * Entradas/Saidas: centraliza CRUD de planos, turmas, disciplinas customizadas e disciplinas da lista.
 * Dependencias criticas: modulos internos de userSchedules (planos, turmas, customizadas e lista).
 */

const schedulesModel = require('./modules/schedulesModel');
const scheduleClassesModel = require('./modules/scheduleClassesModel');
const customDisciplinesReadModel = require('./modules/customDisciplinesReadModel');
const customDisciplinesWriteModel = require('./modules/customDisciplinesWriteModel');
const scheduleDisciplinesModel = require('./modules/scheduleDisciplinesModel');

class UserSchedulesModel {}

Object.assign(
    UserSchedulesModel.prototype,
    schedulesModel,
    scheduleClassesModel,
    customDisciplinesReadModel,
    customDisciplinesWriteModel,
    scheduleDisciplinesModel
);

module.exports = new UserSchedulesModel();
