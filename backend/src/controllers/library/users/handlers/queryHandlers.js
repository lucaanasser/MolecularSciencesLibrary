/**
 * Responsabilidade: handlers HTTP de consultas de usuarios.
 * Camada: controller.
 * Entradas/Saidas: traduz consultas para respostas HTTP.
 * Dependencias criticas: UsersService e logger compartilhado.
 */

const UsersService = require('../../../../services/library/users/UsersService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: consulta usuario por id.
     * Onde e usada: rota GET /api/users/:id.
     * Dependencias chamadas: UsersService.getUserById.
     * Efeitos colaterais: nenhum.
     */
    async getUserById(req, res) {
        try {
            const user = await UsersService.getUserById(req.params.id);
            return res.status(200).json(user);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    },

    /**
     * O que faz: lista usuarios ativos.
     * Onde e usada: rota GET /api/users.
     * Dependencias chamadas: UsersService.getAllUsers.
     * Efeitos colaterais: nenhum.
     */
    async getAllUsers(req, res) {
        try {
            const users = await UsersService.getAllUsers();
            return res.status(200).json(users);
        } catch (error) {
            log.error('Falha ao listar usuarios', { err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: resolve perfil do usuario autenticado via id/NUSP do token.
     * Onde e usada: rota GET /api/users/me.
     * Dependencias chamadas: UsersService.getUserById e getUserByNUSP.
     * Efeitos colaterais: nenhum.
     */
    async getProfile(req, res) {
        try {
            let user = null;
            if (req.user.id) {
                user = await UsersService.getUserById(req.user.id);
            }
            if (!user && req.user.NUSP) {
                user = await UsersService.getUserByNUSP(req.user.NUSP);
            }
            if (!user) throw new Error('Usuário não encontrado');
            return res.status(200).json(user);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    },

    /**
     * O que faz: busca usuarios para autocomplete.
     * Onde e usada: rota GET /api/users/search.
     * Dependencias chamadas: UsersService.searchUsers.
     * Efeitos colaterais: nenhum.
     */
    async searchUsers(req, res) {
        try {
            const { q, limit } = req.query;
            const results = await UsersService.searchUsers(q || '', limit ? parseInt(limit, 10) : 1000);
            return res.json(results);
        } catch (error) {
            log.error('Falha ao buscar usuarios para autocomplete', { err: error.message });
            return res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
    },

    /**
     * O que faz: lista usuarios pendentes.
     * Onde e usada: rota GET /api/users/pending.
     * Dependencias chamadas: UsersService.getPendingUsers.
     * Efeitos colaterais: nenhum.
     */
    async getPendingUsers(req, res) {
        try {
            const users = await UsersService.getPendingUsers();
            return res.status(200).json(users);
        } catch (error) {
            log.error('Falha ao listar usuarios pendentes', { err: error.message });
            return res.status(500).json({ error: error.message });
        }
    }
};
