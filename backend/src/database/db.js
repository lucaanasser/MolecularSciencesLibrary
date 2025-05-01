const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || 'sqlite:///app/database/library.db';
const dbPath = dbUrl.replace('sqlite://', '');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    fs.chmodSync(dbDir, 0o777);
}

console.log(`Using database at path: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

// Função utilitária para executar queries com Promise
function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID);
        });
    });
}

function getQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, function(err, row) {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

function allQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, function(err, rows) {
            if (err) {
                return reject(err);
            }
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