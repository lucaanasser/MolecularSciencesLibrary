const EmailService = require('../services/EmailService');

(async () => {
    try {
        await EmailService.sendMail({
            to: 'lucanasser@protonmail.com',
            subject: 'Teste de envio de email',
            text: 'Este é um email de teste enviado pela BibliotecaCM.',
            type: 'test'
        });
        console.log('🟢 Email de teste enviado com sucesso!');
    } catch (error) {
        console.error('🔴 Falha ao enviar email de teste:', error.message);
    }
})();