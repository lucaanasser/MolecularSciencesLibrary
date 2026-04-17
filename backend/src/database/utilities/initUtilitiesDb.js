/**
 * Responsabilidade: inicializar schema do dominio utilities.
 * Camada: database/utilities.
 * Entradas/Saidas: recebe contexto de inicializacao e executa criacao de tabelas utilitarias.
 * Dependencias criticas: utilitiesSchema.
 */

const { initUtilitiesSchema } = require('./modules/utilitiesSchema');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: executa criacao de schema do dominio utilities.
 * Onde e usada: initDb.initializeDatabase.
 * Dependencias chamadas: initUtilitiesSchema.
 * Efeitos colaterais: cria/atualiza tabelas utilitarias no banco.
 */
async function initUtilitiesDb(context) {
    log.start('Iniciando bootstrap do dominio utilities');

    await initUtilitiesSchema(context);

    log.success('Bootstrap do dominio utilities concluido');
}

module.exports = {
    initUtilitiesDb
};
