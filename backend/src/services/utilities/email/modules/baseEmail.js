/**
 * Responsabilidade: operacoes base de transporte e template de email.
 * Camada: service.
 * Entradas/Saidas: envia emails via transporter e gera HTML padrao.
 * Dependencias criticas: this.transporter e logger compartilhado.
 */

const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Metodo base para envio de emails.
     */
    async sendMail({ to, subject, text, html, type = 'generic', attachments = [] }) {
        log.start('Iniciando envio de email', { to, type });

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            text,
            html,
            attachments
        };

        try {
            await this.transporter.sendMail(mailOptions);
            log.success('Email enviado com sucesso', { to, type, subject });
            return true;
        } catch (error) {
            log.error('Falha ao enviar email', { to, type, err: error.message });
            throw error;
        }
    },

    /**
     * Gera template HTML padrao para emails.
     */
    generateEmailTemplate({ subject, content, isAutomatic = true }) {
        const automaticNotice = isAutomatic
            ? `<span style="color:rgb(100, 17, 97);">Este e um email automatico. Nao responda a esta mensagem.</span>`
            : `
               <span style="color:rgb(100, 17, 97);">Este nao e um email automatico. Em caso de duvidas, pode responder a esta mensagem.</span>
            `;
        return `
            <div style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background: #fffdf8; padding: 30px;">
            <style>
            @media only screen and (max-width: 600px) {
                .email-container { width: 100% !important; padding: 5vw !important; }
                .email-content-cell { padding: 5vw !important; }
            }
            </style>
            <table class="email-container" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; border: 1px solid #6C4AB6; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <tr>
            <td class="email-content-cell" style="padding: 30px;">
            <h2 style="color:#b657b3; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; font-size: 28px; margin-bottom: 20px; letter-spacing:-0.1em; text-transform: uppercase;">
            ${subject}
            </h2>
            <div style="color: #333; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', 'Roboto', Arial, Helvetica, sans-serif;">
            ${content}
            </div>
            </td>
            </tr>
            <tr>
            <td style="padding: 0 30px 30px 30px; background: #b657b3; border-radius: 0 0 8px 8px;">
            <div style="color: #fff; font-size: 14px; text-align: center; line-height: 1.5; font-family: 'Segoe UI', 'Roboto', Arial, Helvetica, sans-serif;">
            <img src="https://bibliotecamoleculares.com/images/email-images/Biblioteca%20do%20CM.png" alt="Logo Biblioteca" style="height: 100px; margin-bottom: 5px;" /><br>
            <b> Biblioteca Ciencias Moleculares </b> <br>
            <a href="mailto:bibliotecamoleculares@gmail.com" style="color: #fff; text-decoration: none;">
            bibliotecamoleculares@gmail.com
            </a><br>
            ${automaticNotice}
            </div>
            </td>
            </tr>
            </table>
            </div>
        `;
    },

    /**
     * Testa a configuracao de email.
     */
    async testConnection() {
        try {
            await this.transporter.verify();
            log.success('Conexao SMTP configurada corretamente');
            return true;
        } catch (error) {
            log.error('Erro na configuracao SMTP', { err: error.message });
            return false;
        }
    }
};
