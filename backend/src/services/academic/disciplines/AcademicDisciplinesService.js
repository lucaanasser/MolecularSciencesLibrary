/**
 * Responsabilidade: orquestrador unico de negocio para disciplinas e avaliacoes.
 * Camada: service.
 * Entradas/Saidas: centraliza regras de negocio para controllers do bloco academic/disciplines.
 * Dependencias criticas: AcademicDisciplinesModel e modulos internos de service.
 */

const academicDisciplinesModel = require('../../../models/academic/disciplines/AcademicDisciplinesModel');

const disciplinesManagementService = require('./modules/disciplinesManagementService');
const disciplinesQueryService = require('./modules/disciplinesQueryService');
const evaluationsManagementService = require('./modules/evaluationsManagementService');
const evaluationsQueryService = require('./modules/evaluationsQueryService');
const validationsService = require('./modules/validationsService');

class AcademicDisciplinesService {
    constructor() {
        this.model = academicDisciplinesModel;
    }
}

Object.assign(
    AcademicDisciplinesService.prototype,
    disciplinesManagementService,
    disciplinesQueryService,
    evaluationsManagementService,
    evaluationsQueryService,
    validationsService
);

module.exports = new AcademicDisciplinesService();
