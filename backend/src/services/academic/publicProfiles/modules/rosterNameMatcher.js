/**
 * Responsabilidade: matching aproximado entre o nome do usuario e os nomes da roster oficial da turma.
 * Camada: service.
 * Entradas/Saidas: recebe nome do usuario e lista da roster; retorna nomes provaveis e utilitarios de similaridade.
 * Dependencias criticas: normalizeNameForComparison do shared/text.
 */

const { normalizeNameForComparison } = require('../../../../shared/text/nameNormalizer');

module.exports = {
    /**
     * O que faz: retorna os nomes mais provaveis da roster para um nome de usuario.
     * Onde e usada: getSandboxRosterOptions.
     * Dependencias chamadas: normalizeNameForComparison, tokenizeName e calculateNameSimilarityScore.
     * Efeitos colaterais: nenhum.
     * @param {string} userName
     * @param {string[]} rosterStudents
     * @returns {string[]}
     */
    findProbableRosterNames(userName, rosterStudents) {
        const normalizedUser = normalizeNameForComparison(userName);
        if (!normalizedUser) {
            return [];
        }

        const maxCandidates = Number(process.env.ROSTER_PROBABLE_MAX_CANDIDATES || 8);
        const threshold = Number(process.env.ROSTER_PROBABLE_SCORE_THRESHOLD || 0.58);
        const userTokens = this.tokenizeName(normalizedUser);

        const scored = rosterStudents
            .map((studentName) => {
                const normalizedStudent = normalizeNameForComparison(studentName);
                const studentTokens = this.tokenizeName(normalizedStudent);
                const score = this.calculateNameSimilarityScore(
                    normalizedUser,
                    userTokens,
                    normalizedStudent,
                    studentTokens
                );

                return {
                    studentName,
                    score
                };
            })
            .filter((entry) => entry.score >= threshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, Math.max(1, maxCandidates));

        return scored.map((entry) => entry.studentName);
    },

    /**
     * O que faz: quebra um nome normalizado em tokens nao vazios.
     * Onde e usada: findProbableRosterNames e calculateNameSimilarityScore.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum.
     */
    tokenizeName(normalizedName) {
        return normalizedName
            .split(' ')
            .map((token) => token.trim())
            .filter(Boolean);
    },

    /**
     * O que faz: calcula um score de similaridade combinando overlap de tokens e Dice de bigramas.
     * Onde e usada: findProbableRosterNames.
     * Dependencias chamadas: computeTokenOverlap e computeDiceSimilarity.
     * Efeitos colaterais: nenhum.
     */
    calculateNameSimilarityScore(normalizedUser, userTokens, normalizedStudent, studentTokens) {
        if (!normalizedStudent) {
            return 0;
        }

        if (normalizedUser === normalizedStudent) {
            return 1;
        }

        const tokenOverlap = this.computeTokenOverlap(userTokens, studentTokens);
        const diceSimilarity = this.computeDiceSimilarity(normalizedUser, normalizedStudent);
        const firstTokenBonus = userTokens.length && studentTokens.length && userTokens[0] === studentTokens[0] ? 0.08 : 0;
        const lastTokenBonus = userTokens.length && studentTokens.length && userTokens[userTokens.length - 1] === studentTokens[studentTokens.length - 1]
            ? 0.08
            : 0;

        return tokenOverlap * 0.55 + diceSimilarity * 0.37 + firstTokenBonus + lastTokenBonus;
    },

    /**
     * O que faz: mede a fracao de tokens em comum entre dois conjuntos.
     * Onde e usada: calculateNameSimilarityScore.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum.
     */
    computeTokenOverlap(tokensA, tokensB) {
        if (!tokensA.length || !tokensB.length) {
            return 0;
        }

        const setA = new Set(tokensA);
        const setB = new Set(tokensB);
        let intersectionCount = 0;

        for (const token of setA) {
            if (setB.has(token)) {
                intersectionCount += 1;
            }
        }

        return intersectionCount / Math.max(setA.size, setB.size);
    },

    /**
     * O que faz: calcula o coeficiente de Dice entre bigramas de duas strings compactadas.
     * Onde e usada: calculateNameSimilarityScore.
     * Dependencias chamadas: toBigrams.
     * Efeitos colaterais: nenhum.
     */
    computeDiceSimilarity(valueA, valueB) {
        const compactA = String(valueA || '').replace(/\s+/g, '');
        const compactB = String(valueB || '').replace(/\s+/g, '');

        if (!compactA || !compactB) {
            return 0;
        }

        if (compactA === compactB) {
            return 1;
        }

        const bigramsA = this.toBigrams(compactA);
        const bigramsB = this.toBigrams(compactB);

        if (!bigramsA.length || !bigramsB.length) {
            return 0;
        }

        const counts = new Map();
        for (const gram of bigramsA) {
            counts.set(gram, (counts.get(gram) || 0) + 1);
        }

        let intersectionCount = 0;
        for (const gram of bigramsB) {
            const current = counts.get(gram) || 0;
            if (current > 0) {
                intersectionCount += 1;
                counts.set(gram, current - 1);
            }
        }

        return (2 * intersectionCount) / (bigramsA.length + bigramsB.length);
    },

    /**
     * O que faz: gera a lista de bigramas de uma string.
     * Onde e usada: computeDiceSimilarity.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum.
     */
    toBigrams(value) {
        if (value.length < 2) {
            return [value];
        }

        const bigrams = [];
        for (let i = 0; i < value.length - 1; i += 1) {
            bigrams.push(value.slice(i, i + 2));
        }
        return bigrams;
    }
};
