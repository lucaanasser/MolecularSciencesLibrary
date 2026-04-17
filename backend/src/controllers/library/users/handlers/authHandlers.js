/**
 * Responsabilidade: handlers HTTP de autenticacao e senha de usuarios.
 * Camada: controller.
 * Entradas/Saidas: autentica login e gerencia fluxo de reset de senha.
 * Dependencias criticas: UsersService e logger compartilhado.
 */

const UsersService = require('../../../../services/library/users/UsersService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: autentica usuario e aplica politica de IP para proaluno.
     * Onde e usada: rota POST /api/users/login.
     * Dependencias chamadas: UsersService.authenticateUser.
     * Efeitos colaterais: nenhum.
     */
    async authenticateUser(req, res) {
        try {
            const { login, password } = req.body;
            if (!login || !password) {
                return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
            }

            const authResult = await UsersService.authenticateUser(login, password);
            if (authResult.role === 'proaluno' && process.env.NODE_ENV !== 'development') {
                const rawIp = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
                const clientIp = rawIp.replace('::ffff:', '');
                const allowedIp = process.env.KIOSK_ALLOWED_IP || '143.107.90.22';
                if (clientIp !== allowedIp) {
                    return res.status(403).json({ error: 'IP não autorizado para este usuário.' });
                }
            }

            return res.status(200).json(authResult);
        } catch (error) {
            log.error('Falha na autenticacao de usuario', { err: error.message });
            return res.status(401).json({ error: error.message });
        }
    },

    /**
     * O que faz: solicita reset de senha por login.
     * Onde e usada: rota POST /api/users/forgot-password.
     * Dependencias chamadas: UsersService.requestPasswordReset.
     * Efeitos colaterais: envia email de reset.
     */
    async requestPasswordReset(req, res) {
        try {
            const { login } = req.body;
            if (!login) {
                return res.status(400).json({ error: 'Email ou NUSP são obrigatórios.' });
            }
            await UsersService.requestPasswordReset(login);
            return res.status(200).json({ message: 'Se o usuário existir, um email foi enviado com instruções para redefinir a senha.' });
        } catch (error) {
            log.error('Falha ao solicitar reset de senha', { err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: redefine senha com token valido.
     * Onde e usada: rota POST /api/users/reset-password.
     * Dependencias chamadas: UsersService.resetPassword.
     * Efeitos colaterais: altera senha do usuario no banco.
     */
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
            }
            await UsersService.resetPassword({ token, newPassword });
            return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
        } catch (error) {
            log.error('Falha ao redefinir senha', { err: error.message });
            return res.status(400).json({ error: error.message });
        }
    }
};
