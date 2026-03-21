#!/usr/bin/env node
/**
 * Script de migração para adicionar colunas de créditos às disciplinas customizadas
 * 
 * Adiciona as colunas:
 * - creditos_aula: Créditos de aula (INTEGER, NULL permitido)
 * - creditos_trabalho: Créditos de trabalho (INTEGER, NULL permitido)
 * 
 * Executar: node backend/scripts/migrate_add_custom_discipline_credits.js
 */

const sqlite3 = require('sqlite3');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Project root is BibliotecaCM, which is 2 levels up from scripts folder
const projectRoot = path.resolve(__dirname, '..', '..');
const defaultDbPath = path.join(projectRoot, 'database', 'library.db');
const dbUrl = process.env.DATABASE_URL || `sqlite://${defaultDbPath}`;
const dbPath = dbUrl.replace('sqlite://', '');

console.log('🔵 [migrate_add_custom_discipline_credits] Iniciando migração...');
console.log(`🔵 [migrate_add_custom_discipline_credits] Banco de dados: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('🔴 [migrate_add_custom_discipline_credits] Erro ao conectar:', err.message);
        process.exit(1);
    }
    console.log('🟢 [migrate_add_custom_discipline_credits] Conectado ao banco de dados');
});

/**
 * Verifica se uma coluna existe na tabela
 */
async function checkColumnExists(tableName, columnName) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const exists = rows.some(row => row.name === columnName);
                resolve(exists);
            }
        });
    });
}

/**
 * Adiciona uma coluna à tabela
 */
async function addColumn(tableName, columnName, columnType) {
    return new Promise((resolve, reject) => {
        const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
        db.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Executa a migração
 */
async function runMigration() {
    try {
        // =====================================================
        // Adiciona coluna creditos_aula
        // =====================================================
        const hasAulaColumn = await checkColumnExists('user_custom_disciplines', 'creditos_aula');
        if (hasAulaColumn) {
            console.log('🟡 [migrate_add_custom_discipline_credits] Coluna creditos_aula já existe');
        } else {
            await addColumn('user_custom_disciplines', 'creditos_aula', 'INTEGER');
            console.log('🟢 [migrate_add_custom_discipline_credits] Coluna creditos_aula adicionada com sucesso');
        }

        // =====================================================
        // Adiciona coluna creditos_trabalho
        // =====================================================
        const hasTrabalhoColumn = await checkColumnExists('user_custom_disciplines', 'creditos_trabalho');
        if (hasTrabalhoColumn) {
            console.log('🟡 [migrate_add_custom_discipline_credits] Coluna creditos_trabalho já existe');
        } else {
            await addColumn('user_custom_disciplines', 'creditos_trabalho', 'INTEGER');
            console.log('🟢 [migrate_add_custom_discipline_credits] Coluna creditos_trabalho adicionada com sucesso');
        }

        console.log('🟢 [migrate_add_custom_discipline_credits] Migração concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('🔴 [migrate_add_custom_discipline_credits] Erro na migração:', error.message);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Executa a migração
runMigration();
