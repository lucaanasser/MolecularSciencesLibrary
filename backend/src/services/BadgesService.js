const badgesModel = require('../models/BadgesModel');
const usersModel = require('../models/UsersModel');
const loansModel = require('../models/LoansModel');
// Se houver um model para doações, importe aqui
// const donationsModel = require('../models/DonationsModel');

class BadgesService {
    async createBadge(badge) {
        return await badgesModel.createBadge(badge);
    }

    async getAllBadges() {
        return await badgesModel.getAllBadges();
    }

    async getBadgeById(id) {
        return await badgesModel.getBadgeById(id);
    }

    async getBadgeByName(name) {
        return await badgesModel.getBadgeByName(name);
    }

    /**
     * Adiciona vários badges de uma vez (array de objetos badge)
     */
    async addBadges(badgesArray) {
        const results = [];
        for (const badge of badgesArray) {
            // Verifica se já existe pelo nome
            const exists = await this.getBadgeByName(badge.name);
            if (!exists) {
                const id = await this.createBadge(badge);
                results.push({ ...badge, id });
            } else {
                results.push({ ...badge, id: exists.id, alreadyExists: true });
            }
        }
        return results;
    }

    /**
     * Retorna os badges desbloqueados e bloqueados de um usuário
     * @param {number} userId
     * @returns {Promise<{badge: object, unlocked: boolean}[]>}
     */
    async getUserBadges(userId) {
        const allBadges = await this.getAllBadges();
        const unlocked = await this.getUnlockedBadgesForUser(userId, allBadges);
        return allBadges.map(badge => ({
            badge,
            unlocked: unlocked.includes(badge.name)
        }));
    }

    /**
     * Lógica para determinar quais badges o usuário desbloqueou
     * @param {number} userId
     * @param {Array} allBadges
     * @returns {Promise<string[]>} nomes dos badges desbloqueados
     */
    async getUnlockedBadgesForUser(userId, allBadges) {
        const unlocked = [];
        // Empréstimos
        const loans = await loansModel.getLoansByUser(userId);
        // Badge: "Primeiro Empréstimo"
        if (loans.length > 0) unlocked.push('Primeiro Empréstimo');
        // Badge: "Leitor Frequente" (10 empréstimos)
        if (loans.length >= 10) unlocked.push('Leitor Frequente');
        // Badge: "Devolução em Dia" (todas devoluções no prazo)
        if (loans.length > 0 && loans.every(l => l.returned_at && (!l.is_overdue || l.is_overdue === 0))) unlocked.push('Devolução em Dia');
        // Badge: "Sem Atrasos" (nunca atrasou)
        if (loans.length > 0 && loans.every(l => !l.is_overdue || l.is_overdue === 0)) unlocked.push('Sem Atrasos');
        // Badge: "Primeiro Livro Devolvido"
        if (loans.some(l => l.returned_at)) unlocked.push('Primeiro Livro Devolvido');
        // Badge: "Leitor Assíduo" (5 devoluções)
        if (loans.filter(l => l.returned_at).length >= 5) unlocked.push('Leitor Assíduo');
        // Badge: "Maratona de Leitura" (3 empréstimos em uma semana)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (loans.filter(l => new Date(l.borrowed_at) > oneWeekAgo).length >= 3) unlocked.push('Maratona de Leitura');
        // Badge: "Usuário Ativo" (acessou 30 dias seguidos)
        const user = await usersModel.getUserById(userId);
        if (user && user.days_active && user.days_active >= 30) unlocked.push('Usuário Ativo');
        // Badge: "Primeira Doação" e "Doador Frequente" (simulado, pois não há donationsModel)
        // Supondo que user.donations existe
        if (user && user.donations && user.donations > 0) unlocked.push('Primeira Doação');
        if (user && user.donations && user.donations >= 5) unlocked.push('Doador Frequente');
        // Badge: "Notificações Lidas" (leu 10 notificações)
        const NotificationsModel = require('../models/NotificationsModel');
        const notifications = await NotificationsModel.getNotificationsByUser(userId);
        if (notifications.filter(n => n.status === 'read').length >= 10) unlocked.push('Notificações Lidas');
        // Badge: "Sem Notificações Não Lidas"
        if (notifications.length > 0 && notifications.every(n => n.status === 'read')) unlocked.push('Sem Notificações Não Lidas');
        // Badge: "Primeiro Livro Emprestado de Cada Área" (exemplo: áreas distintas)
        const areas = new Set(loans.map(l => l.area).filter(Boolean));
        if (areas.size >= 3) unlocked.push('Explorador de Áreas');
        // Badge: "Primeiro Livro de Cada Autor" (exemplo: autores distintos)
        const authors = new Set(loans.map(l => l.book_authors).filter(Boolean));
        if (authors.size >= 5) unlocked.push('Colecionador de Autores');
        // Badge: "Primeiro Livro Devolvido em Menos de 2 Dias"
        if (loans.some(l => l.returned_at && (new Date(l.returned_at) - new Date(l.borrowed_at)) < 2 * 24 * 60 * 60 * 1000)) unlocked.push('Devolução Relâmpago');
        // Badge: "CMer completo" (pegou um livro de cada área existente)
        const BooksModel = require('../models/BooksModel');
        const allBooks = await BooksModel.getBooks();
        const allAreas = new Set(allBooks.map(b => b.area).filter(Boolean));
        const userAreas = new Set(loans.map(l => l.area).filter(Boolean));
        if (allAreas.size > 0 && userAreas.size === allAreas.size) unlocked.push('CMer completo');
        return unlocked;
    }
}

module.exports = new BadgesService();