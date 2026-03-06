/**
 * Service responsável pela lógica de negócio dos usuários.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const usersModel = require('../../models/library/UsersModel');
const publicProfilesModel = require('../../models/academic/publicProfiles/PublicProfilesModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_ROUNDS = 10;
const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
const EmailService = require('../utilities/EmailService'); 

class UsersService {
    
    /**
     * Cria um novo usuário.
     * Verifica se já existe por email, insere no banco, cria perfil público e envia email de boas-vindas.
     * 
     * @param {Object} userData - Dados do usuário. Esperado:
     *   {
     *     name: string,
     *     email: string,
     *     NUSP: number,
     *     phone: string,
     *     class: string
     *   }
     * @returns {Promise<Object>} Dados do usuário criado (sem senha)
     * @throws {Error} Caso já exista usuário com o email ou ocorra erro no processo
     */
    async createUser({ name, email, NUSP, phone, class: userClass }) {
        console.log("🔵 [createUser] Verificando existência do usuário por email:", email);
        const existing = await usersModel.getUserByEmail(email);
        if (existing) {
            console.warn("🟡 [createUser] Usuário já existe com este email:", email);
            throw new Error('Usuário já existe com este email');
        }

        // Cria usuário SEM senha
        const userId = await usersModel.createUser({ name, email, NUSP, phone, class: userClass });
        console.log("🟢 [createUser] Usuário criado com id:", userId);

        // Auto-criar perfil público para o usuário
        try {
            await publicProfilesModel.createProfile(userId.lastID || userId);
            console.log("🟢 [createUser] Perfil público auto-criado para user:", userId.lastID || userId);
        } catch (error) {
            console.error("🔴 [createUser] Erro ao criar perfil público:", error.message);
            // Não falha a criação do usuário se o perfil público falhar
        }

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
     * 
     * @param {string | number} login - Email ou NUSP
     * @param {string} password - Senha
     * @returns {Promise<Object>} Dados do usuário autenticado + token JWT
     * @throws {Error} Caso usuário não exista ou senha esteja incorreta
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
        if (user.status === 'pending') {
            console.warn("🟡 [authenticateUser] Usuário com cadastro pendente tentou logar:", login);
            throw new Error('Seu cadastro ainda está aguardando aprovação do administrador.');
        }
        const valid = user.password_hash && await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            console.warn("🟡 [authenticateUser] Senha incorreta para usuário:", login);
            throw new Error('Senha incorreta');
        }
        // Gera o token JWT com validade estendida para usuário proaluno
        const payload = { id: user.id, role: user.role, name: user.name, email: user.email, NUSP: user.NUSP };
        const isProAluno = user.role === 'proaluno';
        const expiresIn = isProAluno ? '365d' : '7d';
        if (isProAluno) {
            console.log('🟢 [authenticateUser] Usuário proaluno detectado. Token com 365d.');
        }
        const token = jwt.sign(payload, SECRET, { expiresIn });
        const { password_hash, ...userData } = user;
        console.log("🟢 [authenticateUser] Usuário autenticado, token gerado.");
        return { ...userData, token };
    }

    /**
     * Gera e envia token de redefinição de senha para o email do usuário.
     * 
     * @param {string} login - Email ou NUSP
     * @returns {Promise<boolean>} true se enviado com sucesso
     * @throws {Error} Caso usuário não exista ou ocorra erro no envio
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
     * Redefine a senha do usuário usando o token.
     * 
     * @param {Object} params - Dados para redefinição
     *   {
     *     token: string,
     *     newPassword: string
     *   }
     * @returns {Promise<boolean>} true se redefinido com sucesso
     * @throws {Error} Caso token seja inválido ou usuário não exista
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
     * 
     * @param {number} id - ID do usuário
     * @returns {Promise<Object>} Dados do usuário
     * @throws {Error} Caso usuário não exista
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
     * 
     * @param {number} NUSP - Identificador NUSP
     * @returns {Promise<Object>} Dados do usuário
     * @throws {Error} Caso usuário não exista
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
     * 
     * @returns {Promise<Array>} Lista de usuários
     */
    async getAllUsers() {
        console.log("🔵 [getAllUsers] Listando todos os usuários.");
        return await usersModel.getAllUsers();
    }

    /**
     * Deleta usuário pelo ID.
     * 
     * @param {number} id - ID do usuário
     * @returns {Promise<Object>} Resultado da deleção
     */
    async deleteUserById(id) {
        console.log("🔵 [deleteUserById] Deletando usuário id:", id);
        return await usersModel.deleteUserById(id);
    }

    /**
     * Atualiza a imagem de perfil do usuário.
     * 
     * @param {number} id - ID do usuário
     * @param {string} profile_image - path da imagem de perfil -- deve ser um path relativo válido para o frontend acessar
     * @returns {Promise<Object>} Resultado da atualização
     */
    async updateUserProfileImage(id, profile_image) {
        console.log("🔵 [UsersService] updateUserProfileImage chamada com:", { id, profile_image });
        return usersModel.updateUserProfileImage(id, profile_image);
    }

    /**
     * Busca usuários por termo (nome, NUSP, turma).
     * Retorna apenas dados públicos para autocomplete.
     * @param {string} searchTerm - Termo de busca
     * @param {number} limit - Limite de resultados
     */
    async searchUsers(searchTerm, limit = 100) {
        console.log("🔵 [searchUsers] Buscando usuários:", searchTerm);
        const users = await usersModel.searchUsers(searchTerm, limit);
        console.log("🟢 [searchUsers] Encontrados:", users.length, "usuários");
        return users;
    }

    /**
     * Registra novo usuário via auto-cadastro público.
     * Verifica unicidade de email, NUSP e telefone.
     * Cria usuário com status 'pending' e notifica admins.
     *
     * @param {Object} userData - name, email, NUSP, phone, class
     * @returns {Promise<Object>} Dados do usuário pendente (sem senha)
     * @throws {Error} Se já existir cadastro com email, NUSP ou telefone
     */
    async registerUser({ name, email, NUSP, phone, class: userClass }) {
        console.log("🔵 [registerUser] Verificando duplicatas para:", email, NUSP, phone);

        const byEmail = await usersModel.getUserByEmail(email);
        if (byEmail) throw new Error('Este email já está cadastrado no sistema.');

        const byNUSP = await usersModel.getUserByNUSP(NUSP);
        if (byNUSP) throw new Error('Este NUSP já está cadastrado no sistema.');

        const byPhone = await usersModel.getUserByPhone(phone);
        if (byPhone) throw new Error('Este telefone já está cadastrado no sistema.');

        const userId = await usersModel.createPendingUser({ name, email, NUSP, phone, class: userClass });
        console.log("🟢 [registerUser] Usuário pendente criado com id:", userId);

        const created = await usersModel.getUserById(userId);

        // Notifica admins sobre novo pedido de cadastro (fire and forget)
        EmailService.sendRegistrationRequestNotification({ user: created }).catch(err => {
            console.error("🔴 [registerUser] Falha ao notificar admins:", err.message);
        });

        const { password_hash: _, ...userData } = created || {};
        return userData;
    }

    /**
     * Retorna lista de usuários com status 'pending'.
     *
     * @returns {Promise<Array>} Lista de usuários pendentes
     */
    async getPendingUsers() {
        console.log("🔵 [getPendingUsers] Buscando usuários pendentes.");
        return await usersModel.getPendingUsers();
    }

    /**
     * Aprova cadastro pendente: ativa a conta, cria perfil público e envia email de boas-vindas.
     *
     * @param {number} id - ID do usuário pendente
     * @returns {Promise<boolean>} true se aprovado com sucesso
     * @throws {Error} Se usuário não existir ou não estiver pendente
     */
    async approveUser(id) {
        console.log("🔵 [approveUser] Aprovando usuário id:", id);
        const user = await usersModel.getUserById(id);
        if (!user) throw new Error('Usuário não encontrado.');
        if (user.status !== 'pending') throw new Error('Usuário não está com cadastro pendente.');

        await usersModel.approveUser(id);
        console.log("🟢 [approveUser] Status atualizado para 'active':", id);

        // Cria perfil público
        try {
            await publicProfilesModel.createProfile(id);
            console.log("🟢 [approveUser] Perfil público criado para user:", id);
        } catch (error) {
            console.error("🔴 [approveUser] Erro ao criar perfil público:", error.message);
        }

        // Envia email de boas-vindas com link de primeiro acesso (fire and forget)
        EmailService.sendWelcomeEmail({ user_id: id }).catch(err => {
            console.error("🔴 [approveUser] Falha ao enviar email de boas-vindas:", err.message);
        });

        return true;
    }

    /**
     * Rejeita cadastro pendente: deleta o registro do banco.
     *
     * @param {number} id - ID do usuário pendente
     * @returns {Promise<boolean>} true se rejeitado com sucesso
     * @throws {Error} Se usuário não existir ou não estiver pendente
     */
    async rejectUser(id) {
        console.log("🔵 [rejectUser] Rejeitando usuário id:", id);
        const user = await usersModel.getUserById(id);
        if (!user) throw new Error('Usuário não encontrado.');
        if (user.status !== 'pending') throw new Error('Usuário não está com cadastro pendente.');

        await usersModel.deleteUserById(id);
        console.log("🟢 [rejectUser] Usuário rejeitado e deletado:", id);
        return true;
    }
}

module.exports = new UsersService();