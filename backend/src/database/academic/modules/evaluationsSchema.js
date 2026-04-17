/**
 * Responsabilidade: criar tabelas e indices de avaliacoes academicas.
 * Camada: database/academic.
 * Entradas/Saidas: recebe run e cria schema/indexes de evaluations.
 * Dependencias criticas: run.
 */

const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: cria tabelas de avaliacoes (disciplinas/livros) e indices de performance.
 * Onde e usada: initAcademicDb.
 * Dependencias chamadas: run do contexto.
 * Efeitos colaterais: cria/atualiza schema e indices de avaliacoes.
 */
async function initEvaluationsSchema({ run }) {
    await run(
        `CREATE TABLE IF NOT EXISTS discipline_evaluations (
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
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS evaluation_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evaluation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(evaluation_id) REFERENCES discipline_evaluations(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(evaluation_id, user_id)
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS book_evaluations (
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
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS book_evaluation_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evaluation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(evaluation_id) REFERENCES book_evaluations(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(evaluation_id, user_id)
        )`
    );

    await run('CREATE INDEX IF NOT EXISTS idx_evaluations_discipline ON discipline_evaluations(discipline_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_evaluations_user ON discipline_evaluations(user_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_evaluations_helpful ON discipline_evaluations(helpful_count DESC)');
    await run('CREATE INDEX IF NOT EXISTS idx_votes_evaluation ON evaluation_votes(evaluation_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_votes_user ON evaluation_votes(user_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_book_evaluations_book ON book_evaluations(book_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_book_evaluations_user ON book_evaluations(user_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_book_evaluations_helpful ON book_evaluations(helpful_count DESC)');
    await run('CREATE INDEX IF NOT EXISTS idx_book_eval_votes_evaluation ON book_evaluation_votes(evaluation_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_book_eval_votes_user ON book_evaluation_votes(user_id)');

    log.success('Tabelas e indices de avaliacoes criados com sucesso');
}

module.exports = {
    initEvaluationsSchema
};
