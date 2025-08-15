const usersModel = require('../models/UsersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_ROUNDS = 10;
const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
const EmailService = require('./EmailService'); 
/**
 * Service responsável pela lógica de negócio dos usuários.
 * Inclui criação, autenticação, busca, listagem e deleção.
 */
class UsersService {
    /**
     * Cria um novo usuário após verificar se já existe por email.
     * Retorna os dados do usuário criado (sem senha).
     */
    async createUser({ name, email, phone, role, NUSP, profile_image, class: userClass }) {
        console.log("🔵 [createUser] Verificando existência do usuário por email:", email);
        const existing = await usersModel.getUserByEmail(email);
        if (existing) {
            console.warn("🟡 [createUser] Usuário já existe com este email:", email);
            throw new Error('Usuário já existe com este email');
        }
        // Cria usuário SEM senha
        const password_hash = null;
        const userId = await usersModel.createUser({ name, email, phone, password_hash, role, NUSP, profile_image, class: userClass });
        console.log("🟢 [createUser] Usuário criado com id:", userId);

        // Busca o usuário recém-criado para incluir created_at e demais campos padrão
        const created = await usersModel.getUserById(userId);
        const { password_hash: _ignored, ...userData } = created || {};

        // Envia email de boas-vindas com link para cadastrar senha
        EmailService.sendWelcomeEmail({ user_id: userId, sendResetLink: true }).catch(err => {
            console.error("🔴 [createUser] Falha ao enviar email de boas-vindas:", err.message);
        });

        return userData;
    }

    /**
     * Autentica usuário por email ou NUSP e senha.
     * Retorna dados do usuário e token JWT.
     */
    async authenticateUser(login, password) {
        let user;
        if (login && /^\d+$/.test(login)) {
            // Login por NUSP (apenas números)
            user = await usersModel.getUserByNUSP(login);
            console.log("🟢 [authenticateUser] Busca por NUSP:", login, "Resultado:", user);
        } else {
            // Login por email
            user = await usersModel.getUserByEmail(login);
            console.log("🟢 [authenticateUser] Busca por email:", login, "Resultado:", user);
        }
        if (!user) {
            console.error("🔴 [authenticateUser] Usuário não encontrado:", login);
            throw new Error('Usuário não encontrado');
        }
        const valid = user.password_hash && await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            console.warn("🟡 [authenticateUser] Senha incorreta para usuário:", login);
            throw new Error('Senha incorreta');
        }
        // Gera o token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email, NUSP: user.NUSP },
            SECRET,
            { expiresIn: '7d' }
        );
        const { password_hash, ...userData } = user;
        console.log("🟢 [authenticateUser] Usuário autenticado, token gerado.");
        return { ...userData, token };
    }

    /**
     * Gera e envia token de redefinição de senha para o email do usuário
     */
    async requestPasswordReset(login) {
        let user;
        if (login && /^\d+$/.test(login)) {
            user = await usersModel.getUserByNUSP(login);
        } else {
            user = await usersModel.getUserByEmail(login);
        }
        if (!user) throw new Error('Usuário não encontrado');
        const jwt = require('jsonwebtoken');
        const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
        const resetToken = jwt.sign({ id: user.id, email: user.email, type: 'reset' }, SECRET, { expiresIn: '1h' });
        await EmailService.sendPasswordResetEmail({ user_id: user.id, resetToken });
        return true;
    }

    /**
     * Redefine a senha do usuário usando o token
     */
    async resetPassword({ token, newPassword }) {
        const jwt = require('jsonwebtoken');
        const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
        let payload;
        try {
            payload = jwt.verify(token, SECRET);
        } catch (err) {
            throw new Error('Token inválido ou expirado');
        }
        if (!payload || (payload.type !== 'reset' && payload.type !== 'first_access') || !payload.id) {
            throw new Error('Token inválido');
        }
        const user = await usersModel.getUserById(payload.id);
        if (!user) throw new Error('Usuário não encontrado');
        const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await usersModel.updateUserPassword(user.id, password_hash);
        return true;
    }

    /**
     * Busca usuário por ID.
     * Retorna dados do usuário sem o hash da senha.
     */
    async getUserById(id) {
        console.log("🔵 [getUserById] Buscando usuário por id:", id);
        const user = await usersModel.getUserById(id);
        console.log("🟢 [getUserById] Resultado:", user);
        if (!user) throw new Error('Usuário não encontrado');
        const { password_hash, ...userData } = user;
        return userData;
    }

    /**
     * Busca usuário por NUSP.
     * Retorna dados do usuário sem o hash da senha.
     */
    async getUserByNUSP(NUSP) {
        console.log("🔵 [getUserByNUSP] Buscando usuário por NUSP:", NUSP);
        const user = await usersModel.getUserByNUSP(NUSP);
        console.log("🟢 [getUserByNUSP] Resultado:", user);
        if (!user) throw new Error('Usuário não encontrado');
        const { password_hash, ...userData } = user;
        return userData;
    }

    /**
     * Lista todos os usuários cadastrados.
     */
    async getAllUsers() {
        console.log("🔵 [getAllUsers] Listando todos os usuários.");
        return await usersModel.getAllUsers();
    }

    /**
     * Deleta usuário pelo ID.
     */
    async deleteUserById(id) {
        console.log("🔵 [deleteUserById] Deletando usuário id:", id);
        return await usersModel.deleteUserById(id);
    }

    /**
     * Atualiza a imagem de perfil do usuário.
     */
    async updateUserProfileImage(id, profile_image) {
        console.log("🔵 [UsersService] updateUserProfileImage chamada com:", { id, profile_image });
        return usersModel.updateUserProfileImage(id, profile_image);
    }
}

module.exports = new UsersService();