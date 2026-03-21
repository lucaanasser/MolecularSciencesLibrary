const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');
const { getLogger } = require('../shared/logging/logger');

const log = getLogger(__filename);

// Database configuration - usar pasta database na raiz do projeto (fora de backend)
const projectRoot = path.resolve(__dirname, '..', '..', '..');
const defaultDbPath = path.join(projectRoot, 'database', 'library.db');
const dbUrl = process.env.DATABASE_URL || `sqlite://${defaultDbPath}`;
const dbPath = dbUrl.replace('sqlite://', '');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    fs.chmodSync(dbDir, 0o777);
}

log.start('Inicializando conexao principal do banco', { db_path: dbPath });

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        log.error('Erro ao abrir banco de dados', { err: err.message, db_path: dbPath });
        process.exit(1);
    }
    log.success('Conectado ao banco de dados SQLite', { db_path: dbPath });
    
    // Configurar timeout para evitar SQLITE_BUSY
    db.configure("busyTimeout", 30000);
    
    // Configurar WAL mode para melhor concorrência
    db.run("PRAGMA journal_mode=WAL", (err) => {
        if (err) {
            log.warn('Nao foi possivel configurar WAL mode', { err: err.message });
        } else {
            log.success('WAL mode configurado para melhor concorrencia');
        }
    });
    
    // Configurar busy timeout via PRAGMA
    db.run("PRAGMA busy_timeout=30000", (err) => {
        if (err) {
            log.warn('Nao foi possivel configurar busy_timeout', { err: err.message });
        } else {
            log.success('Busy timeout configurado para 30 segundos');
        }
    });
});

/**
 * O que faz: executa SQL de escrita e retorna metadados da operacao.
 * Onde e usada: camada model em toda aplicacao.
 * Dependencias chamadas: sqlite3.Database.run.
 * Efeitos colaterais: altera dados no banco.
 */
function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                log.error('Erro ao executar query de escrita', { err: err.message });
                return reject(err);
            }
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

/**
 * O que faz: executa SQL de leitura unitária e retorna uma linha.
 * Onde e usada: camada model em toda aplicacao.
 * Dependencias chamadas: sqlite3.Database.get.
 * Efeitos colaterais: nenhum; leitura de dados.
 */
function getQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, function(err, row) {
            if (err) {
                log.error('Erro ao executar query de leitura unitária', { err: err.message });
                return reject(err);
            }
            resolve(row);
        });
    });
}

/**
 * O que faz: executa SQL de leitura multipla e retorna lista de linhas.
 * Onde e usada: camada model em toda aplicacao.
 * Dependencias chamadas: sqlite3.Database.all.
 * Efeitos colaterais: nenhum; leitura de dados.
 */
function allQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, function(err, rows) {
            if (err) {
                log.error('Erro ao executar query de leitura multipla', { err: err.message });
                return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * O que faz: fecha conexao principal do banco de forma segura.
 * Onde e usada: encerramento controlado de processos/scripts.
 * Dependencias chamadas: sqlite3.Database.close.
 * Efeitos colaterais: encerra conexao ativa com SQLite.
 */
function closeDatabase() {
    db.close((err) => {
        if (err) {
            log.error('Erro ao fechar banco de dados', { err: err.message });
        } else {
            log.success('Banco de dados fechado com sucesso');
        }
    });
}

/**
 * O que faz: executa lista de queries dentro de transacao unica.
 * Onde e usada: fluxos de persistencia que exigem atomicidade.
 * Dependencias chamadas: sqlite3.Database.serialize/run.
 * Efeitos colaterais: aplica commit/rollback no banco.
 */
async function runInTransaction(queriesWithParams = []) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            let errors = [];
            queriesWithParams.forEach(([query, params]) => {
                db.run(query, params, function(err) {
                    if (err) errors.push(err);
                });
            });
            if (errors.length > 0) {
                db.run('ROLLBACK');
                log.error('Erro em transacao; rollback aplicado', { err: errors[0].message });
                return reject(errors[0]);
            }
            db.run('COMMIT', (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    log.error('Erro ao confirmar transacao; rollback aplicado', { err: err.message });
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

module.exports = {
    db,
    executeQuery,
    getQuery,
    allQuery,
    closeDatabase,
    runInTransaction
};