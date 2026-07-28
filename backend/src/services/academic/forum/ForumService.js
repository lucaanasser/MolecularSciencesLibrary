/**
 * Responsabilidade: orquestrador unico de negocio do forum (MolecOverflow).
 * Camada: service.
 * Entradas/Saidas: centraliza regras de negocio para controllers do bloco academic/forum.
 * Dependencias criticas: modulos internos de escrita, notificacoes e validacoes (mesmo prototype).
 */

const forumWriteService = require('./modules/forumWriteService');
const forumNotificationsService = require('./modules/forumNotificationsService');
const forumValidators = require('./modules/forumValidators');

class ForumService {}

Object.assign(
    ForumService.prototype,
    forumWriteService,
    forumNotificationsService,
    forumValidators
);

module.exports = new ForumService();
