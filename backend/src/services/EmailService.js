const nodemailer = require('nodemailer');
require('dotenv').config();
const usersModel = require('../models/UsersModel');
const path = require('path');

/**
 * Service responsável exclusivamente pelo envio de emails.
 * Centraliza toda a lógica de templates e envio de emails do sistema.
 */
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

    /**
     * Método base para envio de emails
     */
    async sendMail({ to, subject, text, html, type = 'generic' }) {
        console.log(`🔵 [EmailService] Iniciando envio de email para ${to} - Tipo: ${type}`);

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            text,
            html,
            attachments: [
                {
                    filename: 'Biblioteca do CM.png',
                    path: './public/images/Biblioteca do CM.png',
                    cid: 'logo'
                },
                {
                    filename: 'overdue.png',
                    path: './public/images/overdue.png',
                    cid: 'atraso'
                },
                {
                    filename: 'nudge.png',
                    path: './public/images/nudge.png',
                    cid: 'cutucada'
                },
                {
                    filename: 'welcome.png',
                    path: './public/images/welcome.png',
                    cid: 'boasvindas'
                }
            ]
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`🟢 [EmailService] Email enviado para ${to}: ${subject}`);
            return true;
        } catch (error) {
            console.error(`🔴 [EmailService] Erro ao enviar email para ${to}:`, error.message);
            throw error;
        }
    }

    /**
     * Gera template HTML padrão para emails
     */
    generateEmailTemplate({ subject, content, isAutomatic = true }) {
        const automaticNotice = isAutomatic
            ? `<span style="color:rgb(100, 17, 97);">Este é um email automático. Não responda a esta mensagem.</span>`
            : `<span style="color: rgb(100, 17, 97);">Este é um email personalizado. Por favor, responda a esta mensagem se necessário.</span>`;

        return `
            <div style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background: #fffdf8; padding: 30px;">
            <style>
            @media only screen and (max-width: 600px) {
                .email-container {
                    width: 100% !important;
                    padding: 5vw !important;
                }
                .email-content-cell {
                    padding: 5vw !important;
                }
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
            <img src="cid:logo" alt="Logo Biblioteca" style="height: 100px; margin-bottom: 5px;" /><br>
            <b> Biblioteca Ciências Moleculares </b> <br>
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
    }

    /**
     * Envia email de boas-vindas para novos usuários
     */
    async sendWelcomeEmail({ user_id }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }

        const subject = 'Bem-vindo à Biblioteca Ciências Moleculares!';
        
        const htmlContent = `
            <p>Olá, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Seja muito bem-vindo(a) à nossa biblioteca! O Carlos Magno está muito feliz em te ver por aqui!</p>
            <div style="text-align: center;">
                <img src="cid:boasvindas" alt="Carlos Magno e novo usuário" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Agora você pode:</p>
            <ul>
                <li>Pesquisar e reservar livros</li>
                <li>Acompanhar seus empréstimos</li>
                <li>Receber notificações sobre prazos de devolução</li>
                <li>E muito mais!</li>
            </ul>
            <p>Se tiver alguma dúvida, não hesite em nos contactar.</p>
            <div style="margin-top: 30px; text-align: center;">
                <span style="font-size: 48px;"></span>
                <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
                    Bons estudos! 
                </div>
            </div>
        `;

        const textContent = `Olá, ${user.name || 'colega'}!\n\nSeja muito bem-vindo(a) à nossa biblioteca! 🎉\n\nAgora você pode pesquisar e reservar livros, acompanhar seus empréstimos, receber notificações sobre prazos e muito mais!\n\nSe tiver alguma dúvida, não hesite em nos contatar.\n\nBons estudos!\nEquipe Biblioteca Ciências Moleculares`;

        const html = this.generateEmailTemplate({ 
            subject, 
            content: htmlContent,
            isAutomatic: true 
        });

        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'welcome'
        });
    }

    /**
     * Envia email de atraso para um usuário
     */
    async sendOverdueEmail({ user_id, books }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }

        const subject = 'Aviso de atraso: O Carlos Magno está com saudades dos livros dele!';
        
        // Monta lista de livros atrasados
        const booksList = books.map(b =>
            `<li><b>${b.book_title || b.book_id}</b> (Data limite: ${new Date(b.due_date).toLocaleDateString('pt-BR')})</li>`
        ).join('');
        
        const textBooksList = books.map(b =>
            `- ${b.book_title || b.book_id} (Data limite: ${new Date(b.due_date).toLocaleDateString('pt-BR')})`
        ).join('\n');

        const htmlContent = `
            <p>Oh não, parece que você esqueceu de devolver algum(ns) livro(s)...</p>
            <ul>${booksList}</ul>
            <div style="text-align: center;">
            <img src="cid:atraso" alt="Carlos Magno surpreso" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Lembre-se que outros colegas podem estar precisando desses materiais para os estudos. A devolução em dia ajuda toda a comunidade acadêmica!</p>
            <div style="margin-top: 30px; text-align: center;">
                <span style="font-size: 48px;"></span>
                <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
                    Sua colaboração faz a diferença! 
                </div>
            </div>
        `;

        const textContent = `O(s) livro(s) abaixo estão em atraso:\n${textBooksList}\n\nPor favor, devolva o(s) livro(s) o quanto antes.\n\nObrigado!\nEquipe Biblioteca Ciências Moleculares`;

        const html = this.generateEmailTemplate({ 
            subject, 
            content: htmlContent,
            isAutomatic: true 
        });

        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'overdue'
        });
    }

    /**
     * Envia email de "cutucada" quando alguém quer um livro
     */
    async sendNudgeEmail({ user_id, requester_name, book_title }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }

        const subject = 'Você foi cutucado: alguém quer esse livro!';
        
        const htmlContent = `
            <p>Ei! 👀</p>
            <p>Um colega está de olho no livro ${book_title ? `"<strong>${book_title}</strong>"` : ''} que você ainda não devolveu... </p>
            <div style="text-align: center;">
                <img src="cid:cutucada" alt="Carlos Magno sendo cutucado" style="height: 350px; margin-bottom: 10px;" />
            </div><p>Que tal fazer a boa e devolver logo? Assim, todo mundo consegue aproveitar melhor a nossa biblioteca! </p>
            <div style="margin-top: 30px; text-align: center;">
                <span style="font-size: 48px;"></span>
                <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
                    Sua colaboração faz a diferença! 
                </div>
            </div>
        `;

        const textContent = `Ei! 📚\n\nUm colega${requester_name ? ` (${requester_name})` : ''} está de olho no livro ${book_title ? `"${book_title}"` : ''} que você ainda não devolveu... 👀\n\nQue tal fazer esse favor e devolver logo? Assim, todo mundo consegue aproveitar melhor a nossa biblioteca! 😄\n\nSua colaboração faz a diferença! 💜`;

        const html = this.generateEmailTemplate({ 
            subject, 
            content: htmlContent,
            isAutomatic: true 
        });

        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'nudge'
        });
    }

    /**
     * Envia email personalizado
     */
    async sendCustomEmail({ user_id, subject, message, isAutomatic = false }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }

        const htmlContent = `<p>${message.replace(/\n/g, '<br>')}</p>`;
        
        const html = this.generateEmailTemplate({ 
            subject, 
            content: htmlContent,
            isAutomatic 
        });

        return await this.sendMail({
            to: user.email,
            subject,
            text: message,
            html,
            type: 'custom'
        });
    }

    /**
     * Envia email para múltiplos usuários (broadcast)
     */
    async sendBulkEmail({ user_ids, subject, message, isAutomatic = false }) {
        const results = [];
        
        for (const user_id of user_ids) {
            try {
                const result = await this.sendCustomEmail({ 
                    user_id, 
                    subject, 
                    message, 
                    isAutomatic 
                });
                results.push({ user_id, success: result });
            } catch (error) {
                console.error(`🔴 [EmailService] Erro ao enviar email para usuário ${user_id}:`, error.message);
                results.push({ user_id, success: false, error: error.message });
            }
        }
        
        return results;
    }


    /**
     * Envia email de notificação personalizada
     */
    async sendNotificationEmail({ user_id, type, message, subject = null }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }

        const emailSubject = subject || `Nova notificação - ${type}`;
        
        const htmlContent = `
            <h2>Nova Notificação</h2>
            <p><strong>Tipo:</strong> ${type}</p>
            <p><strong>Mensagem:</strong> ${message}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
                Esta é uma notificação automática da Biblioteca do CM.
            </p>
        `;

        const textContent = `Nova Notificação\n\nTipo: ${type}\nMensagem: ${message}\n\nEsta é uma notificação automática da Biblioteca do CM.`;

        const html = this.generateEmailTemplate({ 
            subject: emailSubject, 
            content: htmlContent,
            isAutomatic: true 
        });

        return await this.sendMail({
            to: user.email,
            subject: emailSubject,
            text: textContent,
            html,
            type: 'notification'
        });
    }

    /**
     * Testa a configuração de email
     */
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('🟢 [EmailService] Conexão SMTP configurada corretamente');
            return true;
        } catch (error) {
            console.error('🔴 [EmailService] Erro na configuração SMTP:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();