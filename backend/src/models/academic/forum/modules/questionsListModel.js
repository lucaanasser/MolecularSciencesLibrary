/**
 * Responsabilidade: listagem e contagem de perguntas do forum com filtros, ordenacao e paginacao.
 * Camada: model.
 * Entradas/Saidas: filtros (tag, busca, disciplina, autor, ordenacao, pagina); retorna linhas/total de forum_questions.
 * Dependencias criticas: db (getQuery/allQuery), logger e modulos irmaos via prototype (this.<sibling>).
 */

const { getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista perguntas aplicando filtros de tag/busca/disciplina/autor, ordenacao e paginacao; anexa tags e nome da disciplina.
     * Onde e usada: ForumController ao listar perguntas.
     * Dependencias chamadas: allQuery, getQuery, this.getQuestionTags.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getQuestions({
        sortBy = 'recente',
        search = '',
        tagId = null,
        tagName = null,
        disciplina = null,
        autorId = null,
        page = 1,
        limit = 20
    } = {}) {
        log.start('Buscando perguntas', { sortBy, search, tagId, tagName, disciplina, autorId, page, limit });

        try {
            let query = `
                SELECT
                    q.*,
                    u.name as autor_nome,
                    u.profile_image as autor_imagem,
                    q.is_anonymous,
                    (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
                    (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
                FROM forum_questions q
                JOIN users u ON q.autor_id = u.id
            `;

            const params = [];
            const conditions = [];

            // Filtro por tag (por ID ou nome)
            if (tagId) {
                query = `
                    SELECT
                        q.*,
                        u.name as autor_nome,
                        u.profile_image as autor_imagem,
                        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
                        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
                    FROM forum_questions q
                    JOIN users u ON q.autor_id = u.id
                    JOIN forum_question_tags qt ON q.id = qt.question_id
                    WHERE qt.tag_id = ?
                `;
                params.push(tagId);
            } else if (tagName) {
                query = `
                    SELECT
                        q.*,
                        u.name as autor_nome,
                        u.profile_image as autor_imagem,
                        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
                        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
                    FROM forum_questions q
                    JOIN users u ON q.autor_id = u.id
                    JOIN forum_question_tags qt ON q.id = qt.question_id
                    JOIN forum_tags t ON qt.tag_id = t.id
                    WHERE t.nome = ?
                `;
                params.push(tagName);
            }

            // Filtro de busca textual
            if (search && search.trim()) {
                const searchCondition = tagId || tagName ? 'AND' : 'WHERE';
                query += ` ${searchCondition} (q.titulo LIKE ? OR q.conteudo LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }

            // Filtro por disciplina
            if (disciplina) {
                const discCondition = (tagId || tagName || search) ? 'AND' : 'WHERE';
                query += ` ${discCondition} q.disciplina_codigo = ?`;
                params.push(disciplina);
            }

            // Filtro por autor
            if (autorId) {
                const autorCondition = (tagId || tagName || search || disciplina) ? 'AND' : 'WHERE';
                query += ` ${autorCondition} q.autor_id = ?`;
                params.push(autorId);
            }

            // Filtro sem resposta
            if (sortBy === 'sem-resposta') {
                const noAnswerCondition = (tagId || tagName || search || disciplina || autorId) ? 'AND' : 'WHERE';
                query += ` ${noAnswerCondition} (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) = 0`;
            }

            // Ordenação (perguntas fixadas sempre no topo)
            switch (sortBy) {
                case 'votos':
                    query += ' ORDER BY q.is_pinned DESC, q.votos DESC, q.created_at DESC';
                    break;
                case 'atividade':
                    query += ' ORDER BY q.is_pinned DESC, q.updated_at DESC, q.created_at DESC';
                    break;
                case 'views':
                    query += ' ORDER BY q.is_pinned DESC, q.views DESC, q.created_at DESC';
                    break;
                case 'sem-resposta':
                case 'recente':
                default:
                    query += ' ORDER BY q.is_pinned DESC, q.created_at DESC';
                    break;
            }

            // Paginação
            const offset = (page - 1) * limit;
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const questions = await allQuery(query, params);

            // Buscar tags (e nome da disciplina, se houver) para cada pergunta
            for (const question of questions) {
                question.tags = await this.getQuestionTags(question.id);
                if (question.disciplina_codigo) {
                    const disc = await getQuery(
                        'SELECT nome FROM disciplines WHERE codigo = ?',
                        [question.disciplina_codigo]
                    );
                    question.disciplina_nome = disc ? disc.nome : null;
                }
            }

            log.success('Perguntas encontradas', { count: questions.length });
            return questions;
        } catch (error) {
            log.error('Erro ao buscar perguntas', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: conta o total de perguntas que atendem aos filtros (para paginacao).
     * Onde e usada: ForumController ao montar a paginacao da listagem.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async countQuestions({ search = '', tagId = null, tagName = null, disciplina = null, autorId = null, sortBy = 'recente' } = {}) {
        log.start('Contando perguntas');

        try {
            let query = 'SELECT COUNT(*) as total FROM forum_questions q';
            const params = [];

            if (tagId) {
                query += ' JOIN forum_question_tags qt ON q.id = qt.question_id WHERE qt.tag_id = ?';
                params.push(tagId);
            } else if (tagName) {
                query += ' JOIN forum_question_tags qt ON q.id = qt.question_id JOIN forum_tags t ON qt.tag_id = t.id WHERE t.nome = ?';
                params.push(tagName);
            }

            if (search && search.trim()) {
                const searchCondition = tagId || tagName ? 'AND' : 'WHERE';
                query += ` ${searchCondition} (q.titulo LIKE ? OR q.conteudo LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }

            if (disciplina) {
                const discCondition = (tagId || tagName || search) ? 'AND' : 'WHERE';
                query += ` ${discCondition} q.disciplina_codigo = ?`;
                params.push(disciplina);
            }

            if (autorId) {
                const autorCondition = (tagId || tagName || search || disciplina) ? 'AND' : 'WHERE';
                query += ` ${autorCondition} q.autor_id = ?`;
                params.push(autorId);
            }

            if (sortBy === 'sem-resposta') {
                const noAnswerCondition = (tagId || tagName || search || disciplina || autorId) ? 'AND' : 'WHERE';
                query += ` ${noAnswerCondition} (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) = 0`;
            }

            const result = await getQuery(query, params);
            log.success('Total de perguntas', { total: result.total });
            return result.total;
        } catch (error) {
            log.error('Erro ao contar perguntas', { err: error.message });
            throw error;
        }
    }
};
