/**
 * Responsabilidade: tags do forum - associacao com perguntas e consultas de listagem/topicos.
 * Camada: model.
 * Entradas/Saidas: nomes/ids de tags e perguntas; retorna tags, contagens e lista de topicos.
 * Dependencias criticas: db (executeQuery/getQuery/allQuery), logger e modulos irmaos via prototype (this.<sibling>).
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: retorna a tag existente pelo nome normalizado ou a cria (pendente de aprovacao quando vem de usuario).
     * Onde e usada: this.addTagsToQuestion e fluxos de tag.
     * Dependencias chamadas: getQuery, executeQuery.
     * Efeitos colaterais: pode inserir linha em forum_tags.
     */
    async getOrCreateTag(nome, topico = 'geral', descricao = null, userId = null) {
        log.start('Buscando/criando tag', { nome });

        try {
            // Normalizar nome da tag
            const normalizedName = nome.toLowerCase().trim();

            let tag = await getQuery('SELECT * FROM forum_tags WHERE nome = ?', [normalizedName]);

            if (!tag) {
                const { lastID: tagId } = await executeQuery(
                    'INSERT INTO forum_tags (nome, topico, descricao, created_by_user, approved, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
                    [normalizedName, topico, descricao, userId, userId ? 0 : 1] // Se criado por usuário, precisa aprovação
                );
                tag = { id: tagId, nome: normalizedName, topico, descricao, created_by_user: userId, approved: userId ? 0 : 1 };
                log.success('Tag criada', { nome: normalizedName });
            } else {
                log.success('Tag encontrada', { nome: normalizedName });
            }

            return tag;
        } catch (error) {
            log.error('Erro ao buscar/criar tag', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: associa uma lista de tags (por nome) a uma pergunta, criando-as se necessario.
     * Onde e usada: this.createQuestion e this.updateQuestion.
     * Dependencias chamadas: this.getOrCreateTag, executeQuery.
     * Efeitos colaterais: insere associacoes em forum_question_tags.
     */
    async addTagsToQuestion(questionId, tagNames) {
        log.start('Adicionando tags a pergunta', { questionId, tagNames });

        try {
            for (const tagName of tagNames) {
                const tag = await this.getOrCreateTag(tagName);
                await executeQuery(
                    'INSERT OR IGNORE INTO forum_question_tags (question_id, tag_id) VALUES (?, ?)',
                    [questionId, tag.id]
                );
            }
            log.success('Tags adicionadas', { questionId });
        } catch (error) {
            log.error('Erro ao adicionar tags', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: remove todas as associacoes de tags de uma pergunta.
     * Onde e usada: this.updateQuestion antes de reassociar tags.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: deleta linhas em forum_question_tags.
     */
    async removeAllTagsFromQuestion(questionId) {
        log.start('Removendo tags da pergunta', { questionId });

        try {
            await executeQuery('DELETE FROM forum_question_tags WHERE question_id = ?', [questionId]);
            log.success('Tags removidas', { questionId });
        } catch (error) {
            log.error('Erro ao remover tags', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: retorna os nomes das tags de uma pergunta.
     * Onde e usada: this.getQuestionById, this.getQuestions, this.getBookmarkedQuestions.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; em caso de erro retorna lista vazia.
     */
    async getQuestionTags(questionId) {
        try {
            const tags = await allQuery(`
                SELECT t.* FROM forum_tags t
                JOIN forum_question_tags qt ON t.id = qt.tag_id
                WHERE qt.question_id = ?
            `, [questionId]);
            return tags.map(t => t.nome);
        } catch (error) {
            log.error('Erro ao buscar tags da pergunta', { err: error.message });
            return [];
        }
    },

    /**
     * O que faz: lista as tags mais usadas com sua contagem de perguntas.
     * Onde e usada: sidebar/estatisticas do forum.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getPopularTags(limit = 10) {
        log.start('Buscando tags populares');

        try {
            const tags = await allQuery(`
                SELECT
                    t.id,
                    t.nome,
                    t.descricao,
                    COUNT(qt.question_id) as count
                FROM forum_tags t
                LEFT JOIN forum_question_tags qt ON t.id = qt.tag_id
                GROUP BY t.id
                ORDER BY count DESC
                LIMIT ?
            `, [limit]);

            log.success('Tags populares encontradas', { count: tags.length });
            return tags;
        } catch (error) {
            log.error('Erro ao buscar tags populares', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: lista todas as tags com topico, aprovacao, criador e contagem de uso.
     * Onde e usada: telas de selecao e administracao de tags.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getAllTags() {
        log.start('Buscando todas as tags');

        try {
            const tags = await allQuery(`
                SELECT
                    t.id,
                    t.nome,
                    t.topico,
                    t.descricao,
                    t.approved,
                    t.created_by_user,
                    COUNT(qt.question_id) as count
                FROM forum_tags t
                LEFT JOIN forum_question_tags qt ON t.id = qt.tag_id
                GROUP BY t.id
                ORDER BY t.topico ASC, t.nome ASC
            `);

            log.success('Tags encontradas', { count: tags.length });
            return tags;
        } catch (error) {
            log.error('Erro ao buscar todas as tags', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: retorna a lista fixa de topicos disponiveis para tags.
     * Onde e usada: formularios de criacao de tag/pergunta.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum; valor constante.
     */
    getAvailableTopics() {
        return [
            'academico',
            'administrativo',
            'tecnico',
            'eventos',
            'carreira',
            'biblioteca',
            'geral'
        ];
    }
};
