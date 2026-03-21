/**
 * Responsabilidade: consultas de persistencia do dominio de emprestimos.
 * Camada: model.
 * Entradas/Saidas: executa leituras SQL e retorna payloads normalizados.
 * Dependencias criticas: db (getQuery/allQuery) e logger compartilhado.
 */

const { getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: busca emprestimos por livro, com opcao de apenas ativos.
     * Onde e usada: LoansService.getLoansByBookId e fluxo de devolucao.
     * Dependencias chamadas: allQuery e _parseLoanRow.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getLoansByBookId(book_id, activeOnly = false) {
        log.start('Buscando emprestimos por livro', { book_id, activeOnly });

        let sql = `SELECT l.*, ${this.bookSelect}, ${this.userSelect}
            FROM loans l
            LEFT JOIN books b ON l.book_id = b.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.book_id = ?`;

        const params = [book_id];
        if (activeOnly) {
            sql += ' AND l.returned_at IS NULL';
        }
        sql += ' ORDER BY l.borrowed_at DESC';

        try {
            const rows = await allQuery(sql, params);
            log.success('Emprestimos por livro retornados', { book_id, activeOnly, total: rows.length });

            if (activeOnly && rows.length > 1) {
                log.error('Integridade invalida: multiplos emprestimos ativos para o mesmo livro', {
                    book_id,
                    total_active: rows.length
                });
                throw new Error(`Integridade de dados comprometida: multiplos emprestimos ativos para o mesmo livro (ID ${book_id}). Contate o suporte.`);
            }

            return rows.map((row) => this._parseLoanRow(row));
        } catch (err) {
            log.error('Erro ao buscar emprestimos por livro', { err: err.message, book_id, activeOnly });
            throw err;
        }
    },

    /**
     * O que faz: lista todos os emprestimos com filtro de status.
     * Onde e usada: LoansService.getLoans e rotas de consulta.
     * Dependencias chamadas: allQuery e _parseLoanRow.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getAllLoans(status = 'all') {
        log.start('Buscando todos os emprestimos', { status });

        let sql = `
            SELECT l.*, ${this.bookSelect}, ${this.userSelect}
            FROM loans l
            LEFT JOIN books b ON l.book_id = b.id
            LEFT JOIN users u ON l.user_id = u.id`;

        if (status === 'active') {
            sql += ' WHERE l.returned_at IS NULL';
        } else if (status === 'returned') {
            sql += ' WHERE l.returned_at IS NOT NULL';
        }
        sql += ' ORDER BY l.borrowed_at DESC';

        try {
            const rows = await allQuery(sql);
            log.success('Lista de emprestimos retornada', { status, total: rows.length });
            return rows.map((row) => this._parseLoanRow(row));
        } catch (err) {
            log.error('Erro ao listar emprestimos', { err: err.message, status });
            throw err;
        }
    },

    /**
     * O que faz: busca emprestimos de um usuario por status.
     * Onde e usada: LoansService.getUserLoans.
     * Dependencias chamadas: allQuery e _parseLoanRow.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getLoansByUser(user_id, status = 'all') {
        log.start('Buscando emprestimos por usuario', { user_id, status });

        let sql = `
            SELECT l.*, ${this.bookSelect}
            FROM loans l
            LEFT JOIN books b ON l.book_id = b.id
            WHERE l.user_id = ?`;

        const params = [user_id];
        if (status === 'active') {
            sql += ' AND l.returned_at IS NULL';
        } else if (status === 'returned') {
            sql += ' AND l.returned_at IS NOT NULL';
        }
        sql += ' ORDER BY l.borrowed_at DESC';

        try {
            const rows = await allQuery(sql, params);
            log.success('Emprestimos por usuario retornados', { user_id, status, total: rows.length });
            return rows.map((row) => this._parseLoanRow(row));
        } catch (err) {
            log.error('Erro ao buscar emprestimos por usuario', { err: err.message, user_id, status });
            throw err;
        }
    },

    /**
     * O que faz: busca emprestimo por ID com dados de livro e usuario.
     * Onde e usada: fluxos de renovacao, extensao e notificacoes.
     * Dependencias chamadas: getQuery e _parseLoanRow.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getLoanById(loan_id) {
        log.start('Buscando emprestimo por ID', { loan_id });

        const sql = `
            SELECT l.*, ${this.bookSelect}, ${this.userSelect}
            FROM loans l
            LEFT JOIN books b ON l.book_id = b.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.id = ?`;

        try {
            const row = await getQuery(sql, [loan_id]);
            if (!row) {
                log.warn('Emprestimo nao encontrado por ID', { loan_id });
                return null;
            }

            log.success('Emprestimo encontrado por ID', { loan_id });
            return this._parseLoanRow(row);
        } catch (err) {
            log.error('Erro ao buscar emprestimo por ID', { err: err.message, loan_id });
            throw err;
        }
    },

    /**
     * O que faz: conta emprestimos por status.
     * Onde e usada: relatorios e dashboards.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura agregada.
     */
    async countLoans(status = 'all') {
        let sql = 'SELECT COUNT(*) as count FROM loans';
        if (status === 'active') {
            sql += ' WHERE returned_at IS NULL';
        } else if (status === 'returned') {
            sql += ' WHERE returned_at IS NOT NULL';
        }

        try {
            const result = await getQuery(sql);
            const count = result?.count || 0;
            log.success('Contagem de emprestimos concluida', { status, count });
            return count;
        } catch (err) {
            log.error('Erro ao contar emprestimos', { err: err.message, status });
            throw err;
        }
    },

    /**
     * O que faz: busca emprestimo ativo por usuario e titulo do livro (compatibilidade de email).
     * Onde e usada: EmailService.sendLoanConfirmationEmail.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getActiveLoanForUserAndBook(user_id, book_title) {
        const sql = `
            SELECT l.*
            FROM loans l
            INNER JOIN books b ON b.id = l.book_id
            WHERE l.user_id = ?
              AND l.returned_at IS NULL
              AND b.title = ?
            ORDER BY l.borrowed_at DESC
            LIMIT 1`;

        try {
            return await getQuery(sql, [user_id, book_title]);
        } catch (err) {
            log.error('Erro ao buscar emprestimo ativo por usuario e livro', {
                err: err.message,
                user_id
            });
            throw err;
        }
    }
};
