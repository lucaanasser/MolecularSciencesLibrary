/**
 * Responsabilidade: preparacao de payloads para exportacao ao schema CM, sandbox e PDFs de ciclo avancado.
 * Camada: service.
 * Entradas/Saidas: recebe userId/opcoes; retorna payloads prontos para publicacao/geracao de PDF.
 * Dependencias criticas: ProfileTransformer (instancia e static generateSlug) e logger padronizado.
 */

const { ProfileTransformer } = require('../../profileTransformer/ProfileTransformer');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: prepara payload de perfil no schema esperado pelo site publico.
     * Camada: Service.
     * Entradas/Saidas: userId -> cmSchemaPayload.
     * Dependencias criticas: getCompleteProfile e ProfileTransformer.
     * Efeitos colaterais: nenhum.
     * @param {Number} userId ID do usuario
     * @returns {Promise<Object>} payload pronto para publicacao
     */
    async exportProfileToCMSchema(userId, selectedRosterName, includePhoto = true) {
        log.start('Exportando perfil para schema CM', { user_id: userId });
        const completeProfile = await this.getCompleteProfile(userId);
        const payload = await this.profileTransformer.toCMSchema(completeProfile, { selectedRosterName, includePhoto });
        log.success('Payload pronto para publicacao', { user_id: userId });
        return payload;
    },

    /**
     * O que faz: prepara payload do sandbox com PDFs de avancado.
     * Camada: Service.
     * Entradas/Saidas: userId + parametros -> { cmPayload, advancedPdfEntries }.
     * Dependencias criticas: ProfileTransformer.
     * Efeitos colaterais: nenhum.
     * @param {Number} userId
     * @param {Object} options
     * @returns {Promise<{cmPayload: Object, advancedPdfEntries: Array}>}
     */
    async prepareSandboxPublishPayload(userId, options = {}) {
        log.start('Preparando payload sandbox', { user_id: userId });

        const { selectedRosterName, includePhoto = true, advancedPdfIds = [] } = options;
        const completeProfile = await this.getCompleteProfile(userId);
        const cmPayload = await this.profileTransformer.toCMSchema(completeProfile, { selectedRosterName, includePhoto });
        const advancedPdfEntries = this.buildAdvancedPdfEntries(completeProfile, cmPayload.nome, advancedPdfIds);
        const enrichedEntries = await this.enrichAdvancedPdfEntries(advancedPdfEntries);

        log.success('Payload preparado', { advanced_pdf_count: enrichedEntries.length });

        return { cmPayload, advancedPdfEntries: enrichedEntries };
    },

    /**
     * O que faz: prepara payload para gerar PDF de um ciclo avancado.
     * Camada: Service.
     * Entradas/Saidas: userId + cicloId + roster -> { cmPayload, entry }.
     * Dependencias criticas: ProfileTransformer.
     * Efeitos colaterais: nenhum.
     * @param {Number} userId
     * @param {String|Number} cycleId
     * @param {String} selectedRosterName
     * @returns {Promise<{cmPayload: Object, entry: Object}>}
     */
    async prepareAdvancedPdfPayload(userId, cycleId, selectedRosterName) {
        log.start('Preparando PDF avancado', { user_id: userId });

        const completeProfile = await this.getCompleteProfile(userId);
        const cmPayload = await this.profileTransformer.toCMSchema(completeProfile, {
            selectedRosterName,
            includePhoto: false
        });

        const entries = this.buildAdvancedPdfEntries(completeProfile, cmPayload.nome, [cycleId]);

        if (!entries.length) {
            throw new Error('Ciclo avancado nao encontrado para gerar PDF.');
        }

        const enrichedEntries = await this.enrichAdvancedPdfEntries(entries);
        return { cmPayload, entry: enrichedEntries[0] };
    },

    /**
     * O que faz: monta lista de PDFs por ciclo avancado solicitado.
     * Camada: Service.
     * Entradas/Saidas: perfil completo + nome roster + ids -> lista de entradas.
     * Dependencias criticas: ProfileTransformer.generateSlug.
     * Efeitos colaterais: nenhum.
     * @param {Object} completeProfile
     * @param {string} rosterName
     * @param {Array} advancedPdfIds
     * @returns {Array}
     */
    buildAdvancedPdfEntries(completeProfile, rosterName, advancedPdfIds = []) {
        const cycles = Array.isArray(completeProfile?.advanced_cycles) ? completeProfile.advanced_cycles : [];
        const disciplines = Array.isArray(completeProfile?.disciplines) ? completeProfile.disciplines : [];
        const experiences = Array.isArray(completeProfile?.international_experiences)
            ? completeProfile.international_experiences
            : [];

        const requestedIds = new Set((advancedPdfIds || []).map((id) => String(id)));
        if (!requestedIds.size || !cycles.length) {
            return [];
        }

        const slug = ProfileTransformer.generateSlug(rosterName);

        return cycles.reduce((acc, cycle, index) => {
            if (!requestedIds.has(String(cycle.id))) {
                return acc;
            }

            const cycleDisciplines = disciplines.filter((disc) => String(disc.avancadoId) === String(cycle.id));
            const cycleExperiences = experiences.filter((exp) => String(exp.avancadoId) === String(cycle.id));

            acc.push({
                index,
                fileName: `${slug}-${index}.pdf`,
                cycle,
                disciplines: cycleDisciplines,
                experiences: cycleExperiences
            });

            return acc;
        }, []);
    },

    /**
     * O que faz: retorna nomes oficiais da roster da turma do usuario para selecao no frontend.
     * Onde e usada: handler de opcoes de sandbox.
     * Dependencias chamadas: getCompleteProfile, profileTransformer.resolveClassYear/loadRosterByClassYear e findProbableRosterNames.
     * Efeitos colaterais: leitura de arquivos de roster.
     * @param {Number} userId ID do usuario
     * @returns {Promise<{turma: string, students: string[]}>}
     */
    async getSandboxRosterOptions(userId) {
        const completeProfile = await this.getCompleteProfile(userId);
        const turma = this.profileTransformer.resolveClassYear(completeProfile.turma);
        const rosterStudents = await this.profileTransformer.loadRosterByClassYear(turma);
        const probableStudents = this.findProbableRosterNames(completeProfile.nome, rosterStudents);
        const students = probableStudents.length ? probableStudents : rosterStudents;

        return {
            turma,
            students
        };
    }
};
