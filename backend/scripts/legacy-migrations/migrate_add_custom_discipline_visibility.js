/**
 * Migração: Adiciona campo is_visible para soft delete de disciplinas customizadas
 * Data: 2026-02-02
 * 
 * Adiciona coluna is_visible (padrão 1) à tabela user_custom_disciplines
 */

const path = require('path');
const crypto = require('crypto');
const { executeQuery, getQuery } = require('../src/database/db');

const MIGRATION_NAME = 'migrate_add_custom_discipline_visibility';

// Calcula hash do conteúdo da migração para detectar mudanças
function calculateMigrationHash() {
    const content = `
        ALTER TABLE user_custom_disciplines ADD COLUMN is_visible INTEGER DEFAULT 1
    `;
    return crypto.createHash('md5').update(content.trim()).digest('hex');
}

async function runMigration() {
    console.log(`\n🔵 [${MIGRATION_NAME}] Iniciando migração...`);
    
    try {
        // Verifica se a coluna já existe
        const tableInfo = await executeQuery('PRAGMA table_info(user_custom_disciplines)');
        const columns = Array.isArray(tableInfo) ? tableInfo : [tableInfo];
        const hasIsVisible = columns.some(col => col && col.name === 'is_visible');

        if (!hasIsVisible) {
            console.log(`🔵 [${MIGRATION_NAME}] Adicionando coluna is_visible...`);
            await executeQuery('ALTER TABLE user_custom_disciplines ADD COLUMN is_visible INTEGER DEFAULT 1');
            console.log(`🟢 [${MIGRATION_NAME}] Coluna is_visible adicionada`);
        } else {
            console.log(`🟡 [${MIGRATION_NAME}] Coluna is_visible já existe`);
        }

        console.log(`🟢 [${MIGRATION_NAME}] Migração concluída com sucesso!\n`);
    } catch (error) {
        console.error(`🔴 [${MIGRATION_NAME}] Erro na migração:`, error);
        throw error;
    }
}

// Executa a migração
runMigration()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro fatal:', err);
        process.exit(1);
    });
