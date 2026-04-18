const { getLogger } = require('../../shared/logging/logger');
const fs = require('fs');
const path = require('path');
const { normalizeNameForComparison } = require('../../shared/text/nameNormalizer');

const log = getLogger(__filename);

/**
 * O que faz: transforma perfil interno da Biblioteca para payload esperado no sandbox do site publico.
 * Camada: Service.
 * Entradas/Saidas: completeProfile -> cmProfile.
 * Dependencias criticas: nenhuma externa; regras locais de validacao e normalizacao.
 * Efeitos colaterais: nenhum.
 */
class ProfileTransformer {
    /**
     * Converte o perfil completo para o formato do CM website.
     * @param {Object} completeProfile perfil retornado por PublicProfilesService.getCompleteProfile
     * @returns {{nome: string, turma: string, conteudo: string[], hasPhoto: boolean, contact?: Object, avancado?: string[], extracurricular?: string[]}}
     */
    toCMSchema(completeProfile, options = {}) {
        log.start('Transformando perfil para schema CM');

        if (!completeProfile) {
            throw new MissingRequiredFieldError('perfil completo ausente');
        }

        const turma = this.#safeString(completeProfile.turma);
        const conteudo = this.#buildConteudo(completeProfile);
        const hasPhoto = Boolean(completeProfile.profileImage);
        const selectedRosterName = this.#safeString(options.selectedRosterName);

        if (!/^\d{4}$/.test(turma)) throw new MissingRequiredFieldError('turma (formato AAAA)');
        if (!conteudo.length) throw new MissingRequiredFieldError('conteudo (bio ou disciplinas)');
        if (!selectedRosterName) {
            throw new MissingRosterSelectionError('Selecione seu nome na lista oficial da turma para publicar.');
        }

        const roster = this.loadRosterByClassYear(turma);
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

        const contact = this.#buildContact(completeProfile);
        if (Object.keys(contact).length) payload.contact = contact;

        const avancado = this.#buildAvancado(completeProfile);
        if (avancado.length) payload.avancado = avancado;

        const extracurricular = this.#buildExtracurricular(completeProfile);
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
    loadRosterByClassYear(turma) {
        const rosterPath = this.getRosterFilePath(turma);

        if (!fs.existsSync(rosterPath)) {
            throw new MissingRosterValidationError(`Roster da turma ${turma} nao encontrada no sandbox.`);
        }

        let rosterJson;
        try {
            rosterJson = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
        } catch (error) {
            throw new MissingRosterValidationError(`Roster da turma ${turma} invalida: ${error.message}`);
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
            .map((entry) => this.#safeString(entry.nome || entry.name || entry))
            .filter(Boolean);

        if (!names.length) {
            throw new MissingRosterValidationError(`Roster da turma ${turma} sem estudantes validos.`);
        }

        return names;
    }

    /**
     * Resolve caminho do arquivo de roster no workspace.
     * @param {string} turma ano da turma (AAAA)
     * @returns {string}
     */
    getRosterFilePath(turma) {
        const sandboxRoot =
            process.env.GITHUB_SANDBOX_LOCAL_PATH ||
            path.resolve(__dirname, '../../../../ccm-website-public-sandbox');

        return path.join(sandboxRoot, 'estudantes', String(turma), `${turma}.json`);
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

    #buildConteudo(profile) {
        const blocks = [];
        const bio = this.#safeString(profile.bio);
        if (bio) blocks.push(bio);

        const disciplinas = Array.isArray(profile.disciplines) ? profile.disciplines : [];
        const nomes = disciplinas
            .map((disc) => this.#safeString(disc.nome || disc.name || disc.codigo))
            .filter(Boolean)
            .slice(0, 12);

        if (nomes.length) {
            blocks.push(`Disciplinas: ${nomes.join(', ')}`);
        }

        return blocks;
    }

    #buildAvancado(profile) {
        const cycles = Array.isArray(profile.advanced_cycles) ? profile.advanced_cycles : [];
        return cycles
            .map((cycle) => this.#safeString(cycle.tema || cycle.descricao))
            .filter(Boolean)
            .slice(0, 8);
    }

    #buildExtracurricular(profile) {
        const experiences = Array.isArray(profile.international_experiences)
            ? profile.international_experiences
            : [];

        return experiences
            .map((exp) => {
                const local = this.#safeString(exp.universidade || exp.instituicao || exp.pais);
                const resumo = this.#safeString(exp.descricao || exp.tipo);
                return [local, resumo].filter(Boolean).join(' - ');
            })
            .filter(Boolean)
            .slice(0, 8);
    }

    #buildContact(profile) {
        const fields = [
            ['email', profile.email_publico],
            ['linkedin', profile.linkedin],
            ['lattes', profile.lattes],
            ['github', profile.github],
            ['site', profile.site]
        ];

        return fields.reduce((acc, [key, value]) => {
            const parsed = this.#safeString(value);
            if (parsed) acc[key] = parsed;
            return acc;
        }, {});
    }

    #safeString(value) {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    }
}

class MissingRequiredFieldError extends Error {
    constructor(field) {
        super(`Campo obrigatorio ausente: ${field}`);
        this.name = 'MissingRequiredFieldError';
    }
}

class MissingRosterSelectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MissingRosterSelectionError';
    }
}

class MissingRosterValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MissingRosterValidationError';
    }
}

module.exports = {
    ProfileTransformer,
    MissingRequiredFieldError,
    MissingRosterSelectionError,
    MissingRosterValidationError
};