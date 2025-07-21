const EmailService = require('./EmailService');

class FormsService {
    /**
     * Envia email de confirmação para o usuário que preencheu o formulário
     * @param {Object} params
     * @param {string} params.email - Email do usuário
     * @param {string} params.subject - Assunto do formulário
     * @param {string} params.message - Mensagem escrita pelo usuário
     * @param {string} params.type - Tipo do formulário (feedback, sugestao, doacao)
     */
    async sendUserConfirmationEmail({ email, subject, message, type }) {
        // Mensagem padrão de confirmação
        const defaultMsg =
            'Recebemos sua mensagem e em breve você receberá um retorno da equipe da Biblioteca. Obrigado por contribuir!';
        // Monta o conteúdo do email
        const htmlContent = `<p>${message.replace(/\n/g, '<br>')}</p><hr><p>${defaultMsg}</p>`;
        const textContent = `${message}\n\n${defaultMsg}`;
        // Usa o template padrão do EmailService
        const html = EmailService.generateEmailTemplate({
            subject,
            content: htmlContent,
            isAutomatic: true
        });
        // Envia o email para o usuário
        await EmailService.sendMail({
            to: email,
            subject,
            text: textContent,
            html,
            type: 'form_confirmation',
            attachments: [
                {
                    filename: 'Biblioteca do CM.png',
                    path: './public/images/Biblioteca do CM.png',
                    cid: 'logo'
                }
            ]
        });
    }
}

module.exports = new FormsService();