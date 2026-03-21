/**
 * Responsabilidade: criar tabelas academicas de disciplinas e grades.
 * Camada: database/academic.
 * Entradas/Saidas: recebe run e cria schema de schedule/disciplines.
 * Dependencias criticas: run.
 */

const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: cria tabelas de disciplinas, turmas e grades de usuarios.
 * Onde e usada: initAcademicDb.
 * Dependencias chamadas: run do contexto.
 * Efeitos colaterais: cria/atualiza schema academico de grade horaria.
 */
async function initSchedulesSchema({ run }) {
    await run(
        `CREATE TABLE IF NOT EXISTS disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            unidade TEXT,
            campus TEXT,
            creditos_aula INTEGER DEFAULT 0,
            creditos_trabalho INTEGER DEFAULT 0,
            has_valid_classes INTEGER DEFAULT 0,
            is_postgrad INTEGER DEFAULT 0,
            ementa TEXT,
            objetivos TEXT,
            conteudo_programatico TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS discipline_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discipline_id INTEGER NOT NULL,
            codigo_turma TEXT NOT NULL,
            codigo_turma_teorica TEXT,
            tipo TEXT,
            inicio DATE,
            fim DATE,
            observacoes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS class_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            dia TEXT NOT NULL,
            horario_inicio TEXT NOT NULL,
            horario_fim TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(class_id) REFERENCES discipline_classes(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS class_professors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            schedule_id INTEGER,
            nome TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(class_id) REFERENCES discipline_classes(id) ON DELETE CASCADE,
            FOREIGN KEY(schedule_id) REFERENCES class_schedules(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS user_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL DEFAULT 'Plano 1',
            is_active INTEGER DEFAULT 1,
            is_deleted INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS user_schedule_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            color TEXT DEFAULT '#14b8a6',
            is_visible INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(schedule_id) REFERENCES user_schedules(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES discipline_classes(id) ON DELETE CASCADE
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS user_schedule_disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL,
            discipline_id INTEGER NOT NULL,
            selected_class_id INTEGER,
            is_visible INTEGER DEFAULT 1,
            is_expanded INTEGER DEFAULT 0,
            color TEXT DEFAULT '#14b8a6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(schedule_id) REFERENCES user_schedules(id) ON DELETE CASCADE,
            FOREIGN KEY(discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE,
            FOREIGN KEY(selected_class_id) REFERENCES discipline_classes(id) ON DELETE SET NULL,
            UNIQUE(schedule_id, discipline_id)
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS user_custom_disciplines (
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
        )`
    );

    await run(
        `CREATE TABLE IF NOT EXISTS user_custom_discipline_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            custom_discipline_id INTEGER NOT NULL,
            dia TEXT NOT NULL,
            horario_inicio TEXT NOT NULL,
            horario_fim TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(custom_discipline_id) REFERENCES user_custom_disciplines(id) ON DELETE CASCADE
        )`
    );

    log.success('Tabelas de disciplinas e grades criadas com sucesso');
}

module.exports = {
    initSchedulesSchema
};
