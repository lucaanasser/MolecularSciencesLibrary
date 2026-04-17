/**
 * Responsabilidade: orquestrador unico de controller para disciplinas e avaliacoes.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas e delega ao AcademicDisciplinesService.
 * Dependencias criticas: service unificado, handlers de disciplinas/avaliacoes e logger padronizado.
 */

const academicDisciplinesService = require('../../../services/academic/disciplines/AcademicDisciplinesService');
const disciplinesHandlers = require('./handlers/disciplinesHandlers');
const catalogHandlers = require('./handlers/catalogHandlers');
const evaluationsHandlers = require('./handlers/evaluationsHandlers');
const { getLogger } = require('../../../shared/logging/logger');

class AcademicDisciplinesController {
    constructor() {
        this.service = academicDisciplinesService;
        this.log = getLogger(__filename);
    }
}

Object.assign(
    AcademicDisciplinesController.prototype,
    disciplinesHandlers,
    catalogHandlers,
    evaluationsHandlers
);

module.exports = new AcademicDisciplinesController();
