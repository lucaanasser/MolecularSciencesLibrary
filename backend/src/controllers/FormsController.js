const FormsService = require('../services/FormsService');

const FormsController = {
    async submitForm(req, res) {
        try {
            const { email, subject, message, type } = req.body;
            if (!email || !subject || !message || !type) {
                return res.status(400).json({ error: 'Campos obrigatórios: email, subject, message, type.' });
            }
            await FormsService.sendUserConfirmationEmail({ email, subject, message, type });
            res.status(200).json({ success: true });
        } catch (err) {
            console.error('🔴 [FormsController] Erro ao enviar email de confirmação:', err.message);
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = FormsController;
