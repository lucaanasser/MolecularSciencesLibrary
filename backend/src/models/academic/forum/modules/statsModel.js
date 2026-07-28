/**
 * Responsabilidade: estatisticas e rankings do forum (reputacao, stats do usuario, top contributors, stats globais).
 * Camada: model.
 * Entradas/Saidas: ids de usuario/limites; retorna agregacoes de reputacao e contagens.
 * Dependencias criticas: db (getQuery/allQuery), logger e modulos irmaos via prototype (this.<sibling>).
 */

const { getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: calcula a reputacao do usuario: (votos perguntas * 5) + (votos respostas * 10) + (aceitas * 15).
     * Onde e usada: this.getUserStats e telas de perfil.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getUserReputation(userId) {
        log.start('Calculando reputacao do usuario', { userId });

        try {
            // Votos em perguntas (apenas não-anônimas)
            const questionVotes = await getQuery(`
                SELECT COALESCE(SUM(q.votos), 0) as total
                FROM forum_questions q
                WHERE q.autor_id = ? AND q.is_anonymous = 0
            `, [userId]);

            // Votos em respostas (apenas não-anônimas)
            const answerVotes = await getQuery(`
                SELECT COALESCE(SUM(a.votos), 0) as total
                FROM forum_answers a
                WHERE a.autor_id = ? AND a.is_anonymous = 0
            `, [userId]);

            // Respostas aceitas (apenas não-anônimas)
            const acceptedAnswers = await getQuery(`
                SELECT COUNT(*) as total
                FROM forum_answers
                WHERE autor_id = ? AND is_accepted = 1 AND is_anonymous = 0
            `, [userId]);

            const reputation =
                (questionVotes.total * 5) +
                (answerVotes.total * 10) +
                (acceptedAnswers.total * 15);

            log.success('Reputacao calculada', { reputation });
            return {
                reputation,
                questionVotes: questionVotes.total,
                answerVotes: answerVotes.total,
                acceptedAnswers: acceptedAnswers.total
            };
        } catch (error) {
            log.error('Erro ao calcular reputacao', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca as estatisticas do usuario no forum (perguntas, respostas, aceitas e reputacao).
     * Onde e usada: telas de perfil e resumo do usuario.
     * Dependencias chamadas: getQuery, this.getUserReputation.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getUserStats(userId) {
        log.start('Buscando estatisticas do usuario', { userId });

        try {
            const stats = await getQuery(`
                SELECT
                    (SELECT COUNT(*) FROM forum_questions WHERE autor_id = ? AND is_anonymous = 0) as questions_asked,
                    (SELECT COUNT(*) FROM forum_answers WHERE autor_id = ? AND is_anonymous = 0) as answers_given,
                    (SELECT COUNT(*) FROM forum_answers WHERE autor_id = ? AND is_accepted = 1 AND is_anonymous = 0) as accepted_answers
            `, [userId, userId, userId]);

            const reputation = await this.getUserReputation(userId);

            log.success('Estatisticas encontradas', { userId });
            return {
                ...stats,
                reputation: reputation.reputation
            };
        } catch (error) {
            log.error('Erro ao buscar estatisticas', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: monta o ranking de contribuidores por pontuacao (mesma formula da reputacao).
     * Onde e usada: sidebar/pagina de ranking do forum.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getTopContributors(limit = 5) {
        log.start('Buscando top contributors');

        try {
            const contributors = await allQuery(`
                SELECT
                    u.id,
                    u.name,
                    u.profile_image,
                    COALESCE(
                        (SELECT SUM(q.votos) * 5 FROM forum_questions q WHERE q.autor_id = u.id AND q.is_anonymous = 0), 0
                    ) + COALESCE(
                        (SELECT SUM(a.votos) * 10 FROM forum_answers a WHERE a.autor_id = u.id AND a.is_anonymous = 0), 0
                    ) + COALESCE(
                        (SELECT COUNT(*) * 15 FROM forum_answers WHERE autor_id = u.id AND is_accepted = 1 AND is_anonymous = 0), 0
                    ) as pontos,
                    (SELECT COUNT(*) FROM forum_questions WHERE autor_id = u.id AND is_anonymous = 0) as questions,
                    (SELECT COUNT(*) FROM forum_answers WHERE autor_id = u.id AND is_anonymous = 0) as answers,
                    (SELECT COUNT(*) FROM forum_answers WHERE autor_id = u.id AND is_accepted = 1 AND is_anonymous = 0) as accepted_answers
                FROM users u
                WHERE (
                    SELECT COUNT(*) FROM forum_questions WHERE autor_id = u.id AND is_anonymous = 0
                ) + (
                    SELECT COUNT(*) FROM forum_answers WHERE autor_id = u.id AND is_anonymous = 0
                ) > 0
                ORDER BY pontos DESC
                LIMIT ?
            `, [limit]);

            log.success('Top contributors encontrados', { count: contributors.length });
            return contributors;
        } catch (error) {
            log.error('Erro ao buscar top contributors', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: calcula estatisticas globais do forum (total de perguntas/respostas, usuarios ativos e taxa de resposta).
     * Onde e usada: dashboard/estatisticas gerais do forum.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getGlobalStats() {
        log.start('Buscando estatisticas globais');

        try {
            const stats = await getQuery(`
                SELECT
                    (SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0) as total_questions,
                    (SELECT COUNT(*) FROM forum_answers WHERE is_anonymous = 0) as total_answers,
                    (SELECT COUNT(DISTINCT autor_id) FROM forum_questions WHERE is_anonymous = 0) +
                    (SELECT COUNT(DISTINCT autor_id) FROM forum_answers WHERE is_anonymous = 0) as active_users,
                    CASE
                        WHEN (SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0) = 0 THEN 0
                        ELSE ROUND(
                            CAST((SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0 AND id IN (SELECT DISTINCT question_id FROM forum_answers WHERE is_anonymous = 0)) AS FLOAT) /
                            CAST((SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0) AS FLOAT) * 100
                        )
                    END as response_rate
            `);

            log.success('Estatisticas globais', { stats });
            return {
                total_questions: stats.total_questions || 0,
                total_answers: stats.total_answers || 0,
                active_users: stats.active_users || 0,
                response_rate: stats.response_rate || 0
            };
        } catch (error) {
            log.error('Erro ao buscar estatisticas globais', { err: error.message });
            throw error;
        }
    }
};
