/**
 * Responsabilidade: orquestrador unico do controller do Fórum (Stack UnderFlow).
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas (via wrapper com this=singleton) e delega aos handlers.
 * Dependencias criticas: ForumService, ForumModel, handlers modulares e helpers no prototype.
 *
 * Admin (role='admin') tem poderes de moderação.
 * Padrão de logs: getLogger(__filename) por módulo (start/success/warn/error).
 *
 * Observacao: os handlers usam this.formatQuestionRow / this.isAdmin / this.getAdminUsers,
 *             portanto os helpers precisam estar no mesmo prototype (Object.assign abaixo).
 */

const ForumService = require('../../../services/academic/forum/ForumService');
const ForumModel = require('../../../models/academic/forum/ForumModel');
const { getLogger } = require('../../../shared/logging/logger');

const forumHelpers = require('./handlers/forumHelpers');
const questionsReadController = require('./handlers/questionsReadController');
const questionsWriteController = require('./handlers/questionsWriteController');
const answersController = require('./handlers/answersController');
const votesController = require('./handlers/votesController');
const tagsController = require('./handlers/tagsController');
const moderationController = require('./handlers/moderationController');
const engagementController = require('./handlers/engagementController');
const statsController = require('./handlers/statsController');

class ForumController {
    constructor() {
        this.service = ForumService;
        this.model = ForumModel;
        this.log = getLogger(__filename);
    }
}

Object.assign(
    ForumController.prototype,
    forumHelpers,
    questionsReadController,
    questionsWriteController,
    answersController,
    votesController,
    tagsController,
    moderationController,
    engagementController,
    statsController
);

module.exports = new ForumController();
