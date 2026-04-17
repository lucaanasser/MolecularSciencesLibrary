/**
 * Responsabilidade: autenticacao, perfil e consultas de usuarios.
 * Camada: service.
 * Entradas/Saidas: autentica usuario e gerencia reset de senha.
 * Dependencias criticas: UsersModel, bcrypt, jwt, EmailService e logger.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsersModel = require('../../../../models/library/users/UsersModel');
const EmailService = require('../../../utilities/EmailService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);
const SALT_ROUNDS = 10;
const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

module.exports = {
    /**
     * O que faz: autentica por email ou NUSP e devolve token.
     * Onde e usada: UsersController.authenticateUser.
     * Dependencias chamadas: UsersModel, bcrypt e jwt.
     * Efeitos colaterais: nenhum; apenas gera token.
     */
    async authenticateUser(login, password) {
        const user = login && /^\d+$/.test(String(login))
            ? await UsersModel.getUserByNUSP(login)
            : await UsersModel.getUserByEmail(login);

        if (!user) throw new Error('Usuário não encontrado');
        if (user.status === 'pending') throw new Error('Seu cadastro ainda está aguardando aprovação do administrador.');

        const valid = user.password_hash && await bcrypt.compare(password, user.password_hash);
        if (!valid) throw new Error('Senha incorreta');

        const payload = { id: user.id, role: user.role, name: user.name, email: user.email, NUSP: user.NUSP };
        const token = jwt.sign(payload, SECRET, { expiresIn: user.role === 'proaluno' ? '365d' : '7d' });
        const { password_hash: _ignored, ...userData } = user;
        return { ...userData, token };
    },

    /**
     * O que faz: solicita redefinicao de senha por email/NUSP.
     * Onde e usada: UsersController.requestPasswordReset.
     * Dependencias chamadas: UsersModel, jwt e EmailService.
     * Efeitos colaterais: envia email de reset.
     */
    async requestPasswordReset(login) {
        const user = login && /^\d+$/.test(String(login))
            ? await UsersModel.getUserByNUSP(login)
            : await UsersModel.getUserByEmail(login);

        if (!user) throw new Error('Usuário não encontrado');

        const resetToken = jwt.sign({ id: user.id, email: user.email, type: 'reset' }, SECRET, { expiresIn: '1h' });
        await EmailService.sendPasswordResetEmail({ user_id: user.id, resetToken });
        return true;
    },

    /**
     * O que faz: redefine senha usando token assinado.
     * Onde e usada: UsersController.resetPassword.
     * Dependencias chamadas: jwt, bcrypt e UsersModel.
     * Efeitos colaterais: atualiza hash da senha no banco.
     */
    async resetPassword({ token, newPassword }) {
        let payload;
        try {
            payload = jwt.verify(token, SECRET);
        } catch (_error) {
            throw new Error('Token inválido ou expirado');
        }

        if (!payload || (payload.type !== 'reset' && payload.type !== 'first_access') || !payload.id) {
            throw new Error('Token inválido');
        }

        const user = await UsersModel.getUserById(payload.id);
        if (!user) throw new Error('Usuário não encontrado');

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await UsersModel.updateUserPassword(user.id, passwordHash);
        return true;
    },

    /**
     * O que faz: retorna usuario por id sem hash de senha.
     * Onde e usada: controllers de perfil e consulta por id.
     * Dependencias chamadas: UsersModel.getUserById.
     * Efeitos colaterais: nenhum.
     */
    async getUserById(id) {
        const user = await UsersModel.getUserById(id);
        if (!user) throw new Error('Usuário não encontrado');
        const { password_hash: _ignored, ...userData } = user;
        return userData;
    },

    /**
     * O que faz: retorna usuario por NUSP sem hash de senha.
     * Onde e usada: UsersController.getProfile.
     * Dependencias chamadas: UsersModel.getUserByNUSP.
     * Efeitos colaterais: nenhum.
     */
    async getUserByNUSP(NUSP) {
        const user = await UsersModel.getUserByNUSP(NUSP);
        if (!user) throw new Error('Usuário não encontrado');
        const { password_hash: _ignored, ...userData } = user;
        return userData;
    },

    /**
     * O que faz: lista usuarios ativos para administracao.
     * Onde e usada: UsersController.getAllUsers.
     * Dependencias chamadas: UsersModel.getAllUsers.
     * Efeitos colaterais: nenhum.
     */
    async getAllUsers() {
        return UsersModel.getAllUsers();
    },

    /**
     * O que faz: atualiza caminho da imagem de perfil.
     * Onde e usada: UsersController.updateProfileImage (legado).
     * Dependencias chamadas: UsersModel.updateUserProfileImage.
     * Efeitos colaterais: altera perfil do usuario no banco.
     */
    async updateUserProfileImage(id, profileImage) {
        return UsersModel.updateUserProfileImage(id, profileImage);
    },

    /**
     * O que faz: busca usuarios para autocomplete.
     * Onde e usada: UsersController.searchUsers.
     * Dependencias chamadas: UsersModel.searchUsers.
     * Efeitos colaterais: nenhum.
     */
    async searchUsers(searchTerm, limit = 100) {
        return UsersModel.searchUsers(searchTerm, limit);
    }
};
