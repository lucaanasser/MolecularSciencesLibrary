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

module.exports = {
    db,
    executeQuery,
    getQuery,
    allQuery
};