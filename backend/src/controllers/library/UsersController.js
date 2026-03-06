const usersService = require('../../services/library/UsersService');

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
            const { name, email, phone, NUSP, class: userClass } = req.body;
            if (!name || !email || !phone || !NUSP || !userClass) {
                console.warn("🟡 [createUser] Campos obrigatórios faltando.");
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            // Validação simples de telefone (pode ser aprimorada)
            if (!/^\+?\d{10,15}$/.test(phone)) {
                return res.status(400).json({ error: 'Telefone inválido. Informe DDD e número.' });
            }
            const user = await usersService.createUser({ name, email, phone, NUSP, class: userClass });
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
            console.log("🔵 [authenticateUser] Dados recebidos: login e senha recebidos");
            const { login, password } = req.body;
            if (!login || !password) {
                console.warn("🟡 [authenticateUser] Login ou senha não fornecidos.");
                return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
            }
            // Autentica (gera token) usando service
            const authResult = await usersService.authenticateUser(login, password);
            // Verificação de IP se role for proaluno
            if (authResult.role === 'proaluno') {
                // Pula verificação de IP em desenvolvimento
                if (process.env.NODE_ENV === 'development') {
                    console.log('🟡 [authenticateUser] Modo dev: pulando verificação de IP para proaluno');
                } else {
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
            res.status(200).json({ success: true, id });
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
     * ⚠️ DEPRECATED: Esta rota apenas atualiza o caminho no DB, não faz upload.
     * Use PUT /api/profiles/:userId/avatar para fazer upload de imagens customizadas.
     */
    async updateProfileImage(req, res) {
        try {
            const userId = req.user.id;
            const { profile_image } = req.body;
            console.log("🟡 [UsersController] updateProfileImage (DEPRECATED) chamada com:", { userId, profile_image });
            console.log("⚠️  Use PUT /api/profiles/:userId/avatar para upload de arquivos");
            
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

    /**
     * Busca usuários por termo (autocomplete).
     * Query params: 
     *   - q: termo de busca
     *   - limit: limite de resultados (opcional)
     */
    async searchUsers(req, res) {
        console.log("🔵 [searchUsers] Rota chamada com query:", req.query);
        try {
            const { q, limit } = req.query;
            
            const results = await usersService.searchUsers(
                q || '', 
                limit ? parseInt(limit) : 1000
            );
            console.log("🟢 [searchUsers] Retornando", results.length, "resultados");
            res.json(results);
        } catch (error) {
            console.error("🔴 [searchUsers] Erro:", error.message);
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
    }

    /**
     * Exporta todos os usuários para CSV com TODAS as informações incluindo password_hash
     */
    async exportUsersToCSV(req, res) {
        try {
            console.log("🔵 [exportUsersToCSV] Iniciando exportação de usuários");
            const usersModel = require('../../models/library/UsersModel');
            const { escapeCSV } = require('../../utils/csvUtils');
            
            const users = await usersModel.getAllUsersForExport();
            console.log("🟢 [exportUsersToCSV] Total de usuários:", users.length);
            
            // Cabeçalhos do CSV - todas as colunas da tabela users
            const headers = ['id', 'name', 'NUSP', 'email', 'phone', 'password_hash', 'role', 'profile_image', 'class', 'created_at'];
            const csvRows = [headers.join(',')];
            
            // Gera linhas do CSV
            for (const user of users) {
                const row = [
                    escapeCSV(user.id || ''),
                    escapeCSV(user.name || ''),
                    escapeCSV(user.NUSP || ''),
                    escapeCSV(user.email || ''),
                    escapeCSV(user.phone || ''),
                    escapeCSV(user.password_hash || ''),
                    escapeCSV(user.role || ''),
                    escapeCSV(user.profile_image || ''),
                    escapeCSV(user.class || ''),
                    escapeCSV(user.created_at || '')
                ];
                csvRows.push(row.join(','));
            }
            
            const csvContent = csvRows.join('\n');
            const date = new Date().toISOString().split('T')[0];
            
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="usuarios_${date}.csv"`);
            res.send('\ufeff' + csvContent); // BOM para UTF-8
            
            console.log("🟢 [exportUsersToCSV] CSV exportado com sucesso");
        } catch (error) {
            console.error("🔴 [exportUsersToCSV] Erro ao exportar CSV:", error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Importa usuários via CSV
     * Se password_hash estiver vazio, cria usuário e envia email de boas-vindas
     * Se password_hash estiver preenchido, usa o hash diretamente (para migrations)
     */
    async importUsersFromCSV(req, res) {
        try {
            console.log("🔵 [importUsersFromCSV] Iniciando importação de usuários");
            
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Nenhum arquivo CSV fornecido' });
            }
            
            const { importFromCSV } = require('../../utils/csvUtils');
            const usersModel = require('../../models/library/UsersModel');
            
            const requiredFields = ['name', 'NUSP', 'email', 'phone', 'role', 'class'];
            
            const results = await importFromCSV({
                fileBuffer: req.file.buffer,
                requiredFields,
                mapRow: (rowData) => {
                    // Limpa e valida os dados
                    const userData = {
                        name: rowData.name?.trim(),
                        NUSP: parseInt(rowData.NUSP),
                        email: rowData.email?.trim(),
                        phone: rowData.phone?.trim(),
                        role: rowData.role?.trim(),
                        class: rowData.class?.trim() || null,
                        profile_image: rowData.profile_image?.trim() || null,
                        password_hash: rowData.password_hash?.trim() || null,
                        hasPassword: !!(rowData.password_hash?.trim())
                    };
                    
                    // Validações
                    if (!/^\+?\d{10,15}$/.test(userData.phone)) {
                        throw new Error(`Telefone inválido: ${userData.phone}`);
                    }
                    
                    if (!['admin', 'aluno', 'proaluno'].includes(userData.role)) {
                        throw new Error(`Role inválido: ${userData.role}. Use: admin, aluno ou proaluno`);
                    }
                    
                    if (isNaN(userData.NUSP)) {
                        throw new Error(`NUSP inválido: ${rowData.NUSP}`);
                    }
                    
                    return userData;
                },
                addFn: async (userData) => {
                    const { hasPassword, ...userDataClean } = userData;
                    
                    // Se tem password_hash, insere direto no banco (migration/backup)
                    if (hasPassword) {
                        console.log("🟡 [importUsersFromCSV] Usuário com senha hash:", userDataClean.email);
                        const userId = await usersModel.createUser(userDataClean);
                        return userId;
                    }
                    
                    // Se NÃO tem password_hash, usa o service para enviar email de boas-vindas
                    console.log("🟡 [importUsersFromCSV] Usuário sem senha (enviará email):", userDataClean.email);
                    const { password_hash: _, ...userDataForService } = userDataClean;
                    const createdUser = await usersService.createUser(userDataForService);
                    return createdUser;
                },
                logger: {
                    success: (user, row) => {
                        console.log(`🟢 [importUsersFromCSV] Linha ${row}: Usuário ${user.email || user.name} importado com sucesso`);
                    },
                    error: (error, row, line) => {
                        console.error(`🔴 [importUsersFromCSV] Linha ${row}: Erro - ${error.message}`);
                    },
                    finish: (results) => {
                        console.log(`🟢 [importUsersFromCSV] Importação concluída: ${results.success} sucesso, ${results.failed} falhas`);
                    }
                }
            });
            
            res.status(200).json(results);
        } catch (error) {
            console.error('🔴 [importUsersFromCSV] Erro ao importar CSV:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Registra novo usuário via auto-cadastro público (rota pública).
     * O cadastro fica com status 'pending' até o admin aprovar.
     */
    async registerUser(req, res) {
        try {
            console.log("🔵 [registerUser] Dados recebidos:", req.body);
            const { name, email, phone, NUSP, class: userClass } = req.body;
            if (!name || !email || !phone || !NUSP || !userClass) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            if (!/^\+?\d{10,15}$/.test(phone)) {
                return res.status(400).json({ error: 'Telefone inválido. Informe DDD e número.' });
            }
            const user = await usersService.registerUser({ name, email, phone, NUSP, class: userClass });
            console.log("🟢 [registerUser] Usuário pendente criado:", user.id);
            res.status(201).json(user);
        } catch (error) {
            console.error("🔴 [registerUser] Erro:", error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Lista todos os usuários com cadastro pendente (admin only).
     */
    async getPendingUsers(req, res) {
        try {
            console.log("🔵 [getPendingUsers] Listando usuários pendentes.");
            const users = await usersService.getPendingUsers();
            console.log("🟢 [getPendingUsers] Encontrados:", users.length);
            res.status(200).json(users);
        } catch (error) {
            console.error("🔴 [getPendingUsers] Erro:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Aprova cadastro pendente e envia email de boas-vindas (admin only).
     */
    async approveUser(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [approveUser] Aprovando usuário id:", id);
            await usersService.approveUser(id);
            console.log("🟢 [approveUser] Usuário aprovado:", id);
            res.status(200).json({ success: true, id });
        } catch (error) {
            console.error("🔴 [approveUser] Erro:", error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Rejeita e deleta cadastro pendente (admin only).
     */
    async rejectUser(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [rejectUser] Rejeitando usuário id:", id);
            await usersService.rejectUser(id);
            console.log("🟢 [rejectUser] Usuário rejeitado:", id);
            res.status(200).json({ success: true, id });
        } catch (error) {
            console.error("🔴 [rejectUser] Erro:", error.message);
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UsersController();