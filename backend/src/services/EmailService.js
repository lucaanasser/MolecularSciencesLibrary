const nodemailer = require('nodemailer');
require('dotenv').config();
const usersModel = require('../models/UsersModel');
const path = require('path');
const fs = require('fs');

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
    async sendMail({ to, subject, text, html, type = 'generic', attachments = [] }) {
        console.log(`🔵 [EmailService] Iniciando envio de email para ${to} - Tipo: ${type}`);

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
            : `
                <div style="padding:14px 18px; background:#6c4ab6; border:1px solid #54379a; border-radius:6px; color:#fff; text-align:left; font-size:14px; line-height:1.5; margin-top:10px;">
                    <strong style="display:block; font-size:15px; margin-bottom:4px;">Mensagem personalizada</strong>
                    Este email foi enviado manualmente por um administrador da Biblioteca Ciências Moleculares.<br>
                    Você pode responder diretamente para continuar a conversa ou tirar dúvidas.
                </div>
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
            <img src="https://bibliotecamoleculares.com/images/email-images/overdue.png" alt="Carlos Magno esquecido" style="height: 350px; margin-bottom: 10px;" />
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
                <img src="https://bibliotecamoleculares.com/images/email-images/nudge.png" alt="Carlos Magno sendo cutucado" style="height: 350px; margin-bottom: 10px;" />
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
     * Envia email de boas-vindas para novos usuários
     * Se sendResetLink for true, inclui link para redefinir senha
     */
    async sendWelcomeEmail({ user_id }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }

        const subject = 'Bem-vindo à Biblioteca Ciências Moleculares!';

        // Gera token de primeiro acesso
        const jwt = require('jsonwebtoken');
        const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
        const resetToken = jwt.sign({ id: user.id, email: user.email, type: 'first_access' }, SECRET, { expiresIn: '24h' });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/redefinir-senha?token=${resetToken}`;

        let htmlContent = `
            <p>Olá, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Seja muito bem-vindo(a) à nossa biblioteca! O Carlos Magno está muito feliz em te ver por aqui!</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/welcome.png" alt="Carlos Magno e novo usuário" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Agora você pode:</p>
            <ul>
                <li>Pesquisar e reservar livros</li>
                <li>Acompanhar seus empréstimos</li>
                <li>Receber notificações sobre prazos de devolução</li>
                <li>E muito mais!</li>
            </ul>
            <hr>
            <p>Para acessar sua conta, é necessário criar uma senha de acesso. <strong>Atenção: Não use senhas sensíveis, pois estamos em uma versão teste e não garantimos a segurança dos dados.</strong></p>
            <p><a href="${resetUrl}" style="color: #b657b3; font-weight: bold;">Clique aqui para cadastrar sua senha</a></p>
            <p style="font-size: 13px; color: #555;">Este link expira em 24 horas. Caso tenha expirado use a função de: esqueci minha senha</p>
            <p>Se tiver alguma dúvida, não hesite em nos contactar.</p>
            <div style="margin-top: 30px; text-align: center;">
                <span style="font-size: 48px;"></span>
                <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
                    Bons estudos! 
                </div>
            </div>
        `;

        let textContent = `Olá, ${user.name || 'colega'}!\n\nSeja muito bem-vindo(a) à nossa biblioteca! 🎉\n\nAgora você pode pesquisar e reservar livros, acompanhar seus empréstimos, receber notificações sobre prazos e muito mais!\n\nPara acessar sua conta, crie sua senha de acesso: ${resetUrl}\n(Este link expira em 24 horas)\n\nSe tiver alguma dúvida, não hesite em nos contatar.\n\nBons estudos!\nEquipe Biblioteca Ciências Moleculares`;

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
     * Envia email de redefinição de senha
     */
    async sendPasswordResetEmail({ user_id, resetToken }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }
        const subject = 'Redefinição de senha';
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/redefinir-senha?token=${resetToken}`;
        const htmlContent = `
            <p>Olá, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/password.png" alt="Carlos Magno esquecido" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Para criar uma nova senha, clique no link abaixo. <strong>Atenção: Não use senhas sensíveis, pois estamos em uma versão teste e não garantimos a segurança dos dados.</strong></p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${resetUrl}" style="background: #b657b3; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 18px;">Redefinir minha senha</a>
            </div>
            <p>Se você não solicitou, ignore este email.</p>
        `;
        const textContent = `Olá, ${user.name || 'colega'}!\n\nRecebemos uma solicitação para redefinir sua senha. Para criar uma nova senha, acesse: ${resetUrl}\n\nSe você não solicitou, ignore este email.\n\nEquipe Biblioteca Ciências Moleculares`;

        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'reset_password'
        });
    }

    /**
     * Envia email de confirmação de devolução de livro
     */
    async sendReturnConfirmationEmail({ user_id, book_title, returnedAt }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }
        const subject = 'Confirmação de devolução de livro';
        const dateStr = returnedAt ? new Date(returnedAt).toLocaleDateString('pt-BR') : (new Date()).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Olá, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Confirmamos a devolução do livro <b>"${book_title}"</b> em ${dateStr}.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/return.png" alt="Carlos Magno relaxado" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Muito obrigado por colaborar com a nossa biblioteca! Esperamos te ver em breve para novos empréstimos.</p>
        `;
        const textContent = `Olá, ${user.name || 'colega'}!\n\nConfirmamos a devolução do livro "${book_title}" em ${dateStr}.\n\nMuito obrigado por colaborar com a nossa biblioteca! Esperamos te ver em breve para novos empréstimos.\n\nEquipe Biblioteca Ciências Moleculares`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'return_confirmation'
        });
    }

    /**
     * Envia email de confirmação de novo empréstimo
     */
    async sendLoanConfirmationEmail({ user_id, book_title, borrowedAt }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }
        const subject = 'Confirmação de empréstimo de livro';
        // Buscar a data de devolução real do banco de dados
        let dueDateStr = '';
        try {
            // loansModel pode ser importado no topo do arquivo se não estiver
            const loansModel = require('../models/LoansModel');
            const activeLoan = await loansModel.getActiveLoanForUserAndBook(user_id, book_title);
            if (activeLoan && activeLoan.due_date) {
                dueDateStr = new Date(activeLoan.due_date).toLocaleDateString('pt-BR');
            }
        } catch (err) {
            console.error('Erro ao buscar data de devolução:', err.message);
        }
        const dateStr = borrowedAt ? new Date(borrowedAt).toLocaleDateString('pt-BR') : (new Date()).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Olá, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Confirmamos o registro do empréstimo do livro <b>"${book_title}"</b> em ${dateStr}.</p>
            ${dueDateStr ? `<p><b>Data limite para devolução:</b> ${dueDateStr}</p>` : ''}
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/loan.png" alt="Carlos Magno lendo" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Fique atento ao prazo de devolução e aproveite a leitura!</p>
            <p>Você pode renovar o empréstimo diretamente pelo nosso site, na "Área do Usuário".</p>
        `;
        const textContent = `Olá, ${user.name || 'colega'}!\n\nConfirmamos o registro do empréstimo do livro "${book_title}" em ${dateStr}.\n\nFique atento ao prazo de devolução e aproveite a leitura!\n\nEquipe Biblioteca Ciências Moleculares`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'loan_confirmation'
        });
    }

    /*
     * Envia email de lembrete de devolução próxima
     */
    async sendDueSoonEmail({ user_id, book_title, due_date, days_left }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }
        const subject = days_left === 1
            ? 'Atenção: Último dia para devolver o livro!'
            : `Lembrete: Faltam ${days_left} dias para devolver o livro!`;
        const dueDateStr = new Date(due_date).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Olá, <strong>${user.name || 'colega'}</strong>!</p>
            <p>O prazo para devolução do livro <b>"${book_title}"</b> está se aproximando.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/reminder.png" alt="Carlos Magno " style="height: 200px; margin-bottom: 10px;" />
            </div>
            <p><b>Data limite para devolução:</b> ${dueDateStr}</p>
            <p>${days_left === 1 ? 'Hoje é o último dia para devolver o livro! Não deixe para depois.' : `Faltam apenas ${days_left} dias para o prazo final.`}</p>
            <p>Se precisar renovar ou estender, acesse a "Área do Usuário" no site.</p>
            <p> <b> Bons estudos! </b> </p>
        `;
        const textContent = `Olá, ${user.name || 'colega'}!\n\nO prazo para devolução do livro "${book_title}" está se aproximando.\nData limite: ${dueDateStr}\n${days_left === 1 ? 'Hoje é o último dia para devolver o livro!' : `Faltam apenas ${days_left} dias para o prazo final.`}\nSe precisar renovar ou estender, acesse a "Área do Usuário" no site.`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'due_soon'
        });
    }

     /**
     * Envia email de confirmação de renovação de empréstimo
     */
    async sendRenewalConfirmationEmail({ user_id, book_title, due_date }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }
        const subject = 'Renovação de empréstimo confirmada!';
        const dueDateStr = new Date(due_date).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Olá, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Sua renovação do livro <b>"${book_title}"</b> foi confirmada com sucesso.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/renewal.png" alt="Carlos Magno" style="height: 200px; margin-bottom: 10px;" />
            </div>
            <p><b>Nova data limite para devolução:</b> ${dueDateStr}</p>
            <p>Fique atento ao prazo e aproveite a leitura!</p>
            <p>Você pode acompanhar seus empréstimos e renovar novamente (até 3 vezes) pela "Área do Usuário" no site.</p>
            <p><b>Bons estudos!</b></p>
        `;
        const textContent = `Olá, ${user.name || 'colega'}!\n\nSua renovação do livro "${book_title}" foi confirmada.\nNova data limite para devolução: ${dueDateStr}\nFique atento ao prazo e aproveite a leitura!\nVocê pode acompanhar seus empréstimos e renovar novamente (até 3 vezes) pela "Área do Usuário" no site.\nBons estudos!`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'renewal_confirmation'
        });
    }

    /**
     * Envia email de confirmação de extensão de empréstimo
     */
    async sendExtensionConfirmationEmail({ user_id, book_title, due_date }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }
        const subject = 'Extensão de empréstimo confirmada!';
        const dueDateStr = new Date(due_date).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Olá, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Sua extensão do livro <b>"${book_title}"</b> foi confirmada com sucesso.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/renewal.png" alt="Carlos Magno" style="height: 200px; margin-bottom: 10px;" />
            </div>
            <p><b>Nova data limite para devolução:</b> ${dueDateStr}</p>
            <p>Durante esse período, você está sujeito a ser cutucado por outro aluno que deseja o livro. Caso isso aconteça, o prazo será reduzido para 5 dias e você será notificado por email.</p>
            <p>Fique atento ao prazo e aproveite a leitura!</p>
            <p>Você pode acompanhar seus empréstimos pela "Área do Usuário" no site.</p>
            <p><b>Bons estudos!</b></p>
        `;
        const textContent = `Olá, ${user.name || 'colega'}!\n\nSua extensão do livro "${book_title}" foi confirmada.\nNova data limite para devolução: ${dueDateStr}\nAtenção: Ao estender o empréstimo, o prazo foi reduzido para 5 dias para que outros alunos possam acessar o livro.\nDurante esse período, você está sujeito a ser cutucado por outro aluno que deseja o livro. Caso isso aconteça, o prazo será reduzido para 5 dias e você será notificado por email.\nFique atento ao prazo e aproveite a leitura!\nVocê pode acompanhar seus empréstimos pela Área do Usuário no site.\nBons estudos!`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'extension_confirmation'
        });
    }


    /**
     * Envia email de nudge para extensão (prazo reduzido)
     */
    async sendExtensionNudgeEmail({ user_id, book_title, new_due_date }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuário ${user_id} não encontrado ou sem email`);
            return false;
        }
        const subject = 'Você foi cutucado: o seu prazo de extensão foi reduzido';
        const dueDateStr = new Date(new_due_date).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Olá, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Outro aluno solicitou o livro <b>"${book_title}"</b> que está com você.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/nudge.png" alt="Carlos Magno cutucado" style="height: 200px; margin-bottom: 10px;" />
            </div>
            <p>Por isso, o prazo de devolução foi reduzido para <b>5 dias</b> a partir de hoje.</p>
            <p><b>Nova data limite para devolução:</b> ${dueDateStr}</p>
            <p>Por favor, organize-se para devolver o livro até essa data e ajudar outros colegas a terem acesso ao material.</p>
            <p>Você pode acompanhar seus empréstimos pela "Área do Usuário" no site.</p>
            <p><b>Bons estudos!</b></p>
        `;
        const textContent = `Olá, ${user.name || 'colega'}!\n\nOutro aluno solicitou o livro "${book_title}" que está com você.\nPor isso, o prazo de devolução foi reduzido para 5 dias a partir de hoje.\nNova data limite para devolução: ${dueDateStr}\nPor favor, organize-se para devolver o livro até essa data e ajudar outros colegas a terem acesso ao material.\nVocê pode acompanhar seus empréstimos pela Área do Usuário no site.\nBons estudos!`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'extension_nudge'
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