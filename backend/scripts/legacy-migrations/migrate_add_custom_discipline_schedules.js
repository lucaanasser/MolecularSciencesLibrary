#!/usr/bin/env node
/**
 * Script de migração para criar tabela de horários de disciplinas customizadas
 * 
 * Cria a tabela:
 * - user_custom_discipline_schedules: Horários normalizados por dia da semana
 * 
 * Remove as colunas antigas da tabela user_custom_disciplines:
 * - dia, horario_inicio, horario_fim (agora na tabela separada)
 * 
 * NOTA: Dados existentes serão ignorados (Opção B). Esta migration é apenas para novas disciplinas.
 * 
 * Executar: node backend/scripts/migrate_add_custom_discipline_schedules.js
 */

const sqlite3 = require('sqlite3');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Project root is BibliotecaCM, which is 2 levels up from scripts folder
const projectRoot = path.resolve(__dirname, '..', '..');
const defaultDbPath = path.join(projectRoot, 'database', 'library.db');
const dbUrl = process.env.DATABASE_URL || `sqlite://${defaultDbPath}`;
const dbPath = dbUrl.replace('sqlite://', '');

console.log('🔵 [migrate_add_custom_discipline_schedules] Iniciando migração...');
console.log(`🔵 [migrate_add_custom_discipline_schedules] Banco de dados: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('🔴 [migrate_add_custom_discipline_schedules] Erro ao conectar:', err.message);
        process.exit(1);
    }
    console.log('🟢 [migrate_add_custom_discipline_schedules] Conectado ao banco de dados');
});

/**
 * Verifica se uma tabela existe
 */
async function checkTableExists(tableName) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

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
 * Executa uma query SQL
 */
async function runQuery(sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
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
        // Cria tabela user_custom_discipline_schedules
        // =====================================================
        const tableExists = await checkTableExists('user_custom_discipline_schedules');
        if (tableExists) {
            console.log('🟡 [migrate_add_custom_discipline_schedules] Tabela user_custom_discipline_schedules já existe');
        } else {
            await runQuery(`
                CREATE TABLE user_custom_discipline_schedules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    custom_discipline_id INTEGER NOT NULL,
                    dia TEXT NOT NULL,
                    horario_inicio TEXT NOT NULL,
                    horario_fim TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(custom_discipline_id) REFERENCES user_custom_disciplines(id) ON DELETE CASCADE
                )
            `);
            console.log('🟢 [migrate_add_custom_discipline_schedules] Tabela user_custom_discipline_schedules criada com sucesso');
            
            // Criar índice para performance
            await runQuery(`CREATE INDEX IF NOT EXISTS idx_custom_discipline_schedules_discipline ON user_custom_discipline_schedules(custom_discipline_id)`);
            console.log('🟢 [migrate_add_custom_discipline_schedules] Índice criado com sucesso');
        }

        // =====================================================
        // Remove colunas antigas da user_custom_disciplines
        // NOTA: SQLite não suporta DROP COLUMN diretamente
        // Precisamos recriar a tabela sem as colunas
        // =====================================================
        const hasDiaColumn = await checkColumnExists('user_custom_disciplines', 'dia');
        
        if (hasDiaColumn) {
            console.log('🔵 [migrate_add_custom_discipline_schedules] Removendo colunas antigas (dia, horario_inicio, horario_fim)...');
            
            // 1. Criar tabela temporária com nova estrutura
            await runQuery(`
                CREATE TABLE user_custom_disciplines_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    schedule_id INTEGER NOT NULL,
                    nome TEXT NOT NULL,
                    codigo TEXT,
                    creditos_aula INTEGER,
                    creditos_trabalho INTEGER,
                    color TEXT DEFAULT '#14b8a6',
                    is_visible INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(schedule_id) REFERENCES user_schedules(id) ON DELETE CASCADE
                )
            `);
            console.log('🟢 [migrate_add_custom_discipline_schedules] Tabela temporária criada');

            // 2. Copiar dados (ignorando registros antigos com estrutura antiga)
            // Como vamos ignorar dados existentes (Opção B), não copiamos nada
            console.log('🟡 [migrate_add_custom_discipline_schedules] Dados antigos serão ignorados (Opção B)');

            // 3. Remover tabela antiga
            await runQuery(`DROP TABLE user_custom_disciplines`);
            console.log('🟢 [migrate_add_custom_discipline_schedules] Tabela antiga removida');

            // 4. Renomear tabela nova
            await runQuery(`ALTER TABLE user_custom_disciplines_new RENAME TO user_custom_disciplines`);
            console.log('🟢 [migrate_add_custom_discipline_schedules] Tabela renomeada com sucesso');
        } else {
            console.log('🟡 [migrate_add_custom_discipline_schedules] Colunas antigas já foram removidas');
        }

        console.log('🟢 [migrate_add_custom_discipline_schedules] Migração concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('🔴 [migrate_add_custom_discipline_schedules] Erro na migração:', error.message);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Executa a migração
runMigration();
