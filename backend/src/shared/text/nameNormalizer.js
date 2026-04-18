/**
 * Normaliza nome para comparacoes robustas, ignorando acentos,
 * pontuacao e variacoes de espaco/letras maiusculas.
 * @param {string} name
 * @returns {string}
 */
const normalizeNameForComparison = (name) => {
    return String(name || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '');
};

module.exports = {
    normalizeNameForComparison
};
