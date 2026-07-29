/**
 * Responsabilidade: orquestrador unico de persistencia do forum (MolecOverflow).
 * Camada: model.
 * Entradas/Saidas: centraliza metodos de perguntas, respostas, tags, votos, estatisticas, denuncias e engajamento.
 * Dependencias criticas: modulos internos do forum (mesmo prototype via this.<sibling>) e logger padronizado.
 */

const questionsModel = require('./modules/questionsModel');
const questionsListModel = require('./modules/questionsListModel');
const answersModel = require('./modules/answersModel');
const tagsModel = require('./modules/tagsModel');
const tagsAdminModel = require('./modules/tagsAdminModel');
const votesModel = require('./modules/votesModel');
const statsModel = require('./modules/statsModel');
const moderationReportsModel = require('./modules/moderationReportsModel');
const engagementModel = require('./modules/engagementModel');
const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

class ForumModel {}

// Composicao: todos os modulos vivem no mesmo prototype, permitindo this.<sibling> entre eles.
Object.assign(
    ForumModel.prototype,
    questionsModel,
    questionsListModel,
    answersModel,
    tagsModel,
    tagsAdminModel,
    votesModel,
    statsModel,
    moderationReportsModel,
    engagementModel
);

log.success('ForumModel composto a partir dos modulos');

module.exports = new ForumModel();
