/**
 * Responsabilidade: transformar linhas SQL em payloads de emprestimo com dados aninhados.
 * Camada: model.
 * Entradas/Saidas: recebe row do banco e retorna objeto loan com book/user.
 * Dependencias criticas: nenhuma.
 */

module.exports = {
    /**
     * O que faz: monta objeto de emprestimo a partir de aliases book_* e user_*.
     * Onde e usada: metodos de leitura em loanReads.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum; apenas transformacao de dados.
     */
    _parseLoanRow(row) {
        const book = {};
        const user = {};
        const loan = {};

        Object.entries(row).forEach(([key, value]) => {
            if (key.startsWith('book_')) {
                book[key.replace('book_', '')] = value;
                return;
            }
            if (key.startsWith('user_')) {
                user[key.replace('user_', '')] = value;
                return;
            }
            loan[key] = value;
        });

        if (Object.keys(book).length > 0) {
            loan.book = book;
            loan.book_id = book.id ?? loan.book_id;
        }

        if (Object.keys(user).length > 0) {
            loan.user = user;
            loan.user_id = user.id ?? loan.user_id;
        }

        return loan;
    }
};
