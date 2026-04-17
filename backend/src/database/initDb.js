const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { getLogger } = require('../shared/logging/logger');

const { run, get, close } = require('./shared/sqliteHelpers');
const { initLibraryDb } = require('./library/initLibraryDb');
const { initUtilitiesDb } = require('./utilities/initUtilitiesDb');
const { initAcademicDb } = require('./academic/initAcademicDb');

const log = getLogger(__filename);

const projectRoot = path.resolve(__dirname, '..', '..', '..');
const defaultDbPath = path.join(projectRoot, 'database', 'library.db');
const dbUrl = process.env.DATABASE_URL || `sqlite://${defaultDbPath}`;
const dbPath = dbUrl.replace('sqlite://', '');
const dbDir = path.dirname(dbPath);
const SALT_ROUNDS = 10;

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    fs.chmodSync(dbDir, 0o777);
}

const db = new sqlite3.Database(dbPath, function onDatabaseOpen(err) {
    if (err) {
        log.error('Erro ao criar banco de dados', { err: err.message, db_path: dbPath });
        process.exit(1);
    }
    log.success('Conectado ao banco de dados SQLite', { db_path: dbPath });
});

/**
 * O que faz: orquestra bootstrap de schema por dominios e fechamento seguro da conexao.
 * Onde e usada: execucao direta de initDb.js via scripts start/init-db.
 * Dependencias chamadas: initLibraryDb, initUtilitiesDb, initAcademicDb e close.
 * Efeitos colaterais: cria/atualiza schema no SQLite e encerra conexao.
 */
async function initializeDatabase() {
    log.start('Inicializando banco de dados', { db_path: dbPath });

    const context = {
        run: (sql, params = []) => run(db, sql, params),
        get: (sql, params = []) => get(db, sql, params),
        bcrypt,
        saltRounds: SALT_ROUNDS,
        adminPassword: process.env.ADMIN_PASSWORD || 'adminsenha',
        proalunoPassword: process.env.PROALUNO_PASSWORD || 'proalunosenha'
    };

    try {
        await initLibraryDb(context);
        await initUtilitiesDb(context);
        await initAcademicDb(context);
        log.success('Inicializacao por dominios concluida com sucesso');
    } catch (err) {
        log.error('Erro durante inicializacao por dominios', { err: err.message });
        process.exitCode = 1;
    } finally {
        try {
            await close(db);
            log.success('Conexao com banco de dados encerrada');
        } catch (closeErr) {
            log.error('Erro ao fechar banco de dados', { err: closeErr.message });
            process.exitCode = 1;
        }
    }
}

initializeDatabase();
