const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Script de migração para adicionar campos faltantes na tabela books:
 * - isbn (TEXT)
 * - year (INTEGER)
 * - publisher (TEXT)
 * - barcode (TEXT)
 */

const dbPath = path.join(__dirname, '..', 'src', 'database', 'biblioteca.db');
const db = new sqlite3.Database(dbPath);

console.log('🔵 [migrate_add_book_fields] Iniciando migração...');

// Função para verificar se uma coluna existe
function checkColumnExists(columnName) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(books)`, [], (err, columns) => {
            if (err) {
                reject(err);
            } else {
                const exists = columns.some(col => col.name === columnName);
                resolve(exists);
            }
        });
    });
}

// Função para adicionar coluna se não existir
async function addColumnIfNotExists(columnName, columnType) {
    try {
        const exists = await checkColumnExists(columnName);
        
        if (exists) {
            console.log(`🟡 [migrate_add_book_fields] Coluna '${columnName}' já existe`);
            return;
        }

        return new Promise((resolve, reject) => {
            db.run(`ALTER TABLE books ADD COLUMN ${columnName} ${columnType}`, (err) => {
                if (err) {
                    console.error(`🔴 [migrate_add_book_fields] Erro ao adicionar coluna '${columnName}':`, err.message);
                    reject(err);
                } else {
                    console.log(`🟢 [migrate_add_book_fields] Coluna '${columnName}' adicionada com sucesso`);
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error(`🔴 [migrate_add_book_fields] Erro ao verificar coluna '${columnName}':`, error.message);
        throw error;
    }
}

// Executar migrações
async function migrate() {
    try {
        await addColumnIfNotExists('isbn', 'TEXT');
        await addColumnIfNotExists('year', 'INTEGER');
        await addColumnIfNotExists('publisher', 'TEXT');
        await addColumnIfNotExists('barcode', 'TEXT');
        
        console.log('🟢 [migrate_add_book_fields] Migração concluída com sucesso!');
        db.close();
        process.exit(0);
    } catch (error) {
        console.error('🔴 [migrate_add_book_fields] Erro na migração:', error.message);
        db.close();
        process.exit(1);
    }
}

migrate();
