/**
 * Responsabilidade: orquestrador unico de controller para perfis publicos academicos.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de perfis publicos e delega aos handlers especializados.
 * Dependencias criticas: handlers de perfil, avatar, sandbox, ciclos avancados, secoes, pos-CM, tags e follows.
 */

const profileMainController = require('./handlers/profileMainController');
const avatarController = require('./handlers/avatarController');
const sandboxPublishController = require('./handlers/sandboxPublishController');
const advancedCyclesController = require('./handlers/advancedCyclesController');
const profileSectionsController = require('./handlers/profileSectionsController');
const postCmController = require('./handlers/postCmController');
const tagsFollowsController = require('./handlers/tagsFollowsController');

class PublicProfilesController {}

Object.assign(
    PublicProfilesController.prototype,
    profileMainController,
    avatarController,
    sandboxPublishController,
    advancedCyclesController,
    profileSectionsController,
    postCmController,
    tagsFollowsController
);

module.exports = new PublicProfilesController();
