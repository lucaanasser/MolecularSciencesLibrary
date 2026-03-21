const loansModel = require('../../../../models/library/LoansModel');

module.exports = {
    /**
     * Envia email de confirmacao de devolucao de livro.
     */
    async sendReturnConfirmationEmail({ user, book_title }) {
        const subject = 'Confirmacao de devolucao de livro';
        const dateStr = (new Date()).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Confirmamos a devolucao do livro <b>"${book_title}"</b> em ${dateStr}.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/return.png" alt="Carlos Magno relaxado" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Muito obrigado por colaborar com a nossa biblioteca! Esperamos te ver em breve para novos emprestimos.</p>
        `;
        const textContent = `Ola, ${user.name || 'colega'}!\n\nConfirmamos a devolucao do livro "${book_title}" em ${dateStr}.\n\nMuito obrigado por colaborar com a nossa biblioteca! Esperamos te ver em breve para novos emprestimos.\n\nEquipe Biblioteca Ciencias Moleculares`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'return_confirmation'
        });
    },

    /**
     * Envia email de confirmacao de novo emprestimo.
     */
    async sendLoanConfirmationEmail({ user, book_title }) {
        const subject = 'Confirmacao de emprestimo de livro';
        let dueDateStr = '';

        try {
            const userId = user && user.id;
            if (userId) {
                const activeLoan = await loansModel.getActiveLoanForUserAndBook(userId, book_title);
                if (activeLoan && activeLoan.due_date) {
                    dueDateStr = new Date(activeLoan.due_date).toLocaleDateString('pt-BR');
                }
            }
        } catch (err) {
            console.error('Erro ao buscar data de devolucao:', err.message);
        }

        const dateStr = (new Date()).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Confirmamos o registro do emprestimo do livro <b>"${book_title}"</b> em ${dateStr}.</p>
            ${dueDateStr ? `<p><b>Data limite para devolucao:</b> ${dueDateStr}</p>` : ''}
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/loan.png" alt="Carlos Magno lendo" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Fique atento ao prazo de devolucao e aproveite a leitura!</p>
            <p>Voce pode renovar o emprestimo diretamente pelo nosso site, na "Area do Usuario".</p>
        `;
        const textContent = `Ola, ${user.name || 'colega'}!\n\nConfirmamos o registro do emprestimo do livro "${book_title}" em ${dateStr}.\n\nFique atento ao prazo de devolucao e aproveite a leitura!\n\nEquipe Biblioteca Ciencias Moleculares`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'loan_confirmation'
        });
    },

    /**
     * Envia email de confirmacao de renovacao de emprestimo.
     */
    async sendRenewalConfirmationEmail({ user, book_title, due_date }) {
        const subject = 'Renovacao de emprestimo confirmada!';
        const dueDateStr = new Date(due_date).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Sua renovacao do livro <b>"${book_title}"</b> foi confirmada com sucesso.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/renewal.png" alt="Carlos Magno" style="height: 200px; margin-bottom: 10px;" />
            </div>
            <p><b>Nova data limite para devolucao:</b> ${dueDateStr}</p>
            <p>Fique atento ao prazo e aproveite a leitura!</p>
            <p>Voce pode acompanhar seus emprestimos e renovar novamente (ate 3 vezes) pela "Area do Usuario" no site.</p>
            <p><b>Bons estudos!</b></p>
        `;
        const textContent = `Ola, ${user.name || 'colega'}!\n\nSua renovacao do livro "${book_title}" foi confirmada.\nNova data limite para devolucao: ${dueDateStr}\nFique atento ao prazo e aproveite a leitura!\nVoce pode acompanhar seus emprestimos e renovar novamente (ate 3 vezes) pela "Area do Usuario" no site.\nBons estudos!`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'renewal_confirmation'
        });
    },

    /**
     * Envia email de confirmacao de extensao de emprestimo.
     */
    async sendExtensionConfirmationEmail({ user_id, book_title, due_date }) {
        const usersModel = require('../../../../models/library/UsersModel');
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            console.log(`🟡 [EmailService] Usuario ${user_id} nao encontrado ou sem email`);
            return false;
        }
        const subject = 'Extensao de emprestimo confirmada!';
        const dueDateStr = new Date(due_date).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
            <p>Sua extensao do livro <b>"${book_title}"</b> foi confirmada com sucesso.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/renewal.png" alt="Carlos Magno" style="height: 200px; margin-bottom: 10px;" />
            </div>
            <p><b>Nova data limite para devolucao:</b> ${dueDateStr}</p>
            <p>Durante esse periodo, voce esta sujeito a ser cutucado por outro aluno que deseja o livro. Caso isso aconteca, o prazo sera reduzido para 5 dias e voce sera notificado por email.</p>
            <p>Fique atento ao prazo e aproveite a leitura!</p>
            <p>Voce pode acompanhar seus emprestimos pela "Area do Usuario" no site.</p>
            <p><b>Bons estudos!</b></p>
        `;
        const textContent = `Ola, ${user.name || 'colega'}!\n\nSua extensao do livro "${book_title}" foi confirmada.\nNova data limite para devolucao: ${dueDateStr}\nAtencao: Ao estender o emprestimo, o prazo foi reduzido para 5 dias para que outros alunos possam acessar o livro.\nDurante esse periodo, voce esta sujeito a ser cutucado por outro aluno que deseja o livro. Caso isso aconteca, o prazo sera reduzido para 5 dias e voce sera notificado por email.\nFique atento ao prazo e aproveite a leitura!\nVoce pode acompanhar seus emprestimos pela Area do Usuario no site.\nBons estudos!`;
        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'extension_confirmation'
        });
    }
};
