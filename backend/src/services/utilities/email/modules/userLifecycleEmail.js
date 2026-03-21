const usersModel = require('../../../../models/library/UsersModel');

module.exports = {
    /**
     * Envia email personalizado.
     */
    async sendCustomEmail({ user_id, subject, message, isAutomatic = false }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuario ${user_id} nao encontrado ou sem email`);
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
    },

    /**
     * Envia email para multiplos usuarios (broadcast).
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
                console.error(`🔴 [EmailService] Erro ao enviar email para usuario ${user_id}:`, error.message);
                results.push({ user_id, success: false, error: error.message });
            }
        }

        return results;
    },

    /**
     * Envia email de boas-vindas para novos usuarios.
     */
    async sendWelcomeEmail({ user_id }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuario ${user_id} nao encontrado ou sem email`);
            return false;
        }

        const subject = 'Bem-vindo a Biblioteca Ciencias Moleculares!';

        const jwt = require('jsonwebtoken');
        const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
        const resetToken = jwt.sign({ id: user.id, email: user.email, type: 'first_access' }, SECRET, { expiresIn: '24h' });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/redefinir-senha?token=${resetToken}`;

        const htmlContent = `
            <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Seja muito bem-vindo(a) a nossa biblioteca! O Carlos Magno esta muito feliz em te ver por aqui!</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/welcome.png" alt="Carlos Magno e novo usuario" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Agora voce pode:</p>
            <ul>
                <li>Pesquisar e reservar livros</li>
                <li>Acompanhar seus emprestimos</li>
                <li>Receber notificacoes sobre prazos de devolucao</li>
                <li>E muito mais!</li>
            </ul>
            <hr>
            <p>Para acessar sua conta, e necessario criar uma senha de acesso. <strong>Atencao: Nao use senhas sensiveis, pois estamos em uma versao teste e nao garantimos a seguranca dos dados.</strong></p>
            <p><a href="${resetUrl}" style="color: #b657b3; font-weight: bold;">Clique aqui para cadastrar sua senha</a></p>
            <p style="font-size: 13px; color: #555;">Este link expira em 24 horas. Caso tenha expirado use a funcao de: esqueci minha senha</p>
            <p>Se tiver alguma duvida, nao hesite em nos contactar.</p>
            <div style="margin-top: 30px; text-align: center;">
                <span style="font-size: 48px;"></span>
                <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
                    Bons estudos!
                </div>
            </div>
        `;

        const textContent = `Ola, ${user.name || 'colega'}!\n\nSeja muito bem-vindo(a) a nossa biblioteca! 🎉\n\nAgora voce pode pesquisar e reservar livros, acompanhar seus emprestimos, receber notificacoes sobre prazos e muito mais!\n\nPara acessar sua conta, crie sua senha de acesso: ${resetUrl}\n(Este link expira em 24 horas)\n\nSe tiver alguma duvida, nao hesite em nos contatar.\n\nBons estudos!\nEquipe Biblioteca Ciencias Moleculares`;

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
    },

    /**
     * Envia email de redefinicao de senha.
     */
    async sendPasswordResetEmail({ user_id, resetToken }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuario ${user_id} nao encontrado ou sem email`);
            return false;
        }
        const subject = 'Redefinicao de senha';
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/redefinir-senha?token=${resetToken}`;
        const htmlContent = `
            <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Recebemos uma solicitacao para redefinir sua senha.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/password.png" alt="Carlos Magno esquecido" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Para criar uma nova senha, clique no link abaixo. <strong>Atencao: Nao use senhas sensiveis, pois estamos em uma versao teste e nao garantimos a seguranca dos dados.</strong></p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${resetUrl}" style="background: #b657b3; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 18px;">Redefinir minha senha</a>
            </div>
            <p>Se voce nao solicitou, ignore este email.</p>
        `;
        const textContent = `Ola, ${user.name || 'colega'}!\n\nRecebemos uma solicitacao para redefinir sua senha. Para criar uma nova senha, acesse: ${resetUrl}\n\nSe voce nao solicitou, ignore este email.\n\nEquipe Biblioteca Ciencias Moleculares`;

        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'reset_password'
        });
    },

    /**
     * Notifica administradores ativos sobre novo pedido de cadastro.
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
            console.log(`🟢 [EmailService] Notificacao de cadastro enviada para: ${ADMIN_EMAIL}`);
            return true;
        } catch (error) {
            console.error('🔴 [EmailService] Erro em sendRegistrationRequestNotification:', error.message);
            return false;
        }
    }
};
