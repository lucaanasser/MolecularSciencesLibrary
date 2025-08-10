const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || 'sqlite://./database/library.db';
const dbPath = dbUrl.replace('sqlite://', '');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    fs.chmodSync(dbDir, 0o777);
}

console.log(`🔵 [db] Usando banco de dados em: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('🔴 [db] Erro ao abrir banco de dados:', err.message);
        process.exit(1);
    }
    console.log('🟢 [db] Conectado ao banco de dados SQLite.');
    
    // Configurar timeout para evitar SQLITE_BUSY
    db.configure("busyTimeout", 30000);
    
    // Configurar WAL mode para melhor concorrência
    db.run("PRAGMA journal_mode=WAL", (err) => {
        if (err) {
            console.warn('🟡 [db] Não foi possível configurar WAL mode:', err.message);
        } else {
            console.log('🟢 [db] WAL mode configurado para melhor concorrência.');
        }
    });
    
    // Configurar busy timeout via PRAGMA também
    db.run("PRAGMA busy_timeout=30000", (err) => {
        if (err) {
            console.warn('🟡 [db] Não foi possível configurar busy_timeout:', err.message);
        } else {
            console.log('🟢 [db] Busy timeout configurado para 30 segundos.');
        }
    });
});

// Função utilitária para executar queries com Promise
function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                console.error('🔴 [db] Erro ao executar query:', err.message, query, params);
                return reject(err);
            }
            console.log('🟢 [db] Query executada com sucesso:', query);
            resolve(this.lastID);
        });
    });
}

function getQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, function(err, row) {
            if (err) {
                console.error('🔴 [db] Erro ao executar getQuery:', err.message, query, params);
                return reject(err);
            }
            console.log('🟢 [db] getQuery executada com sucesso:', query);
            resolve(row);
        });
    });
}

function allQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, function(err, rows) {
            if (err) {
                console.error('🔴 [db] Erro ao executar allQuery:', err.message, query, params);
                return reject(err);
            }
            console.log('🟢 [db] allQuery executada com sucesso:', query);
            resolve(rows);
        });
    });
}

// Função para fechar o banco de dados com segurança
function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error('🔴 [db] Erro ao fechar banco de dados:', err.message);
        } else {
            console.log('🟢 [db] Banco de dados fechado com sucesso.');
        }
    });
}

// Função utilitária para executar múltiplas queries em transação
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
                return reject(errors[0]);
            }
            db.run('COMMIT', (err) => {
                if (err) {
                    db.run('ROLLBACK');
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