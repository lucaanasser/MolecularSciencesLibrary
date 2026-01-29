const FormsService = require('../../services/utilities/FormsService');

const FormsController = {
    async submitForm(req, res) {
        try {
            const { email, subject, message, type } = req.body;
            if (!email || !subject || !message || !type) {
                return res.status(400).json({ error: 'Campos obrigatórios: email, subject, message, type.' });
            }
            // Envia email de confirmação para o usuário
            await FormsService.sendUserConfirmationEmail({ email, subject, message, type });
            // Envia cópia para a biblioteca
            await FormsService.sendLibraryCopyEmail({ email, subject, message, type });
            res.status(200).json({ success: true });
        } catch (err) {
            console.error('🔴 [FormsController] Erro ao enviar emails:', err.message);
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = FormsController;
