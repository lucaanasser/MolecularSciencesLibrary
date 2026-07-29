/**
 * Responsabilidade: enriquecer entradas de PDF avancado e disciplinas com dados do catalogo academico.
 * Camada: service.
 * Entradas/Saidas: recebe entradas/disciplinas; retorna as mesmas estruturas com o campo catalog anexado.
 * Dependencias criticas: AcademicDisciplinesService e logger padronizado.
 */

const academicDisciplinesService = require('../../disciplines/AcademicDisciplinesService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: enriquece cada entrada de PDF avancado com dados de catalogo das disciplinas.
     * Onde e usada: prepareSandboxPublishPayload e prepareAdvancedPdfPayload.
     * Dependencias chamadas: enrichDisciplinesWithCatalogData.
     * Efeitos colaterais: leitura no catalogo (cache local por chamada).
     * @param {Array} entries
     * @returns {Promise<Array>}
     */
    async enrichAdvancedPdfEntries(entries = []) {
        if (!entries.length) {
            return entries;
        }

        const cache = new Map();
        const enriched = await Promise.all(entries.map(async (entry) => {
            const disciplines = await this.enrichDisciplinesWithCatalogData(entry.disciplines || [], cache);
            return {
                ...entry,
                disciplines
            };
        }));

        return enriched;
    },

    /**
     * O que faz: anexa dados do catalogo (por codigo) a cada disciplina informada.
     * Onde e usada: enrichAdvancedPdfEntries.
     * Dependencias chamadas: academicDisciplinesService.getDisciplineByCodigo.
     * Efeitos colaterais: leitura no catalogo; usa cache para evitar buscas repetidas.
     * @param {Array} disciplines
     * @param {Map} cache
     * @returns {Promise<Array>}
     */
    async enrichDisciplinesWithCatalogData(disciplines = [], cache = new Map()) {
        if (!disciplines.length) {
            return disciplines;
        }

        const uniqueCodes = [...new Set(
            disciplines
                .map((disc) => String(disc?.codigo || '').trim())
                .filter(Boolean)
        )];

        await Promise.all(uniqueCodes.map(async (codigo) => {
            if (cache.has(codigo)) {
                return;
            }

            try {
                const catalog = await academicDisciplinesService.getDisciplineByCodigo(codigo);
                cache.set(codigo, catalog || null);
            } catch (error) {
                log.warn('Falha ao buscar disciplina no catalogo', { codigo, err: error?.message });
                cache.set(codigo, null);
            }
        }));

        return disciplines.map((disc) => {
            const codigo = String(disc?.codigo || '').trim();
            const catalog = codigo ? cache.get(codigo) : null;
            return {
                ...disc,
                catalog
            };
        });
    }
};
