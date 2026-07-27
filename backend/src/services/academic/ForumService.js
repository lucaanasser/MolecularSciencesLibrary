const ForumModel = require('../../models/academic/ForumModel');
const NotificationsModel = require('../../models/utilities/NotificationsModel');
const { getQuery } = require('../../database/db');

/**
 * Service para lógica de negócio do Fórum
 * Integra com sistema de notificações e gerencia regras de negócio.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class ForumService {
    /**
     * Cria uma pergunta (delegado do Model com lógica adicional)
     */
    async createQuestion({ titulo, conteudo, autor_id, tags, is_anonymous = 0, disciplina_codigo = null }) {
        console.log("🔵 [ForumService] Criando pergunta");

        try {
            const questionId = await ForumModel.createQuestion({
                titulo,
                conteudo,
                autor_id,
                tags,
                is_anonymous,
                disciplina_codigo
            });

            // Autor passa a seguir a própria pergunta (recebe notificação de novas respostas)
            await ForumModel.subscribe(autor_id, questionId);

            console.log("🟢 [ForumService] Pergunta criada com sucesso:", questionId);
            return questionId;
        } catch (error) {
            console.error("🔴 [ForumService] Erro ao criar pergunta:", error.message);
            throw error;
        }
    }

    /**
     * Cria uma resposta e notifica o autor da pergunta
     */
    async createAnswer({ question_id, conteudo, autor_id, questionAutorId, is_anonymous = 0 }) {
        console.log("🔵 [ForumService] Criando resposta para pergunta:", question_id);
        
        try {
            const answerId = await ForumModel.createAnswer({
                question_id,
                conteudo,
                autor_id,
                is_anonymous
            });

            // Notifica os seguidores da pergunta (inclui o autor); quem respondeu passa a seguir
            await this.notifyNewAnswer(questionAutorId, question_id, autor_id);
            await ForumModel.subscribe(autor_id, question_id);

            console.log("🟢 [ForumService] Resposta criada com sucesso:", answerId);
            return answerId;
        } catch (error) {
            console.error("🔴 [ForumService] Erro ao criar resposta:", error.message);
            throw error;
        }
    }

    /**
     * Aceita/desaceita resposta e notifica o autor da resposta
     */
    async acceptAnswer(answerId, questionId, answerAutorId) {
        console.log("🔵 [ForumService] Aceitando resposta:", answerId);
        
        try {
            const isNowAccepted = await ForumModel.toggleAcceptAnswer(answerId, questionId);

            // Notificar autor da resposta que foi aceita
            if (isNowAccepted) {
                await this.notifyAnswerAccepted(answerAutorId, questionId, answerId);
            }

            console.log("🟢 [ForumService] Resposta", isNowAccepted ? "aceita" : "desaceita");
            return isNowAccepted;
        } catch (error) {
            console.error("🔴 [ForumService] Erro ao aceitar resposta:", error.message);
            throw error;
        }
    }

    // =====================================================
    // NOTIFICATIONS - Notificações
    // =====================================================

    /**
     * Notifica o autor da pergunta que recebeu uma nova resposta
     */
    async notifyNewAnswer(questionAutorId, questionId, answerAutorId) {
        console.log("🔵 [ForumService] Notificando nova resposta");
        
        try {
            // Buscar dados para a notificação
            const question = await ForumModel.getQuestionById(questionId);
            const answerAutor = await getQuery('SELECT name FROM users WHERE id = ?', [answerAutorId]);

            if (!question || !answerAutor) {
                console.log("🟡 [ForumService] Dados não encontrados para notificação");
                return;
            }

            const truncatedTitle = question.titulo.length > 50
                ? question.titulo.substring(0, 50) + '...'
                : question.titulo;

            // Destinatários: seguidores da pergunta + autor (compat. perguntas antigas), exceto quem respondeu
            const subscriberIds = await ForumModel.getSubscriberIds(questionId);
            const recipients = new Set([questionAutorId, ...subscriberIds]);
            recipients.delete(answerAutorId);

            for (const userId of recipients) {
                await NotificationsModel.createNotification({
                    user_id: userId,
                    type: 'forum_answer',
                    message: `${answerAutor.name} respondeu a pergunta: "${truncatedTitle}"`,
                    metadata: {
                        questionId,
                        answerAutorId,
                        answerAutorName: answerAutor.name
                    },
                    status: 'unread'
                });
            }

            console.log("🟢 [ForumService] Notificações de nova resposta criadas:", recipients.size);
        } catch (error) {
            // Não falhar a operação principal se notificação falhar
            console.error("🔴 [ForumService] Erro ao criar notificação de nova resposta:", error.message);
        }
    }

    /**
     * Notifica o autor da resposta que foi aceita
     */
    async notifyAnswerAccepted(answerAutorId, questionId, answerId) {
        console.log("🔵 [ForumService] Notificando resposta aceita");
        
        try {
            const question = await ForumModel.getQuestionById(questionId);

            if (!question) {
                console.log("🟡 [ForumService] Pergunta não encontrada para notificação");
                return;
            }

            const truncatedTitle = question.titulo.length > 50 
                ? question.titulo.substring(0, 50) + '...' 
                : question.titulo;

            await NotificationsModel.createNotification({
                user_id: answerAutorId,
                type: 'forum_accepted',
                message: `Sua resposta foi aceita em: "${truncatedTitle}"`,
                metadata: {
                    questionId,
                    answerId,
                    questionAutorId: question.autor_id
                },
                status: 'unread'
            });

            console.log("🟢 [ForumService] Notificação de resposta aceita criada");
        } catch (error) {
            // Não falhar a operação principal se notificação falhar
            console.error("🔴 [ForumService] Erro ao criar notificação de resposta aceita:", error.message);
        }
    }

    // =====================================================
    // UTILS - Utilitários
    // =====================================================

    /**
     * Formata data relativa (há X horas, há X dias)
     */
    formatRelativeDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffMinutes < 1) return 'agora';
        if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
        if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        if (diffWeeks < 4) return `há ${diffWeeks} semana${diffWeeks > 1 ? 's' : ''}`;
        return `há ${diffMonths} ${diffMonths > 1 ? 'meses' : 'mês'}`;
    }

    /**
     * Valida conteúdo de pergunta/resposta
     */
    validateContent(content, type = 'question') {
        const minLength = type === 'question' ? 20 : 10;
        const maxLength = 10000;

        if (!content || typeof content !== 'string') {
            return { valid: false, error: 'Conteúdo é obrigatório' };
        }

        const trimmed = content.trim();

        if (trimmed.length < minLength) {
            return { valid: false, error: `Conteúdo deve ter pelo menos ${minLength} caracteres` };
        }

        if (trimmed.length > maxLength) {
            return { valid: false, error: `Conteúdo deve ter no máximo ${maxLength} caracteres` };
        }

        return { valid: true };
    }

    /**
     * Valida título de pergunta
     */
    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            return { valid: false, error: 'Título é obrigatório' };
        }

        const trimmed = title.trim();

        if (trimmed.length < 10) {
            return { valid: false, error: 'Título deve ter pelo menos 10 caracteres' };
        }

        if (trimmed.length > 255) {
            return { valid: false, error: 'Título deve ter no máximo 255 caracteres' };
        }

        return { valid: true };
    }

    /**
     * Valida tags
     */
    validateTags(tags) {
        if (!tags || !Array.isArray(tags)) {
            return { valid: true, tags: [] };
        }

        // Limitar a 5 tags
        if (tags.length > 5) {
            return { valid: false, error: 'Máximo de 5 tags permitidas' };
        }

        // Validar cada tag
        const validatedTags = [];
        for (const tag of tags) {
            if (typeof tag !== 'string') continue;
            
            const trimmed = tag.trim().toLowerCase();
            if (trimmed.length < 2 || trimmed.length > 30) continue;
            if (!/^[a-záàâãéèêíïóôõöúüç0-9-]+$/.test(trimmed)) continue;
            
            validatedTags.push(trimmed);
        }

        return { valid: true, tags: validatedTags };
    }
}

module.exports = new ForumService();
