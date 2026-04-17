/**
 * Responsabilidade: criar tabelas e indices de perfis publicos academicos.
 * Camada: database/academic.
 * Entradas/Saidas: recebe run e cria schema/indexes de perfis.
 * Dependencias criticas: run.
 */

const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: cria tabelas de perfis publicos, historicos academicos e follows.
 * Onde e usada: initAcademicDb.
 * Dependencias chamadas: run do contexto.
 * Efeitos colaterais: cria/atualiza schema e indice de area_tags.
 */
async function initProfilesSchema({ run }) {
    await run(
        `CREATE TABLE IF NOT EXISTS public_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            turma TEXT,
            curso_origem TEXT,
            area_interesse TEXT,
            bio TEXT,
            citacao TEXT,
            citacao_autor TEXT,
            email_publico TEXT,
            linkedin TEXT,
            lattes TEXT,
            github TEXT,
            site TEXT,
            banner_choice TEXT DEFAULT 'purple' CHECK(banner_choice IN ('purple', 'blue', 'green', 'red', 'orange', 'yellow')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS area_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL CHECK(entity_type IN ('profile', 'advanced_cycle', 'post_cm')),
            entity_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category IN ('grande-area', 'area', 'subarea')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    );
    await run('CREATE INDEX IF NOT EXISTS idx_area_tags_entity ON area_tags(entity_type, entity_id)');

    await run(
        `CREATE TABLE IF NOT EXISTS advanced_cycles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tema TEXT NOT NULL,
            orientador TEXT NOT NULL,
            coorientadores TEXT,
            instituto TEXT,
            universidade TEXT,
            semestres INTEGER DEFAULT 4,
            ano_inicio INTEGER,
            ano_conclusao INTEGER,
            descricao TEXT,
            color TEXT DEFAULT '#14b8a6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS profile_disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            codigo TEXT NOT NULL,
            nome TEXT NOT NULL,
            professor TEXT,
            ano INTEGER NOT NULL,
            semestre INTEGER NOT NULL CHECK(semestre IN (1, 2)),
            nota TEXT,
            avancado_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(avancado_id) REFERENCES advanced_cycles(id) ON DELETE SET NULL
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS international_experiences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('intercambio', 'estagio', 'pesquisa', 'curso', 'outro')),
            pais TEXT NOT NULL,
            instituicao TEXT NOT NULL,
            programa TEXT,
            orientador TEXT,
            descricao TEXT,
            ano_inicio INTEGER NOT NULL,
            ano_fim INTEGER,
            duracao_numero INTEGER,
            duracao_unidade TEXT CHECK(duracao_unidade IN ('dias', 'semanas', 'meses', 'anos')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS post_cm_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('trabalho', 'pos-graduacao', 'nova-graduacao', 'retorno-curso-origem', 'outro')),
            instituicao TEXT NOT NULL,
            cargo TEXT,
            orientador TEXT,
            descricao TEXT,
            ano_inicio INTEGER,
            ano_fim INTEGER,
            github TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS profile_follows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(follower_id, following_id),
            FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

    log.success('Tabelas e indices de perfis publicos criados com sucesso');
}

module.exports = {
    initProfilesSchema
};
