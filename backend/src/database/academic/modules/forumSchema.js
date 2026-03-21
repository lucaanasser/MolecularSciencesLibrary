/**
 * Responsabilidade: criar tabelas e indices do forum academico.
 * Camada: database/academic.
 * Entradas/Saidas: recebe run e cria schema/indexes de forum.
 * Dependencias criticas: run.
 */

const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: cria tabelas do forum e indices de performance para consultas.
 * Onde e usada: initAcademicDb.
 * Dependencias chamadas: run do contexto.
 * Efeitos colaterais: cria/atualiza schema e indices do forum.
 */
async function initForumSchema({ run }) {
    await run(
        `CREATE TABLE IF NOT EXISTS forum_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            autor_id INTEGER NOT NULL,
            votos INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            is_closed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_anonymous INTEGER DEFAULT 0,
            FOREIGN KEY(autor_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS forum_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            conteudo TEXT NOT NULL,
            autor_id INTEGER NOT NULL,
            votos INTEGER DEFAULT 0,
            is_accepted INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_anonymous INTEGER DEFAULT 0,
            FOREIGN KEY(question_id) REFERENCES forum_questions(id) ON DELETE CASCADE,
            FOREIGN KEY(autor_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS forum_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE NOT NULL,
            topico TEXT NOT NULL DEFAULT 'geral',
            descricao TEXT,
            created_by_user INTEGER,
            approved INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(created_by_user) REFERENCES users(id) ON DELETE SET NULL
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS forum_question_tags (
            question_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (question_id, tag_id),
            FOREIGN KEY(question_id) REFERENCES forum_questions(id) ON DELETE CASCADE,
            FOREIGN KEY(tag_id) REFERENCES forum_tags(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS forum_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            votable_type TEXT NOT NULL CHECK(votable_type IN ('question', 'answer')),
            votable_id INTEGER NOT NULL,
            vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 1)),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, votable_type, votable_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

    await run('CREATE INDEX IF NOT EXISTS idx_forum_questions_autor ON forum_questions(autor_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_questions_created ON forum_questions(created_at DESC)');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_questions_votos ON forum_questions(votos DESC)');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_answers_question ON forum_answers(question_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_votes_votable ON forum_votes(votable_type, votable_id)');

    log.success('Tabelas e indices do forum criados com sucesso');
}

module.exports = {
    initForumSchema
};
