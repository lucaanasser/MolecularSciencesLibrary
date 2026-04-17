/**
 * Responsabilidade: casos de uso principais de doadores.
 * Camada: service.
 * Entradas/Saidas: valida e delega CRUD de doadores ao model.
 * Dependencias criticas: DonatorsModel.
 */

const DonatorsModel = require('../../../../models/library/donators/DonatorsModel');

module.exports = {
    /**
     * O que faz: cria doador com validacao minima de tipo de doacao.
     * Onde e usada: controller de comandos e importacao CSV.
     * Dependencias chamadas: DonatorsModel.addDonator.
     * Efeitos colaterais: persistencia na tabela donators.
     */
    async addDonator(data) {
        const donationType = String(data?.donation_type || '').toLowerCase();
        if (!['book', 'money'].includes(donationType)) {
            throw new Error('Tipo de doação deve ser "book" ou "money"');
        }
        return DonatorsModel.addDonator({ ...data, donation_type: donationType });
    },

    /**
     * O que faz: remove um doador por id.
     * Onde e usada: controller de comandos.
     * Dependencias chamadas: DonatorsModel.removeDonator.
     * Efeitos colaterais: remove registro no banco.
     */
    async removeDonator(id) {
        return DonatorsModel.removeDonator(id);
    },

    /**
     * O que faz: lista todos os doadores.
     * Onde e usada: controller de consultas e exportacao CSV.
     * Dependencias chamadas: DonatorsModel.getAllDonators.
     * Efeitos colaterais: nenhum.
     */
    async getAllDonators() {
        return DonatorsModel.getAllDonators();
    },

    /**
     * O que faz: busca um doador por id.
     * Onde e usada: controller de consultas.
     * Dependencias chamadas: DonatorsModel.getDonatorById.
     * Efeitos colaterais: nenhum.
     */
    async getDonatorById(id) {
        return DonatorsModel.getDonatorById(id);
    },

    /**
     * O que faz: lista mural de doadores com livros.
     * Onde e usada: controller de consultas.
     * Dependencias chamadas: DonatorsModel.getAllDonatorsWithBooks.
     * Efeitos colaterais: nenhum.
     */
    async getAllDonatorsWithBooks() {
        return DonatorsModel.getAllDonatorsWithBooks();
    }
};
