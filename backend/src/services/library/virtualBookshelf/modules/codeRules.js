/**
 * Responsabilidade: aplicar regras de parse, comparacao e ordenacao de codigos de livros.
 * Camada: service.
 * Entradas/Saidas: recebe codigos e listas, devolve comparacoes, ordenacoes e intervalos.
 * Dependencias criticas: constants e logger compartilhado.
 */

const { AREA_ORDER } = require('./constants');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: ordena livros pela regra da estante virtual.
     * Onde e usada: bookQueries.getAllBooksOrdered.
     * Dependencias chamadas: compareBookCodes.
     * Efeitos colaterais: reordena a lista recebida em memoria.
     */
    sortBooks(books) {
        return books.sort((a, b) => this.compareBookCodes(a.code, b.code));
    },

    /**
     * O que faz: compara dois codigos no formato de classificacao da estante.
     * Onde e usada: sortBooks e isCodeInRange.
     * Dependencias chamadas: parseBookCode.
     * Efeitos colaterais: nenhum.
     */
    compareBookCodes(codeA, codeB) {
        const parsedA = this.parseBookCode(codeA);
        const parsedB = this.parseBookCode(codeB);

        const areaIndexA = AREA_ORDER.indexOf(parsedA.area);
        const areaIndexB = AREA_ORDER.indexOf(parsedB.area);

        if (areaIndexA !== areaIndexB) {
            return areaIndexA - areaIndexB;
        }

        if (parsedA.subarea !== parsedB.subarea) {
            return parsedA.subarea - parsedB.subarea;
        }

        if (parsedA.sequential !== parsedB.sequential) {
            return parsedA.sequential - parsedB.sequential;
        }

        return parsedA.volume - parsedB.volume;
    },

    /**
     * O que faz: converte codigo textual para uma estrutura canonica de comparacao.
     * Onde e usada: compareBookCodes, formatComparableCode e getPreviousCode.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum.
     */
    parseBookCode(code) {
        try {
            if (!code) {
                return { area: '', subarea: 0, sequential: 0, volume: 0 };
            }

            const normalized = String(code).trim().replace(/\s+/g, ' ');
            const mainMatch = normalized.match(/^([A-Za-z]{3})-(\d{2})\.(\d{2})/);

            if (!mainMatch) {
                const parts = normalized.split('-v');
                const mainPart = parts[0] || normalized;
                const mainParts = mainPart.split('-');

                if (mainParts.length < 2) {
                    return { area: mainPart, subarea: 0, sequential: 0, volume: 0 };
                }

                const area = mainParts[0];
                const subareaSeq = mainParts[1];
                const subareaSeqParts = subareaSeq.split('.');
                const subarea = parseInt(subareaSeqParts[0], 10) || 0;
                const sequential = parseInt(subareaSeqParts[1], 10) || 0;
                const volFallback = normalized.match(/(?:^|[\s-])v\.?([0-9]+)\s*$/i);
                const volume = volFallback ? parseInt(volFallback[1], 10) || 0 : 0;

                return { area, subarea, sequential, volume };
            }

            const area = mainMatch[1].toUpperCase();
            const subarea = parseInt(mainMatch[2], 10) || 0;
            const sequential = parseInt(mainMatch[3], 10) || 0;
            const volMatch = normalized.match(/(?:^|[\s-])v\.?([0-9]+)\s*$/i);
            const volume = volMatch ? parseInt(volMatch[1], 10) || 0 : 0;

            return { area, subarea, sequential, volume };
        } catch (error) {
            log.warn('Falha ao parsear codigo de livro', { code, err: error.message });
            return { area: '', subarea: 0, sequential: 0, volume: 0 };
        }
    },

    /**
     * O que faz: calcula o codigo imediatamente anterior ao codigo informado.
     * Onde e usada: shelfConfig.calculateEndCodes.
     * Dependencias chamadas: parseBookCode.
     * Efeitos colaterais: nenhum.
     */
    getPreviousCode(code) {
        try {
            if (!code) return null;

            const parsed = this.parseBookCode(code);

            if (parsed.sequential > 1) {
                const previousSeq = (parsed.sequential - 1).toString().padStart(2, '0');
                const volumePart = parsed.volume > 0 ? ` v.${parsed.volume}` : '';
                return `${parsed.area}-${parsed.subarea.toString().padStart(2, '0')}.${previousSeq}${volumePart}`;
            }

            if (parsed.subarea > 1) {
                const previousSubarea = (parsed.subarea - 1).toString().padStart(2, '0');
                const volumePart = parsed.volume > 0 ? ` v.${parsed.volume}` : '';
                return `${parsed.area}-${previousSubarea}.99${volumePart}`;
            }

            const areaIndex = AREA_ORDER.indexOf(parsed.area);
            if (areaIndex > 0) {
                const previousArea = AREA_ORDER[areaIndex - 1];
                const volumePart = parsed.volume > 0 ? ` v.${parsed.volume}` : '';
                return `${previousArea}-99.99${volumePart}`;
            }

            return null;
        } catch (error) {
            log.warn('Falha ao calcular codigo anterior', { code, err: error.message });
            return null;
        }
    },

    /**
     * O que faz: normaliza codigo para formato comparavel fixo.
     * Onde e usada: bookQueries.validateBookCode.
     * Dependencias chamadas: parseBookCode.
     * Efeitos colaterais: nenhum.
     */
    formatComparableCode(code) {
        const { area, subarea, sequential, volume } = this.parseBookCode(code);

        if (!area) return '';

        const vol = volume > 0 ? `-v${volume}` : '';
        return `${area}-${subarea.toString().padStart(2, '0')}.${sequential.toString().padStart(2, '0')}${vol}`;
    },

    /**
     * O que faz: valida se codigo esta dentro de um intervalo definido por inicio e fim.
     * Onde e usada: bookQueries.getBooksForShelf.
     * Dependencias chamadas: compareBookCodes.
     * Efeitos colaterais: nenhum.
     */
    isCodeInRange(bookCode, startCode, endCode) {
        const compareWithStart = this.compareBookCodes(bookCode, startCode);
        const compareWithEnd = this.compareBookCodes(bookCode, endCode);

        return compareWithStart >= 0 && compareWithEnd <= 0;
    }
};
