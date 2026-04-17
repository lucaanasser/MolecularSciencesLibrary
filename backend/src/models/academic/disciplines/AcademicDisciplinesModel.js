/**
 * Responsabilidade: orquestrador unico de persistencia para disciplinas e avaliacoes.
 * Camada: model.
 * Entradas/Saidas: centraliza metodos de consulta, escrita e workflow academico.
 * Dependencias criticas: modulos internos de disciplinas e evaluacoes.
 */

const disciplinesQueriesModel = require('./modules/disciplinesQueriesModel');
const disciplinesStructureModel = require('./modules/disciplinesStructureModel');
const disciplinesWorkflowModel = require('./modules/disciplinesWorkflowModel');
const evaluationsCrudModel = require('./modules/evaluationsCrudModel');
const evaluationsReadModel = require('./modules/evaluationsReadModel');
const evaluationsEngagementModel = require('./modules/evaluationsEngagementModel');

class AcademicDisciplinesModel {}

Object.assign(
    AcademicDisciplinesModel.prototype,
    disciplinesQueriesModel,
    disciplinesStructureModel,
    disciplinesWorkflowModel,
    evaluationsCrudModel,
    evaluationsReadModel,
    evaluationsEngagementModel
);

module.exports = new AcademicDisciplinesModel();
