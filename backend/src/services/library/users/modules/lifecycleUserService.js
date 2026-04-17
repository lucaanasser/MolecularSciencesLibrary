/**
 * Responsabilidade: casos de uso de ciclo de vida de usuarios.
 * Camada: service.
 * Entradas/Saidas: cria, registra, aprova, rejeita e remove usuarios.
 * Dependencias criticas: UsersModel, PublicProfilesModel, EmailService e logger.
 */

const UsersModel = require('../../../../models/library/users/UsersModel');
const PublicProfilesModel = require('../../../../models/academic/publicProfiles/PublicProfilesModel');
const EmailService = require('../../../utilities/EmailService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria usuario administrativo com status ativo e envia boas-vindas.
     * Onde e usada: UsersController.createUser e importacao sem hash.
     * Dependencias chamadas: UsersModel, PublicProfilesModel, EmailService.
     * Efeitos colaterais: persiste user, cria perfil publico e envia email.
     */
    async createUser({ name, email, NUSP, phone, class: userClass }) {
        const existing = await UsersModel.getUserByEmail(email);
        if (existing) throw new Error('Usuário já existe com este email');

        const userId = await UsersModel.createUser({ name, email, NUSP, phone, class: userClass });

        try {
            await PublicProfilesModel.createProfile(userId);
        } catch (error) {
            log.error('Falha ao criar perfil publico apos criacao de usuario', { user_id: userId, err: error.message });
        }

        EmailService.sendWelcomeEmail({ user_id: userId, sendResetLink: true }).catch((error) => {
            log.error('Falha ao enviar email de boas-vindas', { user_id: userId, err: error.message });
        });

        const created = await UsersModel.getUserById(userId);
        const { password_hash: _ignored, ...userData } = created || {};
        return userData;
    },

    /**
     * O que faz: cria usuario pendente via auto-cadastro e notifica admins.
     * Onde e usada: UsersController.registerUser.
     * Dependencias chamadas: UsersModel e EmailService.
     * Efeitos colaterais: persiste user pending e envia notificacao.
     */
    async registerUser({ name, email, NUSP, phone, class: userClass }) {
        if (await UsersModel.getUserByEmail(email)) throw new Error('Este email já está cadastrado no sistema.');
        if (await UsersModel.getUserByNUSP(NUSP)) throw new Error('Este NUSP já está cadastrado no sistema.');
        if (await UsersModel.getUserByPhone(phone)) throw new Error('Este telefone já está cadastrado no sistema.');

        const userId = await UsersModel.createPendingUser({ name, email, NUSP, phone, class: userClass });
        const created = await UsersModel.getUserById(userId);

        EmailService.sendRegistrationRequestNotification({ user: created }).catch((error) => {
            log.error('Falha ao notificar admins sobre cadastro pendente', { user_id: userId, err: error.message });
        });

        const { password_hash: _ignored, ...userData } = created || {};
        return userData;
    },

    /**
     * O que faz: lista usuarios pendentes.
     * Onde e usada: UsersController.getPendingUsers.
     * Dependencias chamadas: UsersModel.getPendingUsers.
     * Efeitos colaterais: nenhum.
     */
    async getPendingUsers() {
        return UsersModel.getPendingUsers();
    },

    /**
     * O que faz: aprova usuario pendente, cria perfil e envia onboarding.
     * Onde e usada: UsersController.approveUser.
     * Dependencias chamadas: UsersModel, PublicProfilesModel, EmailService.
     * Efeitos colaterais: altera status e dispara efeitos externos.
     */
    async approveUser(id) {
        const user = await UsersModel.getUserById(id);
        if (!user) throw new Error('Usuário não encontrado.');
        if (user.status !== 'pending') throw new Error('Usuário não está com cadastro pendente.');

        await UsersModel.approveUser(id);

        try {
            await PublicProfilesModel.createProfile(id);
        } catch (error) {
            log.error('Falha ao criar perfil publico apos aprovacao', { user_id: id, err: error.message });
        }

        EmailService.sendWelcomeEmail({ user_id: id }).catch((error) => {
            log.error('Falha ao enviar email de boas-vindas apos aprovacao', { user_id: id, err: error.message });
        });

        return true;
    },

    /**
     * O que faz: rejeita usuario pendente removendo cadastro.
     * Onde e usada: UsersController.rejectUser.
     * Dependencias chamadas: UsersModel.getUserById e deleteUserById.
     * Efeitos colaterais: remove registro do banco.
     */
    async rejectUser(id) {
        const user = await UsersModel.getUserById(id);
        if (!user) throw new Error('Usuário não encontrado.');
        if (user.status !== 'pending') throw new Error('Usuário não está com cadastro pendente.');
        await UsersModel.deleteUserById(id);
        return true;
    },

    /**
     * O que faz: remove usuario por id.
     * Onde e usada: UsersController.deleteUserById.
     * Dependencias chamadas: UsersModel.deleteUserById.
     * Efeitos colaterais: deleta registro no banco.
     */
    async deleteUserById(id) {
        return UsersModel.deleteUserById(id);
    }
};
