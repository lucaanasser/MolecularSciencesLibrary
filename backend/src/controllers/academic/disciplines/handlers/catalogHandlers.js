/**
 * Responsabilidade: handlers HTTP de consulta do catalogo de disciplinas.
 * Camada: controller.
 * Entradas/Saidas: req/res de listagem, busca e estatisticas.
 * Dependencias criticas: AcademicDisciplinesService via this.service.
 */

/**
 * O que faz: busca disciplinas por termo para autocomplete.
 * Onde e usada: rota GET /search.
 * Dependencias chamadas: service.searchDisciplines.
 * Efeitos colaterais: leitura em DB.
 */
async function searchDisciplines(req, res) {
    try {
        const { q, limit } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const rows = await this.service.searchDisciplines(q, limit ? parseInt(limit, 10) : 10);
        return res.json(rows);
    } catch (error) {
        this.log.error('Erro em searchDisciplines', { err: error.message });
        return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
    }
}

/**
 * O que faz: retorna estatisticas do catalogo de disciplinas.
 * Onde e usada: rota GET /stats.
 * Dependencias chamadas: service.getStats.
 * Efeitos colaterais: leitura em DB.
 */
async function getStats(req, res) {
    try {
        const stats = await this.service.getStats();
        return res.json(stats);
    } catch (error) {
        this.log.error('Erro em getStats', { err: error.message });
        return res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
}

/**
 * O que faz: conta disciplinas por filtros.
 * Onde e usada: rota GET /count.
 * Dependencias chamadas: service.countDisciplines.
 * Efeitos colaterais: leitura em DB.
 */
async function countDisciplines(req, res) {
    try {
        const { campus, unidade, search, hasValidClasses, isPostgrad } = req.query;
        const total = await this.service.countDisciplines({
            campus: campus || null,
            unidade: unidade || null,
            searchTerm: search || null,
            hasValidClasses: hasValidClasses === 'true' ? true : null,
            isPostgrad: isPostgrad === 'true' ? true : null
        });

        return res.json({ total });
    } catch (error) {
        this.log.error('Erro em countDisciplines', { err: error.message });
        return res.status(500).json({ error: 'Erro ao contar disciplinas' });
    }
}

/**
 * O que faz: verifica existencia de codigo exato (case-insensitive por normalizacao).
 * Onde e usada: rota GET /check-exact/:codigo.
 * Dependencias chamadas: service.getDisciplineByCodigo.
 * Efeitos colaterais: leitura em DB.
 */
async function checkExactMatch(req, res) {
    try {
        const { codigo } = req.params;
        const row = await this.service.getDisciplineByCodigo(codigo.toUpperCase());
        if (!row) {
            return res.json({ exists: false });
        }
        return res.json({ exists: true, codigo: row.codigo });
    } catch (error) {
        this.log.error('Erro em checkExactMatch', { err: error.message, codigo: req.params.codigo });
        return res.status(500).json({ error: 'Erro ao verificar disciplina' });
    }
}

module.exports = {
    searchDisciplines,
    getStats,
    countDisciplines,
    checkExactMatch
};
