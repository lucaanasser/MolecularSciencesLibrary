const usersModel = require('../models/UsersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_ROUNDS = 10;
const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

/**
 * Service responsável pela lógica de negócio dos usuários.
 * Inclui criação, autenticação, busca, listagem e deleção.
 */
class UsersService {
    /**
     * Cria um novo usuário após verificar se já existe por email.
     * Retorna os dados do usuário criado (sem senha).
     */
    async createUser({ name, email, password, role, NUSP }) {
        console.log("🔵 [createUser] Verificando existência do usuário por email:", email);
        const existing = await usersModel.getUserByEmail(email);
        if (existing) {
            console.warn("🟡 [createUser] Usuário já existe com este email:", email);
            throw new Error('Usuário já existe com este email');
        }
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        const userId = await usersModel.createUser({ name, email, password_hash, role, NUSP });
        console.log("🟢 [createUser] Usuário criado com id:", userId);
        return { id: userId, name, email, role, NUSP };
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
        const valid = await bcrypt.compare(password, user.password_hash);
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
}

module.exports = new UsersService();