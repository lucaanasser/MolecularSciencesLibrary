/**
 * Responsabilidade: casos de uso de email administrativo.
 * Camada: service.
 * Entradas/Saidas: recebe dados de solicitacao de cadastro e envia notificacao para admins.
 * Dependencias criticas: metodos base de EmailService e logger compartilhado.
 */

const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: notifica administracao sobre nova solicitacao de cadastro.
     * Onde e usada: UsersService.createUser/createPendingUser.
     * Dependencias chamadas: this.generateEmailTemplate e this.sendMail.
     * Efeitos colaterais: envia email para caixa administrativa.
     */
    async sendRegistrationRequestNotification({ user }) {
        try {
            const ADMIN_EMAIL = 'bibliotecamoleculares@gmail.com';
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
            const adminUrl = `${frontendUrl}/admin`;
            const subject = 'Nova solicitacao de cadastro - Biblioteca CM';

            const htmlContent = `
                <p>Ola, administrador!</p>
                <p>Um novo usuario solicitou cadastro na <strong>Biblioteca Ciencias Moleculares</strong> e aguarda sua aprovacao.</p>
                <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
                    <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Nome</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.name}</td></tr>
                    <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">NUSP</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.NUSP}</td></tr>
                    <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Email</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.email}</td></tr>
                    <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Telefone</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.phone}</td></tr>
                    <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Turma</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.class || '-'}</td></tr>
                </table>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${adminUrl}" style="background: #b657b3; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Ver no painel de administracao</a>
                </div>
                <p style="font-size: 13px; color: #555;">Acesse: Painel Admin -> Usuarios -> <strong>Solicitacoes de Cadastro</strong> para aprovar ou rejeitar.</p>
            `;

            const textContent = `Nova solicitacao de cadastro\n\nNome: ${user.name}\nNUSP: ${user.NUSP}\nEmail: ${user.email}\nTelefone: ${user.phone}\nTurma: ${user.class || '-'}\n\nAcesse o painel de administracao para aprovar ou rejeitar:\n${adminUrl}`;

            const html = this.generateEmailTemplate({
                subject,
                content: htmlContent,
                isAutomatic: true
            });

            await this.sendMail({
                to: ADMIN_EMAIL,
                subject,
                text: textContent,
                html,
                type: 'registration_request'
            });
            log.success('Notificacao de cadastro enviada para administracao', { to: ADMIN_EMAIL });
            return true;
        } catch (error) {
            log.error('Falha em sendRegistrationRequestNotification', { err: error.message });
            return false;
        }
    }
};
