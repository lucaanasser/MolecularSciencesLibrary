/**
 * O que faz: transforma perfil interno da Biblioteca para o payload esperado no sandbox do site publico.
 * Camada: Service.
 * Entradas/Saidas: completeProfile -> cmProfile; delega construcao de blocos aos cmSchemaBuilders.
 * Dependencias criticas: axios (roster no GitHub), nameNormalizer, errors e cmSchemaBuilders locais.
 * Efeitos colaterais: requisicao HTTP GET para buscar a roster oficial da turma.
 */
const { getLogger } = require('../../../shared/logging/logger');
const axios = require('axios');
const { normalizeNameForComparison } = require('../../../shared/text/nameNormalizer');
const {
    MissingRequiredFieldError,
    MissingRosterSelectionError,
    MissingRosterValidationError
} = require('./modules/errors');
const {
    safeString,
    buildConteudo,
    buildAvancado,
    buildExtracurricular,
    buildContact
} = require('./modules/cmSchemaBuilders');

const log = getLogger(__filename);

/**
 * Transformador de perfil para o schema do CM website.
 */
class ProfileTransformer {
    /**
     * Converte o perfil completo para o formato do CM website.
     * @param {Object} completeProfile perfil retornado por PublicProfilesService.getCompleteProfile
     * @returns {{nome: string, turma: string, conteudo: string[], hasPhoto: boolean, contact?: Object, avancado?: string[], extracurricular?: string[]}}
     */
    async toCMSchema(completeProfile, options = {}) {
        log.start('Transformando perfil para schema CM');

        if (!completeProfile) {
            throw new MissingRequiredFieldError('perfil completo ausente');
        }

        const turma = this.resolveClassYear(completeProfile.turma);
        const conteudo = buildConteudo(completeProfile);
        const includePhoto = options.includePhoto !== false;
        const hasPhoto = includePhoto && Boolean(completeProfile.profileImage);
        const selectedRosterName = safeString(options.selectedRosterName);

        if (!selectedRosterName) {
            throw new MissingRosterSelectionError('Selecione seu nome na lista oficial da turma para publicar.');
        }

        const roster = await this.loadRosterByClassYear(turma);
        const rosterMatch = roster.find((studentName) =>
            normalizeNameForComparison(studentName) === normalizeNameForComparison(selectedRosterName)
        );

        if (!rosterMatch) {
            throw new MissingRosterValidationError(
                'Seu nome nao esta registrado como estudante desta turma. Verifique o nome completo com a coordenacao.'
            );
        }

        const nome = rosterMatch;

        const payload = {
            nome,
            turma,
            conteudo,
            hasPhoto
        };

        const contact = buildContact(completeProfile);
        if (Object.keys(contact).length) payload.contact = contact;

        const avancado = buildAvancado(completeProfile);
        if (avancado.length) payload.avancado = avancado;

        const extracurricular = buildExtracurricular(completeProfile);
        if (extracurricular.length) payload.extracurricular = extracurricular;

        log.success('Perfil transformado para schema CM', {
            turma,
            hasPhoto,
            conteudoCount: conteudo.length
        });

        return payload;
    }

    /**
     * Lista nomes da roster oficial da turma no sandbox publico.
     * @param {string} turma ano da turma (AAAA)
     * @returns {string[]}
     */
    async loadRosterByClassYear(turma) {
        const classYear = this.resolveClassYear(turma);
        const rosterUrl = this.getRosterUrl(classYear);
        const timeoutMs = Number(process.env.GITHUB_SANDBOX_ROSTER_TIMEOUT_MS || 10000);
        let response;

        try {
            response = await axios.get(rosterUrl, {
                timeout: timeoutMs,
                responseType: 'json',
                validateStatus: () => true
            });
        } catch (error) {
            throw new MissingRosterValidationError(
                `Falha ao buscar roster da turma ${classYear} no GitHub: ${error.message}`
            );
        }

        if (response.status === 404) {
            throw new MissingRosterValidationError(`Roster da turma ${classYear} nao encontrada no repositorio do GitHub.`);
        }

        if (response.status < 200 || response.status >= 300) {
            throw new MissingRosterValidationError(
                `Erro ao buscar roster da turma ${classYear} no GitHub (HTTP ${response.status}).`
            );
        }

        const rosterJson = response.data;

        if (typeof rosterJson !== 'object') {
            throw new MissingRosterValidationError(`Roster da turma ${classYear} invalida: formato JSON inesperado.`);
        }

        const rosterEntries = Array.isArray(rosterJson)
            ? rosterJson
            : Array.isArray(rosterJson.estudantes)
                ? rosterJson.estudantes
                : Array.isArray(rosterJson.students)
                    ? rosterJson.students
                    : Array.isArray(rosterJson.alunos)
                        ? rosterJson.alunos
                        : [];

        const names = rosterEntries
            .map((entry) => safeString(entry.nome || entry.name || entry))
            .filter(Boolean);

        if (!names.length) {
            throw new MissingRosterValidationError(`Roster da turma ${classYear} sem estudantes validos.`);
        }

        return names;
    }

    /**
     * Normaliza turma para ano AAAA. Aceita ano (ex: 2025) ou numero ordinal (ex: 35 -> 2025).
     * @param {string|number} turma
     * @returns {string}
     */
    resolveClassYear(turma) {
        const parsed = safeString(turma);

        if (/^\d{4}$/.test(parsed)) {
            return parsed;
        }

        if (/^\d{1,2}$/.test(parsed)) {
            const ordinal = Number(parsed);
            if (Number.isInteger(ordinal) && ordinal > 0) {
                const firstClassYear = Number(process.env.CM_FIRST_CLASS_YEAR || 1991);
                const year = firstClassYear + ordinal - 1;
                return String(year);
            }
        }

        throw new MissingRequiredFieldError('turma (formato AAAA ou numero da turma)');
    }

    /**
     * Resolve a URL do arquivo de roster no repositorio publico.
     * @param {string} turma ano da turma (AAAA)
     * @returns {string}
     */
    getRosterUrl(turma) {
        const owner = safeString(process.env.GITHUB_ROSTER_OWNER || process.env.GITHUB_SANDBOX_OWNER || 'ccm-usp');
        const branch = safeString(process.env.GITHUB_ROSTER_BRANCH || process.env.GITHUB_SANDBOX_BASE_BRANCH || 'main');
        return `https://raw.githubusercontent.com/${owner}/ccm-website-public/${branch}/estudantes/${String(turma)}/${String(turma)}.json`;
    }

    /**
     * Gera slug de arquivo a partir do nome.
     * @param {string} nome nome do aluno
     * @returns {string}
     */
    static generateSlug(nome) {
        return String(nome || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .replace(/-{2,}/g, '-');
    }

    /**
     * Gera path de destino no repo de dados publicos.
     * @param {string} nome nome do aluno
     * @param {string} turma ano da turma
     * @returns {string}
     */
    static generateFilePath(nome, turma) {
        return `estudantes/${turma}/${ProfileTransformer.generateSlug(nome)}.json`;
    }
}

module.exports = {
    ProfileTransformer,
    MissingRequiredFieldError,
    MissingRosterSelectionError,
    MissingRosterValidationError
};
