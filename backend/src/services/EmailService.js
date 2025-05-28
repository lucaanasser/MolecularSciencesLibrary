const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendMail({ to, subject, text, html, type, overdueBooks, message }) {
        let finalSubject = subject;
        let finalText = text || message;
        let finalHtml = html;

        // Personalização para notificação do tipo "nudge"
        if (type === 'nudge') {
            finalSubject = 'Você foi cutucado! 👀 Alguém quer esse livro!';
            finalText = `Ei! 📚\n\nUm colega está de olho no livro que você ainda não devolveu... 👀\n\nQue tal fazer esse favor e devolver logo? Assim, todo mundo consegue aproveitar melhor a nossa biblioteca! 😄\n\nSua colaboração faz a diferença! 💜`;
            finalHtml = null;
        }

        // Personalização para notificação personalizada
        if (type === 'custom') {
            finalSubject = subject;
            finalText = text;
            finalHtml = null;
        }

        const automaticNotice = type === 'custom'
            ? `<span style="color: #555;">Este é um email personalizado. Por favor, responda a esta mensagem se necessário.</span>`
            : `<span style="color: #bbb;">Este é um email automático. Não responda a esta mensagem.</span>`;

        // Gerar HTML somente se não for fornecido
        if (!finalHtml) {
            finalHtml = `
                <div style="font-family: 'DM Sans', Arial, sans-serif; background: #fffdf8; padding: 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; border: 1px solid #6C4AB6; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <tr>
                            <td style="padding: 30px;">
                                <h2 style="color: #6C4AB6; font-family: 'Bebas Neue', Arial, sans-serif; font-size: 28px; margin-bottom: 20px;">
                                    ${finalSubject}
                                </h2>
                                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                                    ${finalText ? finalText.replace(/\n/g, "<br>") : ""}
                                </p>
                                ${
                                    type === 'nudge'
                                        ? `<div style="margin-top: 30px; text-align: center;">
                                                <span style="font-size: 48px;">😄📚</span>
                                                <div style="color: "#b657b3"; font-weight: bold; margin-top: 10px; font-family: 'Bebas Neue', sans-serif;">
                                                    Sua colaboração faz a diferença!
                                                </div>
                                           </div>`
                                        : ''
                                }
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 30px 30px 30px;">
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <div style="color: #777; font-size: 12px; text-align: center; line-height: 1.5;">
                                    Biblioteca Ciências Moleculares <br>
                                    <a href="mailto:bibliotecamoleculares@gmail.com" style="color: #6C4AB6; text-decoration: none;">
                                        bibliotecamoleculares@gmail.com
                                    </a><br>
                                    ${automaticNotice}
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject: finalSubject,
            text: finalText,
            html: finalHtml
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`🟣 [EmailService] Email enviado para ${to}: ${finalSubject}`);
        } catch (error) {
            console.error(`🔴 [EmailService] Erro ao enviar email para ${to}:`, error.message);
            throw error;
        }
    }
}

module.exports = new EmailService();
