#!/usr/bin/env node
/**
 * Script de migração para adicionar colunas de detalhes da disciplina
 * 
 * Adiciona as colunas:
 * - ementa: Ementa da disciplina
 * - objetivos: Objetivos da disciplina
 * - conteudo_programatico: Conteúdo programático da disciplina
 * 
 * Uso:
 *   node scripts/migrate_add_discipline_details.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const projectRoot = path.resolve(__dirname, '..', '..');
const defaultDbPath = path.join(projectRoot, 'database', 'library.db');
const dbUrl = process.env.DATABASE_URL || `sqlite://${defaultDbPath}`;
const dbPath = dbUrl.replace('sqlite://', '');

const sqlite3 = require('sqlite3').verbose();

console.log(`🔵 [Migração] Conectando ao banco de dados: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('🔴 [Migração] Erro ao conectar:', err.message);
        process.exit(1);
    }
    console.log('🟢 [Migração] Conectado ao banco de dados');
});

const columnsToAdd = [
    { name: 'ementa', type: 'TEXT', default: null },
    { name: 'objetivos', type: 'TEXT', default: null },
    { name: 'conteudo_programatico', type: 'TEXT', default: null }
];

async function checkColumnExists(columnName) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(disciplines)`, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const exists = rows.some(row => row.name === columnName);
            resolve(exists);
        });
    });
}

async function addColumn(columnName, columnType) {
    return new Promise((resolve, reject) => {
        const sql = `ALTER TABLE disciplines ADD COLUMN ${columnName} ${columnType}`;
        db.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function migrate() {
    console.log('🔵 [Migração] Iniciando migração da tabela disciplines...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const column of columnsToAdd) {
        try {
            const exists = await checkColumnExists(column.name);
            
            if (exists) {
                console.log(`🟡 [Migração] Coluna '${column.name}' já existe, pulando...`);
                skippedCount++;
            } else {
                await addColumn(column.name, column.type);
                console.log(`🟢 [Migração] Coluna '${column.name}' adicionada com sucesso`);
                addedCount++;
            }
        } catch (error) {
            console.error(`🔴 [Migração] Erro ao processar coluna '${column.name}':`, error.message);
        }
    }
    
    console.log(`\n🟢 [Migração] Concluída!`);
    console.log(`   - Colunas adicionadas: ${addedCount}`);
    console.log(`   - Colunas já existentes: ${skippedCount}`);
    
    db.close((err) => {
        if (err) {
            console.error('🔴 [Migração] Erro ao fechar banco:', err.message);
        }
        console.log('🟢 [Migração] Conexão encerrada');
    });
}

migrate().catch(error => {
    console.error('🔴 [Migração] Erro fatal:', error.message);
    process.exit(1);
});
