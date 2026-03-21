/**
 * Responsabilidade: inicializar schema e seeds do dominio library.
 * Camada: database/library.
 * Entradas/Saidas: recebe contexto de inicializacao e executa criacao de tabelas/seed.
 * Dependencias criticas: librarySchema e librarySeeds.
 */

const { createLibraryTables } = require('./modules/librarySchema');
const { seedSpecialUsers } = require('./modules/librarySeeds');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: executa criacao de tabelas e seeds do dominio library.
 * Onde e usada: initDb.initializeDatabase.
 * Dependencias chamadas: createLibraryTables e seedSpecialUsers.
 * Efeitos colaterais: cria schema e usuarios especiais no banco.
 */
async function initLibraryDb(context) {
    log.start('Iniciando bootstrap do dominio library');

    await createLibraryTables(context);
    await seedSpecialUsers(context);

    log.success('Bootstrap do dominio library concluido');
}

module.exports = {
    initLibraryDb
};
