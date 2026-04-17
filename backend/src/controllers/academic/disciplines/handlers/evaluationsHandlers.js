/**
 * Responsabilidade: handlers HTTP de avaliacoes no bloco unificado academic/disciplines.
 * Camada: controller.
 * Entradas/Saidas: req/res de endpoints de avaliacoes; delega ao service e traduz status.
 * Dependencias criticas: AcademicDisciplinesService via this.service.
 */

/**
 * O que faz: cria avaliacao para disciplina.
 * Onde e usada: rota POST de avaliacoes.
 * Dependencias chamadas: service.createEvaluation.
 * Efeitos colaterais: escrita em DB.
 */
async function createEvaluation(req, res) {
    try {
        const userId = req.user.id;
        const result = await this.service.createEvaluation(userId, req.body);
        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(result.status).json(result.data);
    } catch (error) {
        this.log.error('Erro em createEvaluation', { err: error.message, user_id: req.user?.id });
        return res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
}

/**
 * O que faz: atualiza avaliacao do usuario logado.
 * Onde e usada: rota PUT de avaliacoes.
 * Dependencias chamadas: service.updateEvaluation.
 * Efeitos colaterais: escrita em DB.
 */
async function updateEvaluation(req, res) {
    try {
        const userId = req.user.id;
        const evaluationId = parseInt(req.params.id, 10);
        const result = await this.service.updateEvaluation(evaluationId, userId, req.body);
        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(result.status).json(result.data);
    } catch (error) {
        this.log.error('Erro em updateEvaluation', { err: error.message, user_id: req.user?.id });
        return res.status(500).json({ error: 'Erro ao atualizar avaliação' });
    }
}

/**
 * O que faz: remove avaliacao do usuario logado.
 * Onde e usada: rota DELETE de avaliacoes.
 * Dependencias chamadas: service.deleteEvaluation.
 * Efeitos colaterais: escrita em DB.
 */
async function deleteEvaluation(req, res) {
    try {
        const userId = req.user.id;
        const evaluationId = parseInt(req.params.id, 10);
        const result = await this.service.deleteEvaluation(evaluationId, userId);
        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(result.status).json(result.data);
    } catch (error) {
        this.log.error('Erro em deleteEvaluation', { err: error.message, user_id: req.user?.id });
        return res.status(500).json({ error: 'Erro ao deletar avaliação' });
    }
}

/**
 * O que faz: lista avaliacoes de uma disciplina, com contexto opcional do usuario.
 * Onde e usada: rota GET publica de avaliacoes por disciplina.
 * Dependencias chamadas: service.getEvaluationsByDiscipline.
 * Efeitos colaterais: leitura em DB.
 */
async function getEvaluationsByDiscipline(req, res) {
    try {
        const { codigo } = req.params;
        const currentUserId = req.user?.id || null;
        const rows = await this.service.getEvaluationsByDiscipline(codigo, currentUserId);
        return res.json(rows);
    } catch (error) {
        this.log.error('Erro em getEvaluationsByDiscipline', { err: error.message, codigo: req.params.codigo });
        return res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
}

/**
 * O que faz: retorna stats agregados de avaliacoes por disciplina.
 * Onde e usada: rota GET /discipline/:codigo/stats.
 * Dependencias chamadas: service.getAggregatedRatings.
 * Efeitos colaterais: leitura em DB.
 */
async function getAggregatedRatings(req, res) {
    try {
        const stats = await this.service.getAggregatedRatings(req.params.codigo);
        return res.json(stats);
    } catch (error) {
        this.log.error('Erro em getAggregatedRatings', { err: error.message, codigo: req.params.codigo });
        return res.status(500).json({ error: 'Erro ao buscar ratings' });
    }
}

/**
 * O que faz: retorna avaliacao do usuario logado para disciplina.
 * Onde e usada: rota GET /discipline/:codigo/mine.
 * Dependencias chamadas: service.getUserEvaluationForDiscipline.
 * Efeitos colaterais: leitura em DB.
 */
async function getUserEvaluationForDiscipline(req, res) {
    try {
        const row = await this.service.getUserEvaluationForDiscipline(req.user.id, req.params.codigo);
        if (!row) {
            return res.status(404).json({ error: 'Você ainda não avaliou esta disciplina' });
        }
        return res.json(row);
    } catch (error) {
        this.log.error('Erro em getUserEvaluationForDiscipline', { err: error.message, user_id: req.user?.id });
        return res.status(500).json({ error: 'Erro ao buscar sua avaliação' });
    }
}

/**
 * O que faz: lista avaliacoes do usuario logado.
 * Onde e usada: rota GET /mine.
 * Dependencias chamadas: service.getUserEvaluations.
 * Efeitos colaterais: leitura em DB.
 */
async function getUserEvaluations(req, res) {
    try {
        const rows = await this.service.getUserEvaluations(req.user.id);
        return res.json(rows);
    } catch (error) {
        this.log.error('Erro em getUserEvaluations', { err: error.message, user_id: req.user?.id });
        return res.status(500).json({ error: 'Erro ao buscar suas avaliações' });
    }
}

/**
 * O que faz: alterna like em avaliacao de terceiro.
 * Onde e usada: rota POST /:id/like.
 * Dependencias chamadas: service.toggleLike.
 * Efeitos colaterais: escrita em DB.
 */
async function toggleLike(req, res) {
    try {
        const result = await this.service.toggleLike(parseInt(req.params.id, 10), req.user.id);
        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(result.status).json(result.data);
    } catch (error) {
        this.log.error('Erro em toggleLike', { err: error.message, user_id: req.user?.id });
        return res.status(500).json({ error: 'Erro ao processar like' });
    }
}

module.exports = {
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    getEvaluationsByDiscipline,
    getAggregatedRatings,
    getUserEvaluationForDiscipline,
    getUserEvaluations,
    toggleLike
};
