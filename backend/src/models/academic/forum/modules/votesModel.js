/**
 * Responsabilidade: votos polimorficos do forum (perguntas e respostas) - registrar, consultar e agregar.
 * Camada: model.
 * Entradas/Saidas: usuario, tipo/id do votavel e tipo de voto; retorna diff de votos e mapas de voto.
 * Dependencias criticas: db (executeQuery/getQuery/allQuery) e logger padronizado.
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: registra, alterna (toggle) ou atualiza um voto e ajusta a contagem de votos do item.
     * Onde e usada: ForumService ao votar em perguntas/respostas.
     * Dependencias chamadas: getQuery, executeQuery.
     * Efeitos colaterais: insere/atualiza/deleta forum_votes e atualiza votos do item.
     */
    async vote(userId, votableType, votableId, voteType) {
        log.start('Registrando voto', { userId, votableType, votableId, voteType });

        try {
            // Verificar se já existe um voto
            const existingVote = await getQuery(
                'SELECT * FROM forum_votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
                [userId, votableType, votableId]
            );

            let voteDiff = 0;

            if (existingVote) {
                if (existingVote.vote_type === voteType) {
                    // Mesmo voto - remover (toggle)
                    await executeQuery(
                        'DELETE FROM forum_votes WHERE id = ?',
                        [existingVote.id]
                    );
                    voteDiff = -voteType;
                    log.success('Voto removido (toggle)');
                } else {
                    // Voto diferente - atualizar
                    await executeQuery(
                        'UPDATE forum_votes SET vote_type = ? WHERE id = ?',
                        [voteType, existingVote.id]
                    );
                    voteDiff = voteType * 2; // Mudança de -1 para 1 ou vice-versa
                    log.success('Voto atualizado');
                }
            } else {
                // Novo voto
                await executeQuery(
                    'INSERT INTO forum_votes (user_id, votable_type, votable_id, vote_type, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                    [userId, votableType, votableId, voteType]
                );
                voteDiff = voteType;
                log.success('Novo voto registrado');
            }

            // Atualizar contagem de votos no item
            const table = votableType === 'question' ? 'forum_questions' : 'forum_answers';
            await executeQuery(
                `UPDATE ${table} SET votos = votos + ? WHERE id = ?`,
                [voteDiff, votableId]
            );

            return voteDiff;
        } catch (error) {
            log.error('Erro ao registrar voto', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: retorna o voto do usuario em um item (1, -1 ou 0 se nao votou).
     * Onde e usada: ForumController ao montar o estado de votos do usuario.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; em caso de erro retorna 0.
     */
    async getUserVote(userId, votableType, votableId) {
        try {
            const vote = await getQuery(
                'SELECT vote_type FROM forum_votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
                [userId, votableType, votableId]
            );
            return vote ? vote.vote_type : 0;
        } catch (error) {
            log.error('Erro ao buscar voto do usuario', { err: error.message });
            return 0;
        }
    },

    /**
     * O que faz: retorna um mapa votable_id -> vote_type para uma lista de itens.
     * Onde e usada: ForumController ao montar o estado de votos de uma listagem.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; em caso de erro retorna objeto vazio.
     */
    async getUserVotes(userId, votableType, votableIds) {
        if (!votableIds || votableIds.length === 0) return {};

        try {
            const placeholders = votableIds.map(() => '?').join(',');
            const votes = await allQuery(
                `SELECT votable_id, vote_type FROM forum_votes
                 WHERE user_id = ? AND votable_type = ? AND votable_id IN (${placeholders})`,
                [userId, votableType, ...votableIds]
            );

            const voteMap = {};
            votes.forEach(v => { voteMap[v.votable_id] = v.vote_type; });
            return voteMap;
        } catch (error) {
            log.error('Erro ao buscar votos do usuario', { err: error.message });
            return {};
        }
    }
};
