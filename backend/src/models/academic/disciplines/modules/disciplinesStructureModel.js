/**
 * Responsabilidade: persistencia de turmas, horarios e professores vinculados a disciplinas.
 * Camada: model.
 * Entradas/Saidas: ids e payloads de estrutura academica; retorna linhas e ids inseridos.
 * Dependencias criticas: db helpers e logger padronizado.
 */

const { executeQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: lista turmas de uma disciplina.
 * Onde e usada: montagem de disciplina completa e grade.
 * Dependencias chamadas: allQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getClassesByDisciplineId(disciplineId) {
    log.start('Buscando turmas da disciplina', { discipline_id: disciplineId });
    const rows = await allQuery(
        'SELECT * FROM discipline_classes WHERE discipline_id = ? ORDER BY codigo_turma',
        [disciplineId]
    );
    log.success('Turmas carregadas', { discipline_id: disciplineId, count: rows.length });
    return rows;
}

/**
 * O que faz: insere uma turma para uma disciplina.
 * Onde e usada: importacao e atualizacao de dados de disciplinas.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function insertClass(data) {
    log.start('Inserindo turma', { discipline_id: data.discipline_id, codigo_turma: data.codigo_turma });

    const result = await executeQuery(
        `INSERT INTO discipline_classes (
            discipline_id, codigo_turma, codigo_turma_teorica, tipo, inicio, fim, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            data.discipline_id,
            data.codigo_turma,
            data.codigo_turma_teorica || null,
            data.tipo || null,
            data.inicio || null,
            data.fim || null,
            data.observacoes || null
        ]
    );

    log.success('Turma inserida', { class_id: result.lastID, codigo_turma: data.codigo_turma });
    return { id: result.lastID, ...data };
}

/**
 * O que faz: remove todas as turmas de uma disciplina.
 * Onde e usada: refresh de scraping e limpeza.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function deleteClassesByDisciplineId(disciplineId) {
    log.start('Removendo turmas da disciplina', { discipline_id: disciplineId });
    const result = await executeQuery('DELETE FROM discipline_classes WHERE discipline_id = ?', [disciplineId]);
    log.success('Turmas removidas da disciplina', { discipline_id: disciplineId, changes: result.changes });
    return result;
}

/**
 * O que faz: lista horarios de uma turma.
 * Onde e usada: montagem de disciplina completa.
 * Dependencias chamadas: allQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getSchedulesByClassId(classId) {
    log.start('Buscando horarios da turma', { class_id: classId });
    const rows = await allQuery(
        'SELECT * FROM class_schedules WHERE class_id = ? ORDER BY dia, horario_inicio',
        [classId]
    );
    log.success('Horarios carregados', { class_id: classId, count: rows.length });
    return rows;
}

/**
 * O que faz: insere horario de turma.
 * Onde e usada: importacao de dados de disciplinas.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function insertSchedule(data) {
    log.start('Inserindo horario de turma', { class_id: data.class_id, dia: data.dia });

    const result = await executeQuery(
        'INSERT INTO class_schedules (class_id, dia, horario_inicio, horario_fim) VALUES (?, ?, ?, ?)',
        [data.class_id, data.dia, data.horario_inicio, data.horario_fim]
    );

    log.success('Horario inserido', { schedule_id: result.lastID, class_id: data.class_id });
    return { id: result.lastID, ...data };
}

/**
 * O que faz: remove horarios de uma turma.
 * Onde e usada: limpeza de estrutura de turma.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function deleteSchedulesByClassId(classId) {
    log.start('Removendo horarios da turma', { class_id: classId });
    const result = await executeQuery('DELETE FROM class_schedules WHERE class_id = ?', [classId]);
    log.success('Horarios removidos', { class_id: classId, changes: result.changes });
    return result;
}

/**
 * O que faz: lista professores de uma turma.
 * Onde e usada: montagem de disciplina completa.
 * Dependencias chamadas: allQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getProfessorsByClassId(classId) {
    log.start('Buscando professores da turma', { class_id: classId });
    const rows = await allQuery(
        'SELECT * FROM class_professors WHERE class_id = ? ORDER BY nome',
        [classId]
    );
    log.success('Professores carregados', { class_id: classId, count: rows.length });
    return rows;
}

/**
 * O que faz: insere professor vinculado a turma/horario.
 * Onde e usada: importacao de dados de disciplinas.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function insertProfessor(data) {
    log.start('Inserindo professor', { class_id: data.class_id, nome: data.nome });

    const result = await executeQuery(
        'INSERT INTO class_professors (class_id, schedule_id, nome) VALUES (?, ?, ?)',
        [data.class_id, data.schedule_id || null, data.nome]
    );

    log.success('Professor inserido', { professor_id: result.lastID, class_id: data.class_id });
    return { id: result.lastID, ...data };
}

/**
 * O que faz: remove professores de uma turma.
 * Onde e usada: limpeza de estrutura de turma.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function deleteProfessorsByClassId(classId) {
    log.start('Removendo professores da turma', { class_id: classId });
    const result = await executeQuery('DELETE FROM class_professors WHERE class_id = ?', [classId]);
    log.success('Professores removidos', { class_id: classId, changes: result.changes });
    return result;
}

module.exports = {
    getClassesByDisciplineId,
    insertClass,
    deleteClassesByDisciplineId,
    getSchedulesByClassId,
    insertSchedule,
    deleteSchedulesByClassId,
    getProfessorsByClassId,
    insertProfessor,
    deleteProfessorsByClassId
};
