const usersService = require('../services/UsersService');

/**
 * Controller responsável por gerenciar as requisições relacionadas a usuários.
 * Inclui criação, autenticação, busca, listagem, deleção e perfil do usuário autenticado.
 */
class UsersController {
    /**
     * Cria um novo usuário.
     * Espera receber name, email, password, role e NUSP no corpo da requisição.
     */
    async createUser(req, res) {
        try {
            console.log("🔵 [createUser] Dados recebidos:", req.body);
            const { name, email, phone, role, NUSP, profile_image, class: userClass } = req.body;
            if (!name || !email || !phone || !role || !NUSP) {
                console.warn("🟡 [createUser] Campos obrigatórios faltando.");
                return res.status(400).json({ error: 'Todos os campos são obrigatórios, incluindo telefone.' });
            }
            // Validação simples de telefone (pode ser aprimorada)
            if (!/^\+?\d{10,15}$/.test(phone)) {
                return res.status(400).json({ error: 'Telefone inválido. Informe DDD e número.' });
            }
            const user = await usersService.createUser({ name, email, phone, role, NUSP, profile_image, class: userClass });
            console.log("🟢 [createUser] Usuário criado com sucesso:", user);
            res.status(201).json(user);
        } catch (error) {
            console.error("🔴 [createUser] Erro ao criar usuário:", error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Autentica um usuário usando email ou NUSP e senha.
     * Retorna o usuário autenticado e o token JWT.
     */
    async authenticateUser(req, res) {
        try {
            console.log("🔵 [authenticateUser] Dados recebidos: email/NUSP recebido");
            const { email, NUSP, password } = req.body;
            if ((!email && !NUSP) || !password) {
                console.warn("🟡 [authenticateUser] Email/NUSP ou senha não fornecidos.");
                return res.status(400).json({ error: 'Email ou NUSP e senha são obrigatórios.' });
            }
            const login = email || NUSP;
            // Autentica (gera token) usando service
            const authResult = await usersService.authenticateUser(login, password);
            // Verificação de IP se role for proaluno
            if (authResult.role === 'proaluno') {
                // Obtém IP real considerando proxy
                const rawIp = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
                const clientIp = rawIp.replace('::ffff:', '');
                const allowedIp = process.env.KIOSK_ALLOWED_IP || '143.107.90.22';
                console.log(`🔍 [authenticateUser] Verificando IP para proaluno: clientIp=${clientIp} allowedIp=${allowedIp}`);
                if (clientIp !== allowedIp) {
                    console.warn(`🟡 [authenticateUser] Login bloqueado para proaluno a partir de IP não autorizado: ${clientIp}`);
                    return res.status(403).json({ error: 'IP não autorizado para este usuário.' });
                }
            }
            console.log("🟢 [authenticateUser] Usuário autenticado: id:", authResult.id, "NUSP:", authResult.NUSP, "email:", authResult.email);
            res.status(200).json(authResult);
        } catch (error) {
            console.error("🔴 [authenticateUser] Falha na autenticação:", error.message);
            res.status(401).json({ error: error.message });
        }
    }

    /**
     * Busca um usuário pelo ID fornecido nos parâmetros da rota.
     */
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [getUserById] Buscando usuário por id:", id);
            const user = await usersService.getUserById(id);
            // Nunca logar objeto completo do usuário
            console.log("🟢 [getUserById] Usuário encontrado: id:", user.id, "NUSP:", user.NUSP, "email:", user.email);
            res.status(200).json(user);
        } catch (error) {
            console.error("🔴 [getUserById] Usuário não encontrado:", error.message);
            res.status(404).json({ error: error.message });
        }
    }

    /**
     * Lista todos os usuários cadastrados.
     */
    async getAllUsers(req, res) {
        try {
            console.log("🔵 [getAllUsers] Listando todos os usuários.");
            const users = await usersService.getAllUsers();
            // Nunca logar objetos completos dos usuários
            console.log("🟢 [getAllUsers] Usuários encontrados:", users.length);
            res.status(200).json(users);
        } catch (error) {
            console.error("🔴 [getAllUsers] Erro ao listar usuários:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Deleta um usuário pelo ID fornecido nos parâmetros da rota.
     */
    async deleteUserById(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [deleteUserById] Deletando usuário id:", id);
            await usersService.deleteUserById(id);
            console.log("🟢 [deleteUserById] Usuário deletado com sucesso:", id);
            res.status(204).send();
        } catch (error) {
            console.error("🔴 [deleteUserById] Erro ao deletar usuário:", error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Retorna o perfil do usuário autenticado, usando o payload do token JWT.
     */
    async getProfile(req, res) {
        try {
            console.log("🔵 [getProfile] Token payload recebido: id:", req.user.id, "NUSP:", req.user.NUSP);
            let user = null;
            if (req.user.id) {
                user = await usersService.getUserById(req.user.id);
                // Nunca logar objeto completo do usuário
                console.log("🟢 [getProfile] Busca por id:", req.user.id, "Resultado: id:", user.id, "NUSP:", user.NUSP, "email:", user.email);
            }
            if (!user && req.user.NUSP) {
                user = await usersService.getUserByNUSP(req.user.NUSP);
                console.log("🟡 [getProfile] Busca por NUSP:", req.user.NUSP, "Resultado: id:", user.id, "NUSP:", user.NUSP, "email:", user.email);
            }
            if (!user) throw new Error('Usuário não encontrado');
            res.status(200).json(user);
        } catch (error) {
            console.error("🔴 [getProfile] Erro:", error.message);
            res.status(404).json({ error: error.message });
        }
    }

    /**
     * Endpoint para solicitar redefinição de senha
     */
    async requestPasswordReset(req, res) {
        try {
            const { login } = req.body;
            if (!login) {
                return res.status(400).json({ error: 'Email ou NUSP são obrigatórios.' });
            }
            await usersService.requestPasswordReset(login);
            res.status(200).json({ message: 'Se o usuário existir, um email foi enviado com instruções para redefinir a senha.' });
        } catch (error) {
            console.error("🔴 [requestPasswordReset] Erro:", error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Endpoint para redefinir a senha usando token
     */
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
            }
            await usersService.resetPassword({ token, newPassword });
            res.status(200).json({ message: 'Senha redefinida com sucesso.' });
        } catch (error) {
            console.error("🔴 [resetPassword] Erro:", error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Atualiza a imagem de perfil do usuário autenticado
     */
    async updateProfileImage(req, res) {
        try {
            const userId = req.user.id;
            const { profile_image } = req.body;
            console.log("🔵 [UsersController] updateProfileImage chamada com:", { userId, profile_image });
            if (!profile_image) {
                return res.status(400).json({ error: 'Imagem de perfil é obrigatória.' });
            }
            await usersService.updateUserProfileImage(userId, profile_image);
            res.status(200).json({ message: 'Imagem de perfil atualizada com sucesso.' });
        } catch (error) {
            console.error("🔴 [updateProfileImage] Erro:", error.message);
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UsersController();