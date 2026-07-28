/**
 * Responsabilidade: helpers compartilhados do controller do Fórum (não são rotas HTTP).
 * Camada: controller.
 * Entradas/Saidas: utilidades sincronas/async consumidas pelos handlers via this.<helper>.
 * Dependencias criticas: db (allQuery) para lookup de admins.
 * Observacao: assinados no prototype do orquestrador (Object.assign) para que
 *             this.formatQuestionRow / this.isAdmin / this.getAdminUsers funcionem nos handlers.
 */

module.exports = {
    /**
     * O que faz: busca todos os usuários com role admin.
     * Onde é usada: createTag (notificação de nova tag para moderadores).
     * Dependencias chamadas: db.allQuery.
     */
    async getAdminUsers() {
        const { allQuery } = require('../../../../database/db');
        return await allQuery('SELECT * FROM users WHERE role = ?', ['admin']);
    },

    /**
     * O que faz: verifica se o usuário é admin.
     * Onde é usada: getPendingTags, approveTag, deleteTag, getReports, resolveReport.
     */
    isAdmin(user) {
        return user && user.role === 'admin';
    },

    /**
     * O que faz: formata uma linha de pergunta para listagens (fórum, salvos, meu conteúdo).
     * Onde é usada: getQuestions, getMyBookmarks.
     */
    formatQuestionRow(q, userVotes = {}, isAdmin = false) {
        return {
            id: q.id,
            title: q.titulo,
            content: q.conteudo,
            user_id: q.autor_id,
            user_name: q.is_anonymous && !isAdmin ? 'Anônimo' : q.autor_nome,
            user_image: q.is_anonymous && !isAdmin ? null : q.autor_imagem,
            is_anonymous: q.is_anonymous,
            view_count: q.views,
            answer_count: q.respostas_count,
            vote_count: q.votos,
            tags: q.tags,
            has_accepted_answer: q.tem_resposta_aceita === 1 || q.tem_resposta_aceita === true,
            is_closed: q.is_closed === 1,
            is_pinned: q.is_pinned === 1,
            disciplina_codigo: q.disciplina_codigo || null,
            disciplina_nome: q.disciplina_nome || null,
            created_at: q.created_at,
            user_vote: userVotes[q.id] || 0
        };
    }
};
