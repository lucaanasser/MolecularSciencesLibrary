/**
 * Responsabilidade: inicializar schema do dominio academic.
 * Camada: database/academic.
 * Entradas/Saidas: recebe contexto de inicializacao e executa criacao de tabelas por subdominio.
 * Dependencias criticas: modules de schedules/forum/profiles/evaluations.
 */

const { initSchedulesSchema } = require('./modules/schedulesSchema');
const { initForumSchema } = require('./modules/forumSchema');
const { initProfilesSchema } = require('./modules/profilesSchema');
const { initEvaluationsSchema } = require('./modules/evaluationsSchema');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: executa bootstrap do dominio academic por submodulos.
 * Onde e usada: initDb.initializeDatabase.
 * Dependencias chamadas: initSchedulesSchema, initForumSchema, initProfilesSchema e initEvaluationsSchema.
 * Efeitos colaterais: cria/atualiza tabelas academicas e indices relacionados.
 */
async function initAcademicDb(context) {
    log.start('Iniciando bootstrap do dominio academic');

    await initSchedulesSchema(context);
    await initForumSchema(context);
    await initProfilesSchema(context);
    await initEvaluationsSchema(context);

    log.success('Bootstrap do dominio academic concluido');
}

module.exports = {
    initAcademicDb
};
