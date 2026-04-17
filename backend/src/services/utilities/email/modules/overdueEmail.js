/**
 * Responsabilidade: casos de uso de email para atraso e vencimento proximo.
 * Camada: service.
 * Entradas/Saidas: recebe dados de usuario/livros e envia email com template apropriado.
 * Dependencias criticas: UsersModel e metodos base de EmailService.
 */

const usersModel = require('../../../../models/library/UsersModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Envia email de atraso para um usuario.
     */
    async sendOverdueEmail({ user_id, books }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            log.warn('Usuario sem email para notificacao de atraso', { user_id });
            return false;
        }

        const subject = 'Aviso de atraso: O Carlos Magno esta com saudades dos livros dele!';
        const booksList = books.map(b =>
            `<li><b>${b.book_title || b.book_id}</b> (Data limite: ${new Date(b.due_date).toLocaleDateString('pt-BR')})</li>`
        ).join('');
        const textBooksList = books.map(b =>
            `- ${b.book_title || b.book_id} (Data limite: ${new Date(b.due_date).toLocaleDateString('pt-BR')})`
        ).join('\n');

        const htmlContent = `
            <p>Oh nao, parece que voce esqueceu de devolver algum(ns) livro(s)...</p>
            <ul>${booksList}</ul>
            <div style="text-align: center;">
            <img src="https://bibliotecamoleculares.com/images/email-images/overdue.png" alt="Carlos Magno esquecido" style="height: 350px; margin-bottom: 10px;" />
            </div>
            <p>Lembre-se que outros colegas podem estar precisando desses materiais para os estudos. A devolucao em dia ajuda toda a comunidade academica!</p>
            <div style="margin-top: 30px; text-align: center;">
                <span style="font-size: 48px;"></span>
                <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
                    Sua colaboracao faz a diferenca!
                </div>
            </div>
        `;

        const textContent = `O(s) livro(s) abaixo estao em atraso:\n${textBooksList}\n\nPor favor, devolva o(s) livro(s) o quanto antes.\n\nObrigado!\nEquipe Biblioteca Ciencias Moleculares`;

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
    },

    /**
     * Envia email de lembrete de devolucao proxima.
     */
    async sendDueSoonEmail({ user_id, book_title, due_date, days_left }) {
        const user = await usersModel.getUserById(user_id);
        if (!user || !user.email) {
            log.warn('Usuario sem email para lembrete de vencimento', { user_id });
            return false;
        }

        const subject = days_left === 1
            ? 'Atencao: Ultimo dia para devolver o livro!'
            : `Lembrete: Faltam ${days_left} dias para devolver o livro!`;

        const dueDateStr = new Date(due_date).toLocaleDateString('pt-BR');
        const htmlContent = `
            <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
            <p>O prazo para devolucao do livro <b>"${book_title}"</b> esta se aproximando.</p>
            <div style="text-align: center;">
                <img src="https://bibliotecamoleculares.com/images/email-images/reminder.png" alt="Carlos Magno" style="height: 200px; margin-bottom: 10px;" />
            </div>
            <p><b>Data limite para devolucao:</b> ${dueDateStr}</p>
            <p>${days_left === 1 ? 'Hoje e o ultimo dia para devolver o livro! Nao deixe para depois.' : `Faltam apenas ${days_left} dias para o prazo final.`}</p>
            <p>Se precisar renovar ou estender, acesse a "Area do Usuario" no site.</p>
            <p><b>Bons estudos!</b></p>
        `;

        const textContent = `Ola, ${user.name || 'colega'}!\n\nO prazo para devolucao do livro "${book_title}" esta se aproximando.\nData limite: ${dueDateStr}\n${days_left === 1 ? 'Hoje e o ultimo dia para devolver o livro!' : `Faltam apenas ${days_left} dias para o prazo final.`}\nSe precisar renovar ou estender, acesse a "Area do Usuario" no site.`;

        const html = this.generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
        return await this.sendMail({
            to: user.email,
            subject,
            text: textContent,
            html,
            type: 'due_soon'
        });
    }
};
