const usersModel = require('../models/UsersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_ROUNDS = 10;
const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

class UsersService {
    async createUser({ name, email, password, role }) {
        const existing = await usersModel.getUserByEmail(email);
        if (existing) {
            throw new Error('Usuário já existe com este email');
        }
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        const userId = await usersModel.createUser({ name, email, password_hash, role });
        return { id: userId, name, email, role };
    }

    async authenticateUser(login, password) {
        let user;
        if (login && /^\d+$/.test(login)) {
            // Se for só números, tente buscar por NUSP
            user = await usersModel.getUserByNUSP(login);
        } else {
            user = await usersModel.getUserByEmail(login);
        }
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            throw new Error('Senha incorreta');
        }
        // Gera o token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email, NUSP: user.NUSP },
            SECRET,
            { expiresIn: '7d' }
        );
        const { password_hash, ...userData } = user;
        return { ...userData, token };
    }

    async getUserById(id) {
        const user = await usersModel.getUserById(id);
        if (!user) throw new Error('Usuário não encontrado');
        const { password_hash, ...userData } = user;
        return userData;
    }

    async getAllUsers() {
        return await usersModel.getAllUsers();
    }

    async deleteUserById(id) {
        return await usersModel.deleteUserById(id);
    }
}

module.exports = new UsersService();