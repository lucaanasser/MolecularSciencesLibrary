/**
 * Responsabilidade: consultas de disciplinas (listagem, busca por chave e filtros).
 * Camada: model.
 * Entradas/Saidas: filtros e identificadores; retorna linhas da tabela disciplines.
 * Dependencias criticas: db helpers (getQuery, allQuery) e logger padronizado.
 */

const { getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: busca disciplinas com filtros opcionais e paginacao.
 * Onde e usada: AcademicDisciplinesService.getDisciplines e searchDisciplines.
 * Dependencias chamadas: allQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getDisciplines({ campus, unidade, searchTerm, hasValidClasses, isPostgrad, limit, offset } = {}) {
    log.start('Buscando disciplinas com filtros', { campus, unidade, searchTerm });

    let query = 'SELECT * FROM disciplines';
    const params = [];
    const conditions = [];

    if (campus) {
        conditions.push('campus = ?');
        params.push(campus);
    }
    if (unidade) {
        conditions.push('unidade = ?');
        params.push(unidade);
    }
    if (searchTerm) {
        conditions.push('(codigo LIKE ? COLLATE NOCASE OR nome LIKE ? COLLATE NOCASE)');
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    if (hasValidClasses !== undefined && hasValidClasses !== null) {
        conditions.push('has_valid_classes = ?');
        params.push(hasValidClasses ? 1 : 0);
    }
    if (isPostgrad !== undefined && isPostgrad !== null) {
        conditions.push('is_postgrad = ?');
        params.push(isPostgrad ? 1 : 0);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY codigo ASC';

    if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
        if (offset) {
            query += ' OFFSET ?';
            params.push(offset);
        }
    }

    const rows = await allQuery(query, params);
    log.success('Disciplinas encontradas', { count: rows.length });
    return rows;
}

/**
 * O que faz: busca disciplina por codigo.
 * Onde e usada: validacoes e consultas detalhadas.
 * Dependencias chamadas: getQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getDisciplineByCodigo(codigo) {
    log.start('Buscando disciplina por codigo', { codigo });
    const row = await getQuery('SELECT * FROM disciplines WHERE codigo = ?', [codigo]);
    if (!row) {
        log.warn('Disciplina nao encontrada por codigo', { codigo });
        return null;
    }
    log.success('Disciplina encontrada por codigo', { codigo, discipline_id: row.id });
    return row;
}

/**
 * O que faz: busca disciplina por id.
 * Onde e usada: fluxos de consistencia e consultas internas.
 * Dependencias chamadas: getQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getDisciplineById(id) {
    log.start('Buscando disciplina por id', { discipline_id: id });
    const row = await getQuery('SELECT * FROM disciplines WHERE id = ?', [id]);
    if (!row) {
        log.warn('Disciplina nao encontrada por id', { discipline_id: id });
        return null;
    }
    log.success('Disciplina encontrada por id', { discipline_id: id });
    return row;
}

/**
 * O que faz: conta disciplinas com filtros opcionais.
 * Onde e usada: endpoint de count e estatisticas.
 * Dependencias chamadas: getQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function countDisciplines(filters = {}) {
    log.start('Contando disciplinas', { has_filters: Object.keys(filters).length > 0 });

    let query = 'SELECT COUNT(*) as total FROM disciplines';
    const params = [];
    const conditions = [];

    if (filters.campus) {
        conditions.push('campus = ?');
        params.push(filters.campus);
    }
    if (filters.unidade) {
        conditions.push('unidade = ?');
        params.push(filters.unidade);
    }
    if (filters.searchTerm) {
        conditions.push('(codigo LIKE ? COLLATE NOCASE OR nome LIKE ? COLLATE NOCASE)');
        params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
    }
    if (filters.hasValidClasses !== undefined && filters.hasValidClasses !== null) {
        conditions.push('has_valid_classes = ?');
        params.push(filters.hasValidClasses ? 1 : 0);
    }
    if (filters.isPostgrad !== undefined && filters.isPostgrad !== null) {
        conditions.push('is_postgrad = ?');
        params.push(filters.isPostgrad ? 1 : 0);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const row = await getQuery(query, params);
    const total = row?.total || 0;
    log.success('Contagem concluida', { total });
    return total;
}

/**
 * O que faz: lista campi distintos.
 * Onde e usada: filtros de UI e stats.
 * Dependencias chamadas: allQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getCampi() {
    log.start('Buscando campi distintos');
    const rows = await allQuery(
        'SELECT DISTINCT campus FROM disciplines WHERE campus IS NOT NULL ORDER BY campus',
        []
    );
    const campi = rows.map(item => item.campus);
    log.success('Campi carregados', { count: campi.length });
    return campi;
}

/**
 * O que faz: lista unidades distintas, opcionalmente por campus.
 * Onde e usada: filtros de UI e stats.
 * Dependencias chamadas: allQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getUnidades(campus = null) {
    log.start('Buscando unidades distintas', { campus });

    let query = 'SELECT DISTINCT unidade FROM disciplines WHERE unidade IS NOT NULL';
    const params = [];

    if (campus) {
        query += ' AND campus = ?';
        params.push(campus);
    }

    query += ' ORDER BY unidade';
    const rows = await allQuery(query, params);
    const unidades = rows.map(item => item.unidade);
    log.success('Unidades carregadas', { count: unidades.length });
    return unidades;
}

module.exports = {
    getDisciplines,
    getDisciplineByCodigo,
    getDisciplineById,
    countDisciplines,
    getCampi,
    getUnidades
};
