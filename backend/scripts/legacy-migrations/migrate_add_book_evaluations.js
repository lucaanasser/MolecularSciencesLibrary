/**
 * Script de migração para adicionar tabelas de avaliações de livros
 * 
 * Cria as tabelas:
 * - book_evaluations: Avaliações de livros pelos usuários
 * - book_evaluation_votes: Votos de "útil" em avaliações de livros
 * 
 * Ratings: 0.5 a 5.0 em incrementos de 0.5 (estilo Letterboxd)
 * Critérios: Geral, Qualidade do Conteúdo, Legibilidade, Utilidade, Precisão
 * 
 * Executar: node backend/scripts/migrate_add_book_evaluations.js
 */

const sqlite3 = require('sqlite3');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Project root is BibliotecaCM, which is 2 levels up from scripts folder
const projectRoot = path.resolve(__dirname, '..', '..');
const defaultDbPath = path.join(projectRoot, 'database', 'library.db');
const dbUrl = process.env.DATABASE_URL || `sqlite://${defaultDbPath}`;
const dbPath = dbUrl.replace('sqlite://', '');

console.log('🔵 [migrate_add_book_evaluations] Iniciando migração...');
console.log(`🔵 [migrate_add_book_evaluations] Banco de dados: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('🔴 [migrate_add_book_evaluations] Erro ao conectar:', err.message);
        process.exit(1);
    }
    console.log('🟢 [migrate_add_book_evaluations] Conectado ao banco de dados');
});

db.serialize(() => {
    // =====================================================
    // BOOK EVALUATIONS TABLE - Avaliações de livros
    // =====================================================
    db.run(`
        CREATE TABLE IF NOT EXISTS book_evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating_geral REAL CHECK (rating_geral IS NULL OR (rating_geral >= 0.5 AND rating_geral <= 5.0)),
            rating_qualidade REAL CHECK (rating_qualidade IS NULL OR (rating_qualidade >= 0.5 AND rating_qualidade <= 5.0)),
            rating_legibilidade REAL CHECK (rating_legibilidade IS NULL OR (rating_legibilidade >= 0.5 AND rating_legibilidade <= 5.0)),
            rating_utilidade REAL CHECK (rating_utilidade IS NULL OR (rating_utilidade >= 0.5 AND rating_utilidade <= 5.0)),
            rating_precisao REAL CHECK (rating_precisao IS NULL OR (rating_precisao >= 0.5 AND rating_precisao <= 5.0)),
            comentario TEXT,
            is_anonymous INTEGER DEFAULT 0,
            helpful_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(book_id, user_id)
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [migrate_add_book_evaluations] Erro ao criar tabela book_evaluations:', err.message);
        } else {
            console.log('🟢 [migrate_add_book_evaluations] Tabela book_evaluations criada/verificada');
        }
    });

    // =====================================================
    // BOOK EVALUATION VOTES TABLE - Votos de "útil"
    // =====================================================
    db.run(`
        CREATE TABLE IF NOT EXISTS book_evaluation_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evaluation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(evaluation_id) REFERENCES book_evaluations(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(evaluation_id, user_id)
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [migrate_add_book_evaluations] Erro ao criar tabela book_evaluation_votes:', err.message);
        } else {
            console.log('🟢 [migrate_add_book_evaluations] Tabela book_evaluation_votes criada/verificada');
        }
    });

    // =====================================================
    // INDEXES - Índices para performance
    // =====================================================
    db.run(`CREATE INDEX IF NOT EXISTS idx_book_evaluations_book ON book_evaluations(book_id)`, (err) => {
        if (err) console.warn('🟡 [migrate_add_book_evaluations] Aviso ao criar índice idx_book_evaluations_book:', err.message);
        else console.log('🟢 [migrate_add_book_evaluations] Índice idx_book_evaluations_book criado');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_book_evaluations_user ON book_evaluations(user_id)`, (err) => {
        if (err) console.warn('🟡 [migrate_add_book_evaluations] Aviso ao criar índice idx_book_evaluations_user:', err.message);
        else console.log('🟢 [migrate_add_book_evaluations] Índice idx_book_evaluations_user criado');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_book_evaluations_helpful ON book_evaluations(helpful_count DESC)`, (err) => {
        if (err) console.warn('🟡 [migrate_add_book_evaluations] Aviso ao criar índice idx_book_evaluations_helpful:', err.message);
        else console.log('🟢 [migrate_add_book_evaluations] Índice idx_book_evaluations_helpful criado');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_book_eval_votes_evaluation ON book_evaluation_votes(evaluation_id)`, (err) => {
        if (err) console.warn('🟡 [migrate_add_book_evaluations] Aviso ao criar índice idx_book_eval_votes_evaluation:', err.message);
        else console.log('🟢 [migrate_add_book_evaluations] Índice idx_book_eval_votes_evaluation criado');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_book_eval_votes_user ON book_evaluation_votes(user_id)`, (err) => {
        if (err) console.warn('🟡 [migrate_add_book_evaluations] Aviso ao criar índice idx_book_eval_votes_user:', err.message);
        else console.log('🟢 [migrate_add_book_evaluations] Índice idx_book_eval_votes_user criado');
    });
});

db.close((err) => {
    if (err) {
        console.error('🔴 [migrate_add_book_evaluations] Erro ao fechar banco:', err.message);
    } else {
        console.log('🟢 [migrate_add_book_evaluations] Migração concluída com sucesso!');
    }
});
