/**
 * O que faz: constroi os blocos do schema CM (conteudo, avancado, extracurricular, contato) a partir do perfil interno.
 * Camada: Service (submodulo de ProfileTransformer).
 * Entradas/Saidas: perfil interno (Object) -> arrays/objetos do payload publico.
 * Dependencias criticas: nenhuma externa; normalizacao local via safeString.
 * Efeitos colaterais: nenhum.
 */

/**
 * Normaliza um valor para string aparada; null/undefined viram string vazia.
 * @param {*} value
 * @returns {string}
 */
function safeString(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

/**
 * Monta os blocos de conteudo (bio + lista de disciplinas) do perfil.
 * @param {Object} profile
 * @returns {string[]}
 */
function buildConteudo(profile) {
    const blocks = [];
    const bio = safeString(profile.bio);
    if (bio) blocks.push(bio);

    const disciplinas = Array.isArray(profile.disciplines) ? profile.disciplines : [];
    const nomes = disciplinas
        .map((disc) => safeString(disc.nome || disc.name || disc.codigo))
        .filter(Boolean)
        .slice(0, 12);

    if (nomes.length) {
        blocks.push(`Disciplinas: ${nomes.join(', ')}`);
    }

    return blocks;
}

/**
 * Extrai os temas/descricoes dos ciclos avancados do perfil.
 * @param {Object} profile
 * @returns {string[]}
 */
function buildAvancado(profile) {
    const cycles = Array.isArray(profile.advanced_cycles) ? profile.advanced_cycles : [];
    return cycles
        .map((cycle) => safeString(cycle.tema || cycle.descricao))
        .filter(Boolean)
        .slice(0, 8);
}

/**
 * Monta a lista de experiencias internacionais (local - resumo) do perfil.
 * @param {Object} profile
 * @returns {string[]}
 */
function buildExtracurricular(profile) {
    const experiences = Array.isArray(profile.international_experiences)
        ? profile.international_experiences
        : [];

    return experiences
        .map((exp) => {
            const local = safeString(exp.universidade || exp.instituicao || exp.pais);
            const resumo = safeString(exp.descricao || exp.tipo);
            return [local, resumo].filter(Boolean).join(' - ');
        })
        .filter(Boolean)
        .slice(0, 8);
}

/**
 * Monta o objeto de contato apenas com os campos preenchidos.
 * @param {Object} profile
 * @returns {Object}
 */
function buildContact(profile) {
    const fields = [
        ['email', profile.email_publico],
        ['linkedin', profile.linkedin],
        ['lattes', profile.lattes],
        ['github', profile.github],
        ['site', profile.site]
    ];

    return fields.reduce((acc, [key, value]) => {
        const parsed = safeString(value);
        if (parsed) acc[key] = parsed;
        return acc;
    }, {});
}

module.exports = {
    safeString,
    buildConteudo,
    buildAvancado,
    buildExtracurricular,
    buildContact
};
