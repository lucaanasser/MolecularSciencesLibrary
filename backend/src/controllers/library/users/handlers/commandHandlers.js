/**
 * Responsabilidade: handlers HTTP de comandos de usuarios.
 * Camada: controller.
 * Entradas/Saidas: traduz operacoes de escrita para respostas HTTP.
 * Dependencias criticas: UsersService e logger compartilhado.
 */

const UsersService = require('../../../../services/library/users/UsersService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria usuario via fluxo administrativo.
     * Onde e usada: rota POST /api/users.
     * Dependencias chamadas: UsersService.createUser.
     * Efeitos colaterais: cria usuario, perfil publico e envia email.
     */
    async createUser(req, res) {
        try {
            const { name, email, phone, NUSP, class: userClass } = req.body;
            if (!name || !email || !phone || !NUSP || !userClass) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            if (!/^\+?\d{10,15}$/.test(phone)) {
                return res.status(400).json({ error: 'Telefone inválido. Informe DDD e número.' });
            }
            const user = await UsersService.createUser({ name, email, phone, NUSP, class: userClass });
            return res.status(201).json(user);
        } catch (error) {
            log.error('Falha ao criar usuario', { err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove usuario por id.
     * Onde e usada: rota DELETE /api/users/:id.
     * Dependencias chamadas: UsersService.deleteUserById.
     * Efeitos colaterais: remove usuario do banco.
     */
    async deleteUserById(req, res) {
        try {
            const { id } = req.params;
            await UsersService.deleteUserById(id);
            return res.status(200).json({ success: true, id });
        } catch (error) {
            log.error('Falha ao deletar usuario', { user_id: req.params.id, err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: atualiza path de imagem de perfil (endpoint legado).
     * Onde e usada: rota PUT /api/users/me/profile-image.
     * Dependencias chamadas: UsersService.updateUserProfileImage.
     * Efeitos colaterais: altera profile_image no banco.
     */
    async updateProfileImage(req, res) {
        try {
            const userId = req.user.id;
            const { profile_image } = req.body;
            if (!profile_image) {
                return res.status(400).json({ error: 'Imagem de perfil é obrigatória.' });
            }
            log.warn('Endpoint legado de updateProfileImage em uso; migrar para upload de avatar em profiles', {
                user_id: userId,
                replacement: 'PUT /api/profiles/:userId/avatar'
            });
            await UsersService.updateUserProfileImage(userId, profile_image);
            return res.status(200).json({ message: 'Imagem de perfil atualizada com sucesso.' });
        } catch (error) {
            log.error('Falha ao atualizar imagem de perfil', { user_id: req.user?.id, err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: registra usuario via auto-cadastro publico.
     * Onde e usada: rota POST /api/users/register.
     * Dependencias chamadas: UsersService.registerUser.
     * Efeitos colaterais: cria usuario pending e notifica admins.
     */
    async registerUser(req, res) {
        try {
            const { name, email, phone, NUSP, class: userClass } = req.body;
            if (!name || !email || !phone || !NUSP || !userClass) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            if (!/^\+?\d{10,15}$/.test(phone)) {
                return res.status(400).json({ error: 'Telefone inválido. Informe DDD e número.' });
            }
            const user = await UsersService.registerUser({ name, email, phone, NUSP, class: userClass });
            return res.status(201).json(user);
        } catch (error) {
            log.error('Falha no auto-cadastro de usuario', { err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: aprova usuario pendente.
     * Onde e usada: rota PATCH /api/users/:id/approve.
     * Dependencias chamadas: UsersService.approveUser.
     * Efeitos colaterais: muda status para active e envia onboarding.
     */
    async approveUser(req, res) {
        try {
            const { id } = req.params;
            await UsersService.approveUser(id);
            return res.status(200).json({ success: true, id });
        } catch (error) {
            log.error('Falha ao aprovar usuario pendente', { user_id: req.params.id, err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: rejeita usuario pendente.
     * Onde e usada: rota DELETE /api/users/:id/reject.
     * Dependencias chamadas: UsersService.rejectUser.
     * Efeitos colaterais: remove usuario pending.
     */
    async rejectUser(req, res) {
        try {
            const { id } = req.params;
            await UsersService.rejectUser(id);
            return res.status(200).json({ success: true, id });
        } catch (error) {
            log.error('Falha ao rejeitar usuario pendente', { user_id: req.params.id, err: error.message });
            return res.status(400).json({ error: error.message });
        }
    }
};
