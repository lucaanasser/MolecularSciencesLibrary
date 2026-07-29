/**
 * Responsabilidade: administracao/moderacao de tags do forum (pendentes, criacao, aprovacao, exclusao).
 * Camada: model.
 * Entradas/Saidas: dados/ids de tag; retorna listas, ids e flags de sucesso.
 * Dependencias criticas: db (executeQuery/getQuery/allQuery) e logger padronizado.
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista as tags criadas por usuarios (para revisao pelo admin), aprovadas ou nao.
     * Onde e usada: painel de administracao de tags.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getPendingTags() {
        log.start('Buscando tags criadas por usuarios');

        try {
            const tags = await allQuery(`
                SELECT
                    t.*,
                    u.name as created_by_name
                FROM forum_tags t
                LEFT JOIN users u ON t.created_by_user = u.id
                WHERE t.created_by_user IS NOT NULL
                ORDER BY t.approved ASC, t.created_at DESC
            `);

            log.success('Tags criadas por usuarios encontradas', { count: tags.length });
            return tags;
        } catch (error) {
            log.error('Erro ao buscar tags criadas por usuarios', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: cria uma nova tag pendente de aprovacao, rejeitando duplicatas.
     * Onde e usada: fluxo de criacao de tag por usuario/admin.
     * Dependencias chamadas: getQuery, executeQuery.
     * Efeitos colaterais: insere linha em forum_tags.
     */
    async createTag({ nome, topico, descricao, userId }) {
        log.start('Criando nova tag', { nome });

        try {
            const normalizedName = nome.toLowerCase().trim();

            // Verificar se já existe
            const existing = await getQuery('SELECT * FROM forum_tags WHERE nome = ?', [normalizedName]);
            if (existing) {
                throw new Error('Tag já existe');
            }

            const { lastID: tagId } = await executeQuery(
                'INSERT INTO forum_tags (nome, topico, descricao, created_by_user, approved, created_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)',
                [normalizedName, topico, descricao, userId]
            );

            log.success('Tag criada', { tagId });
            return tagId;
        } catch (error) {
            log.error('Erro ao criar tag', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: aprova uma tag (marca approved = 1).
     * Onde e usada: painel de administracao de tags.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza forum_tags.
     */
    async approveTag(tagId) {
        log.start('Aprovando tag', { tagId });

        try {
            await executeQuery('UPDATE forum_tags SET approved = 1 WHERE id = ?', [tagId]);
            log.success('Tag aprovada', { tagId });
            return true;
        } catch (error) {
            log.error('Erro ao aprovar tag', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: deleta uma tag e suas associacoes com perguntas.
     * Onde e usada: painel de administracao de tags.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: deleta linhas em forum_question_tags e forum_tags.
     */
    async deleteTag(tagId) {
        log.start('Deletando tag', { tagId });

        try {
            // Primeiro remover das associações com perguntas
            await executeQuery('DELETE FROM forum_question_tags WHERE tag_id = ?', [tagId]);

            // Depois deletar a tag
            await executeQuery('DELETE FROM forum_tags WHERE id = ?', [tagId]);

            log.success('Tag deletada', { tagId });
            return true;
        } catch (error) {
            log.error('Erro ao deletar tag', { err: error.message });
            throw error;
        }
    }
};
