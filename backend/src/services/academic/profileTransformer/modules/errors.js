/**
 * O que faz: define os erros de dominio da transformacao de perfil (campo obrigatorio e validacao de roster).
 * Camada: Service (submodulo de ProfileTransformer).
 * Entradas/Saidas: mensagens/campos -> instancias de Error nomeadas.
 * Dependencias criticas: nenhuma.
 * Efeitos colaterais: nenhum.
 */

/** Erro lancado quando um campo obrigatorio esta ausente. */
class MissingRequiredFieldError extends Error {
    constructor(field) {
        super(`Campo obrigatorio ausente: ${field}`);
        this.name = 'MissingRequiredFieldError';
    }
}

/** Erro lancado quando o usuario nao selecionou seu nome na roster oficial da turma. */
class MissingRosterSelectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MissingRosterSelectionError';
    }
}

/** Erro lancado quando a busca/validacao da roster oficial falha. */
class MissingRosterValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MissingRosterValidationError';
    }
}

module.exports = {
    MissingRequiredFieldError,
    MissingRosterSelectionError,
    MissingRosterValidationError
};
