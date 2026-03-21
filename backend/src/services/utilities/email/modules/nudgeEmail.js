const usersModel = require('../../../../models/library/UsersModel');

module.exports = {
    /**
     * Envia email de cutucada quando alguem quer um livro.
     */
    async sendNudgeEmail({ user_id, requester_name, book_title }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuario ${user_id} nao encontrado ou sem email`);
            return false;
        }

        const subject = 'Voce foi cutucado: alguem quer esse livro!';
        const htmlContent = `
            <p>Ei! 👀</p>
            <p>Um colega esta de olho no livro ${book_title ? `"<strong>${book_title}</strong>"` : ''} que voce ainda nao devolveu... </p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/nudge.png" alt="Carlos Magno sendo cutucado" style="height: 350px; margin-bottom: 10px;" />
            </div><p>Que tal fazer a boa e devolver logo? Assim, todo mundo consegue aproveitar melhor a nossa biblioteca! </p>
            <div style="margin-top: 30px; text-align: center;">
                <span style="font-size: 48px;"></span>
                <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
                    Sua colaboracao faz a diferenca!
                </div>
            </div>
        `;

        const textContent = `Ei! 📚\n\nUm colega${requester_name ? ` (${requester_name})` : ''} esta de olho no livro ${book_title ? `"${book_title}"` : ''} que voce ainda nao devolveu... 👀\n\nQue tal fazer esse favor e devolver logo? Assim, todo mundo consegue aproveitar melhor a nossa biblioteca! 😄\n\nSua colaboracao faz a diferenca! 💜`;

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
    },

    /**
     * Envia email de nudge para extensao com prazo reduzido.
     */
    async sendExtensionNudgeEmail({ user_id, book_title, new_due_date }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuario ${user_id} nao encontrado ou sem email`);
            return false;
        }

        const subject = 'Voce foi cutucado: o seu prazo de extensao foi reduzido';
        const dueDateStr = new Date(new_due_date).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Outro aluno solicitou o livro <b>"${book_title}"</b> que esta com voce.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/nudge.png" alt="Carlos Magno cutucado" style="height: 200px; margin-bottom: 10px;" />
            </div>
            <p>Por isso, o prazo de devolucao foi reduzido para <b>5 dias</b> a partir de hoje.</p>
            <p><b>Nova data limite para devolucao:</b> ${dueDateStr}</p>
            <p>Por favor, organize-se para devolver o livro ate essa data e ajudar outros colegas a terem acesso ao material.</p>
            <p>Voce pode acompanhar seus emprestimos pela "Area do Usuario" no site.</p>
            <p><b>Bons estudos!</b></p>
        `;

        const textContent = `Ola, ${user.name || 'colega'}!\n\nOutro aluno solicitou o livro "${book_title}" que esta com voce.\nPor isso, o prazo de devolucao foi reduzido para 5 dias a partir de hoje.\nNova data limite para devolucao: ${dueDateStr}\nPor favor, organize-se para devolver o livro ate essa data e ajudar outros colegas a terem acesso ao material.\nVoce pode acompanhar seus emprestimos pela Area do Usuario no site.\nBons estudos!`;

        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'extension_nudge'
        });
    }
};
