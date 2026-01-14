// DisciplineEvaluationsController gerencia as operações de controle para avaliações de disciplinas,
// conectando as rotas aos modelos.
//
// Ratings: 0.5 a 5.0 em incrementos de 0.5 (estilo Letterboxd)
// Avaliações de estrelas são sempre anônimas
// Comentários mostram nome por padrão, mas usuário pode escolher anonimato
//
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const disciplineEvaluationsModel = require('../models/DisciplineEvaluationsModel');
const disciplinesModel = require('../models/DisciplinesModel');

class DisciplineEvaluationsController {

    /**
     * Valida se os ratings estão no formato correto (0.5 a 5.0, incrementos de 0.5)
     */
    _validateRating(rating) {
        if (rating === null || rating === undefined) return true;
        const num = parseFloat(rating);
        if (isNaN(num)) return false;
        if (num < 0.5 || num > 5.0) return false;
        // Verifica se é múltiplo de 0.5
        return (num * 2) % 1 === 0;
    }

    /**
     * Cria uma nova avaliação
     * POST /api/evaluations
     * Requer autenticação
     */
    async createEvaluation(req, res) {
        try {
            const userId = req.user.id;
            const {
                disciplineCodigo,
                turmaCodigo,
                semestre,
                ratingGeral,
                ratingDificuldade,
                ratingCargaTrabalho,
                ratingProfessores,
                ratingClareza,
                ratingUtilidade,
                ratingOrganizacao,
                comentario,
                isAnonymous
            } = req.body;

            console.log(`🔵 [DisciplineEvaluationsController] Criando avaliação: disciplina=${disciplineCodigo}, user=${userId}`);

            // Validação: código da disciplina obrigatório
            if (!disciplineCodigo) {
                console.warn(`🟡 [DisciplineEvaluationsController] Código da disciplina não fornecido`);
                return res.status(400).json({ error: 'Código da disciplina é obrigatório' });
            }

            // Validação: pelo menos um rating OU comentário deve ser fornecido
            const hasRating = [ratingGeral, ratingDificuldade, ratingCargaTrabalho, ratingProfessores, ratingClareza, ratingUtilidade, ratingOrganizacao]
                .some(r => r !== null && r !== undefined);
            const hasComment = comentario && comentario.trim().length > 0;

            if (!hasRating && !hasComment) {
                console.warn(`🟡 [DisciplineEvaluationsController] Nenhum rating ou comentário fornecido`);
                return res.status(400).json({ error: 'Forneça pelo menos um rating ou um comentário' });
            }

            // Validação: todos os ratings devem estar no formato correto
            const ratings = { ratingGeral, ratingDificuldade, ratingCargaTrabalho, ratingProfessores, ratingClareza, ratingUtilidade, ratingOrganizacao };
            for (const [key, value] of Object.entries(ratings)) {
                if (!this._validateRating(value)) {
                    console.warn(`🟡 [DisciplineEvaluationsController] Rating inválido: ${key}=${value}`);
                    return res.status(400).json({ error: `Rating ${key} deve ser entre 0.5 e 5.0, em incrementos de 0.5` });
                }
            }

            // Busca disciplina pelo código
            const discipline = await disciplinesModel.getDisciplineByCodigo(disciplineCodigo);
            if (!discipline) {
                console.warn(`🟡 [DisciplineEvaluationsController] Disciplina não encontrada: ${disciplineCodigo}`);
                return res.status(404).json({ error: 'Disciplina não encontrada' });
            }

            const result = await disciplineEvaluationsModel.createEvaluation({
                disciplineId: discipline.id,
                userId,
                turmaCodigo,
                semestre,
                ratingGeral: ratingGeral || null,
                ratingDificuldade: ratingDificuldade || null,
                ratingCargaTrabalho: ratingCargaTrabalho || null,
                ratingProfessores: ratingProfessores || null,
                ratingClareza: ratingClareza || null,
                ratingUtilidade: ratingUtilidade || null,
                ratingOrganizacao: ratingOrganizacao || null,
                comentario: comentario?.trim() || null,
                isAnonymous: isAnonymous || false
            });

            console.log(`🟢 [DisciplineEvaluationsController] Avaliação criada: id=${result.id}`);
            res.status(201).json(result);
        } catch (error) {
            if (error.message === 'USER_ALREADY_EVALUATED') {
                console.warn(`🟡 [DisciplineEvaluationsController] Usuário já avaliou esta disciplina`);
                return res.status(409).json({ error: 'Você já avaliou esta disciplina. Use a opção de editar.' });
            }
            console.error("🔴 [DisciplineEvaluationsController] Erro ao criar avaliação:", error.message);
            res.status(500).json({ error: 'Erro ao criar avaliação' });
        }
    }

    /**
     * Atualiza uma avaliação existente
     * PUT /api/evaluations/:id
     * Requer autenticação, só permite editar própria avaliação
     */
    async updateEvaluation(req, res) {
        try {
            const userId = req.user.id;
            const evaluationId = parseInt(req.params.id);
            const {
                turmaCodigo,
                semestre,
                ratingGeral,
                ratingDificuldade,
                ratingCargaTrabalho,
                ratingProfessores,
                ratingClareza,
                ratingUtilidade,
                ratingOrganizacao,
                comentario,
                isAnonymous
            } = req.body;

            console.log(`🔵 [DisciplineEvaluationsController] Atualizando avaliação: id=${evaluationId}, user=${userId}`);

            // Validação: pelo menos um rating OU comentário deve ser fornecido
            const hasRating = [ratingGeral, ratingDificuldade, ratingCargaTrabalho, ratingProfessores, ratingClareza, ratingUtilidade, ratingOrganizacao]
                .some(r => r !== null && r !== undefined);
            const hasComment = comentario && comentario.trim().length > 0;

            if (!hasRating && !hasComment) {
                console.warn(`🟡 [DisciplineEvaluationsController] Nenhum rating ou comentário fornecido`);
                return res.status(400).json({ error: 'Forneça pelo menos um rating ou um comentário' });
            }

            // Validação de ratings
            const ratings = { ratingGeral, ratingDificuldade, ratingCargaTrabalho, ratingProfessores, ratingClareza, ratingUtilidade, ratingOrganizacao };
            for (const [key, value] of Object.entries(ratings)) {
                if (!this._validateRating(value)) {
                    console.warn(`🟡 [DisciplineEvaluationsController] Rating inválido: ${key}=${value}`);
                    return res.status(400).json({ error: `Rating ${key} deve ser entre 0.5 e 5.0, em incrementos de 0.5` });
                }
            }

            const result = await disciplineEvaluationsModel.updateEvaluation(evaluationId, userId, {
                turmaCodigo,
                semestre,
                ratingGeral: ratingGeral !== undefined ? (ratingGeral || null) : undefined,
                ratingDificuldade: ratingDificuldade !== undefined ? (ratingDificuldade || null) : undefined,
                ratingCargaTrabalho: ratingCargaTrabalho !== undefined ? (ratingCargaTrabalho || null) : undefined,
                ratingProfessores: ratingProfessores !== undefined ? (ratingProfessores || null) : undefined,
                ratingClareza: ratingClareza !== undefined ? (ratingClareza || null) : undefined,
                ratingUtilidade: ratingUtilidade !== undefined ? (ratingUtilidade || null) : undefined,
                ratingOrganizacao: ratingOrganizacao !== undefined ? (ratingOrganizacao || null) : undefined,
                comentario: comentario?.trim() || null,
                isAnonymous
            });

            if (!result) {
                console.warn(`🟡 [DisciplineEvaluationsController] Avaliação não encontrada ou não pertence ao usuário`);
                return res.status(404).json({ error: 'Avaliação não encontrada ou você não tem permissão para editá-la' });
            }

            console.log(`🟢 [DisciplineEvaluationsController] Avaliação atualizada: id=${evaluationId}`);
            res.json(result);
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsController] Erro ao atualizar avaliação:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar avaliação' });
        }
    }

    /**
     * Deleta uma avaliação
     * DELETE /api/evaluations/:id
     * Requer autenticação, só permite deletar própria avaliação
     */
    async deleteEvaluation(req, res) {
        try {
            const userId = req.user.id;
            const evaluationId = parseInt(req.params.id);

            console.log(`🔵 [DisciplineEvaluationsController] Deletando avaliação: id=${evaluationId}, user=${userId}`);

            const deleted = await disciplineEvaluationsModel.deleteEvaluation(evaluationId, userId);

            if (!deleted) {
                console.warn(`🟡 [DisciplineEvaluationsController] Avaliação não encontrada ou não pertence ao usuário`);
                return res.status(404).json({ error: 'Avaliação não encontrada ou você não tem permissão para excluí-la' });
            }

            console.log(`🟢 [DisciplineEvaluationsController] Avaliação deletada: id=${evaluationId}`);
            res.json({ message: 'Avaliação excluída com sucesso' });
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsController] Erro ao deletar avaliação:", error.message);
            res.status(500).json({ error: 'Erro ao deletar avaliação' });
        }
    }

    /**
     * Busca avaliações de uma disciplina por código
     * GET /api/evaluations/discipline/:codigo
     * Público (mas currentUserId é usado se autenticado para marcar próprias avaliações)
     */
    async getEvaluationsByDiscipline(req, res) {
        try {
            const { codigo } = req.params;
            const currentUserId = req.user?.id || null;

            console.log(`🔵 [DisciplineEvaluationsController] Buscando avaliações: disciplina=${codigo}`);

            const evaluations = await disciplineEvaluationsModel.getEvaluationsByDisciplineCodigo(codigo, currentUserId);

            console.log(`🟢 [DisciplineEvaluationsController] ${evaluations.length} avaliações encontradas`);
            res.json(evaluations);
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsController] Erro ao buscar avaliações:", error.message);
            res.status(500).json({ error: 'Erro ao buscar avaliações' });
        }
    }

    /**
     * Busca ratings agregados de uma disciplina
     * GET /api/evaluations/discipline/:codigo/stats
     * Público
     */
    async getAggregatedRatings(req, res) {
        try {
            const { codigo } = req.params;

            console.log(`🔵 [DisciplineEvaluationsController] Buscando ratings agregados: disciplina=${codigo}`);

            const stats = await disciplineEvaluationsModel.getAggregatedRatings(codigo);

            console.log(`🟢 [DisciplineEvaluationsController] Ratings agregados retornados`);
            res.json(stats);
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsController] Erro ao buscar ratings agregados:", error.message);
            res.status(500).json({ error: 'Erro ao buscar ratings' });
        }
    }

    /**
     * Busca a avaliação do usuário logado para uma disciplina
     * GET /api/evaluations/discipline/:codigo/mine
     * Requer autenticação
     */
    async getUserEvaluationForDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const { codigo } = req.params;

            console.log(`🔵 [DisciplineEvaluationsController] Buscando avaliação do usuário: user=${userId}, disciplina=${codigo}`);

            const evaluation = await disciplineEvaluationsModel.getUserEvaluationForDiscipline(userId, codigo);

            if (!evaluation) {
                console.log(`🟡 [DisciplineEvaluationsController] Usuário ainda não avaliou esta disciplina`);
                return res.status(404).json({ error: 'Você ainda não avaliou esta disciplina' });
            }

            console.log(`🟢 [DisciplineEvaluationsController] Avaliação do usuário encontrada`);
            res.json(evaluation);
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsController] Erro ao buscar avaliação do usuário:", error.message);
            res.status(500).json({ error: 'Erro ao buscar sua avaliação' });
        }
    }

    /**
     * Busca todas as avaliações do usuário logado
     * GET /api/evaluations/mine
     * Requer autenticação
     */
    async getUserEvaluations(req, res) {
        try {
            const userId = req.user.id;

            console.log(`🔵 [DisciplineEvaluationsController] Buscando todas avaliações do usuário: user=${userId}`);

            const evaluations = await disciplineEvaluationsModel.getUserEvaluations(userId);

            console.log(`🟢 [DisciplineEvaluationsController] ${evaluations.length} avaliações do usuário encontradas`);
            res.json(evaluations);
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsController] Erro ao buscar avaliações do usuário:", error.message);
            res.status(500).json({ error: 'Erro ao buscar suas avaliações' });
        }
    }

    /**
     * Toggle like em uma avaliação
     * POST /api/evaluations/:id/like
     * Requer autenticação
     */
    async toggleLike(req, res) {
        try {
            const userId = req.user.id;
            const evaluationId = parseInt(req.params.id);

            console.log(`🔵 [DisciplineEvaluationsController] Toggle like: evaluation=${evaluationId}, user=${userId}`);

            // Verifica se a avaliação existe
            const evaluation = await disciplineEvaluationsModel.getEvaluationById(evaluationId);
            if (!evaluation) {
                console.warn(`🟡 [DisciplineEvaluationsController] Avaliação não encontrada: ${evaluationId}`);
                return res.status(404).json({ error: 'Avaliação não encontrada' });
            }

            // Não permite dar like na própria avaliação
            if (evaluation.user_id === userId) {
                console.warn(`🟡 [DisciplineEvaluationsController] Usuário tentou dar like na própria avaliação`);
                return res.status(400).json({ error: 'Você não pode dar like na própria avaliação' });
            }

            const result = await disciplineEvaluationsModel.toggleLike(evaluationId, userId);

            console.log(`🟢 [DisciplineEvaluationsController] Like ${result.liked ? 'adicionado' : 'removido'}`);
            res.json(result);
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsController] Erro ao toggle like:", error.message);
            res.status(500).json({ error: 'Erro ao processar like' });
        }
    }
}

module.exports = new DisciplineEvaluationsController();
