/**
 * Responsabilidade: handlers HTTP de disciplinas no bloco unificado academic/disciplines.
 * Camada: controller.
 * Entradas/Saidas: req/res de endpoints de disciplinas; delega ao service e traduz status.
 * Dependencias criticas: AcademicDisciplinesService via this.service e logger padronizado.
 */

/**
 * O que faz: cria disciplina manual apos validacoes basicas de payload.
 * Onde e usada: rotas POST de disciplinas (legado e v2).
 * Dependencias chamadas: service.getDisciplineByCodigo e service.createManualDiscipline.
 * Efeitos colaterais: persiste disciplina em DB.
 */
async function createDiscipline(req, res) {
    try {
        const {
            codigo,
            nome,
            unidade,
            campus,
            creditos_aula,
            creditos_trabalho,
            is_postgrad,
            ementa,
            objetivos,
            conteudo_programatico
        } = req.body;

        this.log.start('Iniciando criacao manual de disciplina', { codigo });

        if (!codigo || !codigo.trim()) {
            this.log.warn('Codigo obrigatorio ausente em createDiscipline');
            return res.status(400).json({ error: 'O código da disciplina é obrigatório' });
        }

        if (!nome || !nome.trim()) {
            this.log.warn('Nome obrigatorio ausente em createDiscipline', { codigo });
            return res.status(400).json({ error: 'O nome da disciplina é obrigatório' });
        }

        const normalizedCode = codigo.trim().toUpperCase();
        const existing = await this.service.getDisciplineByCodigo(normalizedCode);
        if (existing) {
            this.log.warn('Disciplina ja existente em createDiscipline', { codigo: normalizedCode });
            return res.status(409).json({
                error: 'Disciplina já existe',
                codigo: normalizedCode,
                nome: existing.nome
            });
        }

        const result = await this.service.createManualDiscipline({
            codigo: normalizedCode,
            nome: nome.trim(),
            unidade: unidade?.trim() || null,
            campus: campus?.trim() || null,
            creditos_aula: parseInt(creditos_aula, 10) || 0,
            creditos_trabalho: parseInt(creditos_trabalho, 10) || 0,
            is_postgrad: Boolean(is_postgrad),
            ementa: ementa?.trim() || null,
            objetivos: objetivos?.trim() || null,
            conteudo_programatico: conteudo_programatico?.trim() || null
        });

        this.log.success('Disciplina criada com sucesso', { codigo: normalizedCode, discipline_id: result?.id });
        return res.status(201).json(result);
    } catch (error) {
        this.log.error('Erro em createDiscipline', { err: error.message });
        return res.status(500).json({ error: 'Erro ao criar disciplina' });
    }
}

/**
 * O que faz: lista disciplinas com filtros de query string.
 * Onde e usada: rotas GET de listagem.
 * Dependencias chamadas: service.getDisciplines.
 * Efeitos colaterais: nenhum alem de leitura.
 */
async function getDisciplines(req, res) {
    try {
        const { campus, unidade, search, limit, offset } = req.query;
        const filters = {
            campus: campus || null,
            unidade: unidade || null,
            searchTerm: search || null,
            limit: limit ? parseInt(limit, 10) : null,
            offset: offset ? parseInt(offset, 10) : null
        };

        const rows = await this.service.getDisciplines(filters);
        return res.json(rows);
    } catch (error) {
        this.log.error('Erro em getDisciplines', { err: error.message });
        return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
    }
}

/**
 * O que faz: busca disciplina por codigo.
 * Onde e usada: rota GET /:codigo.
 * Dependencias chamadas: service.getDisciplineByCodigo.
 * Efeitos colaterais: nenhum alem de leitura.
 */
async function getDisciplineByCodigo(req, res) {
    try {
        const { codigo } = req.params;
        const row = await this.service.getDisciplineByCodigo(codigo);
        if (!row) {
            return res.status(404).json({ error: 'Disciplina não encontrada' });
        }
        return res.json(row);
    } catch (error) {
        this.log.error('Erro em getDisciplineByCodigo', { err: error.message, codigo: req.params.codigo });
        return res.status(500).json({ error: 'Erro ao buscar disciplina' });
    }
}

/**
 * O que faz: busca disciplina completa com turmas/horarios/professores.
 * Onde e usada: rota GET /:codigo/full.
 * Dependencias chamadas: service.getFullDiscipline.
 * Efeitos colaterais: nenhum alem de leitura.
 */
async function getFullDiscipline(req, res) {
    try {
        const { codigo } = req.params;
        const row = await this.service.getFullDiscipline(codigo);
        if (!row) {
            return res.status(404).json({ error: 'Disciplina não encontrada' });
        }
        return res.json(row);
    } catch (error) {
        this.log.error('Erro em getFullDiscipline', { err: error.message, codigo: req.params.codigo });
        return res.status(500).json({ error: 'Erro ao buscar disciplina' });
    }
}

/**
 * O que faz: retorna campi disponiveis.
 * Onde e usada: rota GET /campi.
 * Dependencias chamadas: service.getCampi.
 * Efeitos colaterais: nenhum alem de leitura.
 */
async function getCampi(req, res) {
    try {
        const rows = await this.service.getCampi();
        return res.json(rows);
    } catch (error) {
        this.log.error('Erro em getCampi', { err: error.message });
        return res.status(500).json({ error: 'Erro ao buscar campi' });
    }
}

/**
 * O que faz: retorna unidades disponiveis com filtro opcional de campus.
 * Onde e usada: rota GET /unidades.
 * Dependencias chamadas: service.getUnidades.
 * Efeitos colaterais: nenhum alem de leitura.
 */
async function getUnidades(req, res) {
    try {
        const { campus } = req.query;
        const rows = await this.service.getUnidades(campus || null);
        return res.json(rows);
    } catch (error) {
        this.log.error('Erro em getUnidades', { err: error.message });
        return res.status(500).json({ error: 'Erro ao buscar unidades' });
    }
}

module.exports = {
    createDiscipline,
    getDisciplines,
    getDisciplineByCodigo,
    getFullDiscipline,
    getCampi,
    getUnidades
};
