/**
 * Responsabilidade: orquestrador unico de negocio para perfis publicos academicos.
 * Camada: service.
 * Entradas/Saidas: expoe API publica de perfis para controllers do bloco academic/publicProfiles.
 * Dependencias criticas: ProfileTransformer e modulos internos de service (montagem, sandbox, enriquecimento e matching de roster).
 */

const { ProfileTransformer } = require('../ProfileTransformer');

const profileAssemblyService = require('./modules/profileAssemblyService');
const sandboxPublishPrepService = require('./modules/sandboxPublishPrepService');
const disciplineCatalogEnrichment = require('./modules/disciplineCatalogEnrichment');
const rosterNameMatcher = require('./modules/rosterNameMatcher');

class PublicProfilesService {
    constructor() {
        this.profileTransformer = new ProfileTransformer();
    }
}

Object.assign(
    PublicProfilesService.prototype,
    profileAssemblyService,
    sandboxPublishPrepService,
    disciplineCatalogEnrichment,
    rosterNameMatcher
);

module.exports = new PublicProfilesService();
