/**
 * Responsabilidade: handlers HTTP de votos do Fórum (perguntas e respostas).
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints POST de voto; valida tipo e delega ao model.
 * Dependencias criticas: ForumModel e logger padronizado.
 */

const ForumModel = require('../../../../models/academic/ForumModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Vota em uma pergunta
     * POST /api/forum/questions/:id/vote
     */
    async voteQuestion(req, res) {
        try {
            const { id } = req.params;
            const { voteType } = req.body; // 1 ou -1
            log.start('POST /questions/:id/vote - Votar em pergunta', { id, voteType });

            if (voteType !== 1 && voteType !== -1) {
                return res.status(400).json({ error: 'Tipo de voto inválido. Use 1 ou -1' });
            }

            // Verificar se pergunta existe
            const question = await ForumModel.getQuestionById(Number(id));
            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            // Não pode votar na própria pergunta
            if (question.autor_id === req.user.id) {
                return res.status(403).json({ error: 'Você não pode votar na própria pergunta' });
            }

            const voteDiff = await ForumModel.vote(req.user.id, 'question', Number(id), voteType);
            const newVoteCount = question.votos + voteDiff;

            log.success('Voto registrado', { total: newVoteCount });
            res.json({
                success: true,
                votos: newVoteCount,
                userVote: voteDiff === 0 ? 0 : (voteDiff > 0 ? voteType : 0)
            });
        } catch (error) {
            log.error('Erro ao votar em pergunta', { error: error.message });
            res.status(500).json({ error: 'Erro ao registrar voto', details: error.message });
        }
    },

    /**
     * Vota em uma resposta
     * POST /api/forum/answers/:id/vote
     */
    async voteAnswer(req, res) {
        try {
            const { id } = req.params;
            const { voteType } = req.body;
            log.start('POST /answers/:id/vote - Votar em resposta', { id, voteType });

            if (voteType !== 1 && voteType !== -1) {
                return res.status(400).json({ error: 'Tipo de voto inválido. Use 1 ou -1' });
            }

            // Verificar se resposta existe
            const answer = await ForumModel.getAnswerById(Number(id));
            if (!answer) {
                return res.status(404).json({ error: 'Resposta não encontrada' });
            }

            // Não pode votar na própria resposta
            if (answer.autor_id === req.user.id) {
                return res.status(403).json({ error: 'Você não pode votar na própria resposta' });
            }

            const voteDiff = await ForumModel.vote(req.user.id, 'answer', Number(id), voteType);
            const newVoteCount = answer.votos + voteDiff;

            log.success('Voto registrado', { total: newVoteCount });
            res.json({
                success: true,
                votos: newVoteCount,
                userVote: voteDiff === 0 ? 0 : (voteDiff > 0 ? voteType : 0)
            });
        } catch (error) {
            log.error('Erro ao votar em resposta', { error: error.message });
            res.status(500).json({ error: 'Erro ao registrar voto', details: error.message });
        }
    }
};
