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
            const { name, email, password, role, NUSP } = req.body;
            if (!name || !email || !password || !role || !NUSP) {
                console.warn("🟡 [createUser] Campos obrigatórios faltando.");
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            const user = await usersService.createUser({ name, email, password, role, NUSP });
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
            console.log("🔵 [authenticateUser] Dados recebidos:", req.body);
            const { email, NUSP, password } = req.body;
            // Permitir login por email OU NUSP
            if ((!email && !NUSP) || !password) {
                console.warn("🟡 [authenticateUser] Email/NUSP ou senha não fornecidos.");
                return res.status(400).json({ error: 'Email ou NUSP e senha são obrigatórios.' });
            }
            const user = await usersService.authenticateUser(email || NUSP, password);
            console.log("🟢 [authenticateUser] Usuário autenticado:", user);
            res.status(200).json(user);
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
            console.log("🟢 [getUserById] Usuário encontrado:", user);
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
            console.log("🔵 [getProfile] Token payload recebido:", req.user);
            let user = null;
            if (req.user.id) {
                user = await usersService.getUserById(req.user.id);
                console.log("🟢 [getProfile] Busca por id:", req.user.id, "Resultado:", user);
            }
            if (!user && req.user.NUSP) {
                user = await usersService.getUserByNUSP(req.user.NUSP);
                console.log("🟡 [getProfile] Busca por NUSP:", req.user.NUSP, "Resultado:", user);
            }
            if (!user) throw new Error('Usuário não encontrado');
            res.status(200).json(user);
        } catch (error) {
            console.error("🔴 [getProfile] Erro:", error.message);
            res.status(404).json({ error: error.message });
        }
    }
}

module.exports = new UsersController();