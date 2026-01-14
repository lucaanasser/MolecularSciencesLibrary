#!/usr/bin/env node
/**
 * Migration Script - Adiciona tabelas de avaliações de disciplinas
 * 
 * Este script cria:
 * - discipline_evaluations: Avaliações com ratings (0.5-5) e comentários opcionais
 * - evaluation_votes: Registra likes para evitar duplicação
 * 
 * Uso: node backend/scripts/migrate_add_evaluations.js
 */

require('dotenv').config();
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || path.join(__dirname, '../../database/library.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco de dados');
});

function runQuery(sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function migrate() {
    console.log('🔵 Iniciando migration para avaliações de disciplinas...\n');

    try {
        // DISCIPLINE_EVALUATIONS TABLE
        // Ratings: 0.5 a 5.0 em incrementos de 0.5 (estilo Letterboxd)
        // Avaliações de estrelas são sempre anônimas
        // Comentários mostram nome por padrão, mas usuário pode escolher anonimato
        await runQuery(`
            CREATE TABLE IF NOT EXISTS discipline_evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discipline_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                turma_codigo TEXT,
                semestre TEXT,
                rating_geral REAL CHECK (rating_geral IS NULL OR (rating_geral >= 0.5 AND rating_geral <= 5.0)),
                rating_dificuldade REAL CHECK (rating_dificuldade IS NULL OR (rating_dificuldade >= 0.5 AND rating_dificuldade <= 5.0)),
                rating_carga_trabalho REAL CHECK (rating_carga_trabalho IS NULL OR (rating_carga_trabalho >= 0.5 AND rating_carga_trabalho <= 5.0)),
                rating_professores REAL CHECK (rating_professores IS NULL OR (rating_professores >= 0.5 AND rating_professores <= 5.0)),
                rating_clareza REAL CHECK (rating_clareza IS NULL OR (rating_clareza >= 0.5 AND rating_clareza <= 5.0)),
                rating_utilidade REAL CHECK (rating_utilidade IS NULL OR (rating_utilidade >= 0.5 AND rating_utilidade <= 5.0)),
                rating_organizacao REAL CHECK (rating_organizacao IS NULL OR (rating_organizacao >= 0.5 AND rating_organizacao <= 5.0)),
                comentario TEXT,
                is_anonymous INTEGER DEFAULT 0,
                helpful_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(discipline_id, user_id)
            )
        `);
        console.log('✅ Tabela discipline_evaluations criada com sucesso');

        // EVALUATION_VOTES TABLE
        // Apenas likes (sem dislike)
        await runQuery(`
            CREATE TABLE IF NOT EXISTS evaluation_votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evaluation_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(evaluation_id) REFERENCES discipline_evaluations(id) ON DELETE CASCADE,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(evaluation_id, user_id)
            )
        `);
        console.log('✅ Tabela evaluation_votes criada com sucesso');

        // Índices para performance
        await runQuery(`CREATE INDEX IF NOT EXISTS idx_evaluations_discipline ON discipline_evaluations(discipline_id)`);
        await runQuery(`CREATE INDEX IF NOT EXISTS idx_evaluations_user ON discipline_evaluations(user_id)`);
        await runQuery(`CREATE INDEX IF NOT EXISTS idx_evaluations_helpful ON discipline_evaluations(helpful_count DESC)`);
        await runQuery(`CREATE INDEX IF NOT EXISTS idx_votes_evaluation ON evaluation_votes(evaluation_id)`);
        await runQuery(`CREATE INDEX IF NOT EXISTS idx_votes_user ON evaluation_votes(user_id)`);
        console.log('✅ Índices criados com sucesso');

        console.log('\n🟢 Migration concluída com sucesso!');
        console.log('\nTabelas criadas:');
        console.log('  - discipline_evaluations (avaliações com ratings 0.5-5.0)');
        console.log('  - evaluation_votes (likes em avaliações)');

    } catch (error) {
        console.error('❌ Erro na migration:', error.message);
        process.exit(1);
    } finally {
        db.close();
    }
}

migrate();
