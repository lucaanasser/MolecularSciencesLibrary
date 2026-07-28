/**
 * Responsabilidade: validacoes e formatacao utilitaria do forum.
 * Camada: service.
 * Entradas/Saidas: recebe strings/arrays de entrada; retorna resultados de validacao/formatacao.
 * Dependencias criticas: nenhuma (funcoes puras, sem I/O).
 */

module.exports = {
    /**
     * O que faz: formata data relativa (há X horas, há X dias).
     * Onde e usada: apresentacao de datas de perguntas/respostas.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum.
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
    },

    /**
     * O que faz: valida conteudo de pergunta/resposta (min/max por tipo).
     * Onde e usada: validacao previa a criacao de perguntas/respostas.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum.
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
    },

    /**
     * O que faz: valida titulo de pergunta (min/max de caracteres).
     * Onde e usada: validacao previa a criacao de perguntas.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum.
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
    },

    /**
     * O que faz: valida e normaliza tags (max 5, comprimento e charset permitidos).
     * Onde e usada: validacao previa a criacao de perguntas.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum.
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
};
