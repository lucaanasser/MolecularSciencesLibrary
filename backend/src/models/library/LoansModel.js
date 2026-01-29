const { getQuery, allQuery, runQuery } = require('../../database/db');

/**
 * Model responsável pelo acesso ao banco de dados para empréstimos de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

module.exports = {
    // Cria um novo empréstimo
    createLoan: async (book_id, student_id, due_date) => {
        console.log(`🔵 [LoansModel] Criando empréstimo (transação): book_id=${book_id}, student_id=${student_id}`);
        let dueDateSql = due_date;
        if (due_date && typeof due_date === 'string') {
            dueDateSql = due_date.replace('T', ' ').replace(/\..*$/, '');
        }
        const { runInTransaction } = require('../../database/db');
        const queries = [
            [
                `INSERT INTO loans (book_id, student_id, due_date, renewals) VALUES (?, ?, ?, 0)`,
                [book_id, student_id, dueDateSql]
            ]
        ];
        try {
            await runInTransaction(queries);
            console.log(`� [LoansModel] Empréstimo criado e livro atualizado em transação.`);
            return { success: true };
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro na transação de empréstimo: ${err.message}`);
            throw err;
        }
    },

    // Cria um empréstimo de uso interno (já devolvido)
    // Usa student_id = 0 para indicar uso interno (não pode ser NULL por constraint)
    createInternalUseLoan: async (book_id, due_date) => {
        console.log(`🔵 [LoansModel] Criando empréstimo de uso interno: book_id=${book_id}`);
        let dueDateSql = due_date;
        if (due_date && typeof due_date === 'string') {
            dueDateSql = due_date.replace('T', ' ').replace(/\..*$/, '');
        }
        return runQuery(
            `INSERT INTO loans (book_id, student_id, due_date, renewals, returned_at) 
             VALUES (?, 0, ?, 0, CURRENT_TIMESTAMP)`,
            [book_id, dueDateSql]
        ).then((result) => {
            console.log(`🟢 [LoansModel] Empréstimo de uso interno criado com ID: ${result.lastID}`);
            return { success: true, loan_id: result.lastID };
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao criar empréstimo de uso interno: ${err.message}`);
            throw err;
        });
    },

    // Devolve um empréstimo e atualiza status do livro em transação
    returnBookWithUpdate: async (loan_id, book_id) => {
        console.log(`� [LoansModel] Devolvendo empréstimo (transação): loan_id=${loan_id}, book_id=${book_id}`);
        const { runInTransaction } = require('../../database/db');
        const queries = [
            [
                `UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
                [loan_id]
            ],
            [
                `UPDATE books SET is_reserved = 0 WHERE id = ?`,
                [book_id]
            ]
        ];
        try {
            await runInTransaction(queries);
            console.log(`🟢 [LoansModel] Devolução registrada e livro atualizado em transação.`);
            return { success: true };
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro na transação de devolução: ${err.message}`);
            throw err;
        }
    },
    // Busca todos os empréstimos com detalhes do usuário e do livro
    getLoansWithDetails: () => {
        console.log("🔵 [LoansModel] Buscando todos os empréstimos com detalhes");
        return allQuery(
            `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date, l.is_extended, l.last_nudged_at,
                    u.name as user_name, u.email as user_email,
                    b.title as book_title, b.authors as book_authors
             FROM loans l
             LEFT JOIN users u ON l.student_id = u.id
             LEFT JOIN books b ON l.book_id = b.id
             ORDER BY l.borrowed_at DESC`,
            []
        ).then((rows) => {
            console.log(`🟢 [LoansModel] Empréstimos encontrados: ${rows.length}`);
            return rows;
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimos: ${err.message}`);
            throw err;
        });
    },

    // Busca empréstimos de um usuário específico
    getLoansByUser: (user_id) => {
        console.log(`🔵 [LoansModel] Buscando empréstimos do usuário: ${user_id}`);
        return allQuery(
            `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date, l.is_extended, l.last_nudged_at,
                    b.title as book_title, b.authors as book_authors
             FROM loans l
             LEFT JOIN books b ON l.book_id = b.id
             WHERE l.student_id = ?
             ORDER BY l.borrowed_at DESC`,
            [user_id]
        ).then((rows) => {
            // Corrige o tipo de returned_at para null se vier como string 'null'
            rows.forEach(row => {
                if (row.returned_at === 'null') row.returned_at = null;
            });
            return rows;
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimos do usuário: ${err.message}`);
            throw err;
        });
    },

    // Registra devolução de um empréstimo
    returnLoan: (loan_id) => {
        console.log(`🔵 [LoansModel] Registrando devolução do empréstimo: loan_id=${loan_id}`);
        return runQuery(
            `UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
            [loan_id]
        ).then((result) => {
            console.log(`🟢 [LoansModel] Devolução registrada para empréstimo id: ${loan_id}`);
            return { updated: result.changes };
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao registrar devolução: ${err.message}`);
            throw err;
        });
    },

    // Devolve um empréstimo
    returnBook: (loan_id) => {
        console.log(`🔵 [LoansModel] Devolvendo empréstimo: loan_id=${loan_id}`);
        return runQuery(
            `UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
            [loan_id]
        ).then((result) => {
            if (result.changes === 0) {
                throw new Error('Empréstimo não encontrado ou já devolvido.');
            }
            console.log(`🟢 [LoansModel] Empréstimo devolvido com sucesso: loan_id=${loan_id}`);
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao devolver empréstimo: ${err.message}`);
            throw err;
        });
    },

    // Busca o último empréstimo criado para um livro (sem JOIN)
    getLastLoanByBookId: (book_id) => {
        console.log(`🔵 [LoansModel] Buscando último empréstimo para book_id=${book_id} (tipo: ${typeof book_id})`);
        // Primeiro busca TODOS os empréstimos para ver o que tem no banco
        return allQuery(
            `SELECT id, book_id, student_id, borrowed_at, returned_at FROM loans ORDER BY borrowed_at DESC LIMIT 5`,
            []
        ).then((allRows) => {
            if (allRows) {
                console.log(`🟡 [LoansModel] Últimos 5 empréstimos no banco:`, allRows.map(r => ({ id: r.id, book_id: r.book_id, book_id_type: typeof r.book_id })));
            }
            // Agora busca o específico
            return getQuery(
                `SELECT * FROM loans WHERE book_id = ? ORDER BY borrowed_at DESC LIMIT 1`,
                [book_id]
            );
        }).then((row) => {
            if (row) {
                console.log(`🟢 [LoansModel] Último empréstimo encontrado: loan_id=${row.id}, book_id=${row.book_id}, returned_at=${row.returned_at}`);
            } else {
                console.warn(`🔴 [LoansModel] Nenhum empréstimo encontrado para book_id=${book_id}`);
            }
            return row;
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao buscar último empréstimo: ${err.message}`);
            throw err;
        });
    },

    // Verifica se existe empréstimo ativo para um livro
    hasActiveLoan: (book_id) => {
        console.log(`🔵 [LoansModel] Verificando empréstimo ativo para book_id=${book_id}`);
        return getQuery(
            `SELECT id FROM loans WHERE book_id = ? AND returned_at IS NULL`,
            [book_id]
        ).then((row) => {
            if (row) {
                console.warn(`🟡 [LoansModel] Livro ${book_id} já está emprestado`);
            } else {
                console.log(`🟢 [LoansModel] Livro ${book_id} disponível para empréstimo`);
            }
            return !!row; // true se existe empréstimo ativo
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao verificar empréstimo ativo: ${err.message}`);
            throw err;
        });
    },

    // Busca empréstimo ativo de um usuário para um livro
    getActiveLoanByUserAndBook: (user_id, book_id) => {
        return getQuery(
            `SELECT id as loan_id FROM loans WHERE student_id = ? AND book_id = ? AND returned_at IS NULL`,
            [user_id, book_id]
        ).then((row) => {
            return row;
        }).catch((err) => {
            throw err;
        });
    },

    // Busca todos os empréstimos ativos (não devolvidos) com detalhes do usuário e do livro
    getActiveLoansWithDetails: () => {
        console.log("🔵 [LoansModel] Buscando empréstimos ativos com detalhes");
        return allQuery(
            `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date, l.is_extended, l.last_nudged_at,
                    u.name as user_name, u.email as user_email, u.NUSP as user_nusp,
                    b.title as book_title, b.authors as book_authors
             FROM loans l
             LEFT JOIN users u ON l.student_id = u.id
             LEFT JOIN books b ON l.book_id = b.id
             WHERE l.returned_at IS NULL
             ORDER BY l.borrowed_at DESC`,
            []
        ).then((rows) => {
            console.log(`🟢 [LoansModel] Empréstimos ativos encontrados: ${rows.length}`);
            return rows;
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimos ativos: ${err.message}`);
            throw err;
        });
    },

    // Busca empréstimo ativo para um livro (independente do usuário)
    getActiveLoanByBookId: (bookId) => {
        console.log(`🔵 [LoansModel] Buscando empréstimo ativo para o livro ${bookId}`);
        return getQuery(
            `SELECT id as loan_id FROM loans WHERE book_id = ? AND returned_at IS NULL`,
            [bookId]
        ).then((row) => {
            if (row) {
                console.log(`🟢 [LoansModel] Empréstimo ativo encontrado:`, row);
            } else {
                console.warn(`🟡 [LoansModel] Nenhum empréstimo ativo encontrado para o livro ${bookId}`);
            }
            return row;
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimo ativo: ${err.message}`);
            throw err;
        });
    },

    // Renova um empréstimo
    renewLoan: (loan_id, renewal_days) => {
        console.log(`🔵 [LoansModel] Renovando empréstimo: loan_id=${loan_id}, renewal_days=${renewal_days}`);
        // Atualiza due_date para a data atual + renewal_days (sempre a partir de agora)
        return runQuery(
            `UPDATE loans SET renewals = renewals + 1, due_date = datetime('now', '+' || ? || ' days') WHERE id = ? AND returned_at IS NULL`,
            [renewal_days, loan_id]
        ).then((result) => {
            if (result.changes === 0) {
                throw new Error('Empréstimo não encontrado ou já devolvido.');
            }
            console.log(`🟢 [LoansModel] Empréstimo renovado com sucesso: loan_id=${loan_id}`);
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao renovar empréstimo: ${err.message}`);
            throw err;
        });
    },

    // Verifica se um livro está emprestado
    isBookLoaned: (book_id) => {
        return getQuery(
            `SELECT id FROM loans WHERE book_id = ? AND returned_at IS NULL`,
            [book_id]
        ).then((row) => {
            return !!row;
        }).catch((err) => {
            throw err;
        });
    },

    // Busca todos os empréstimos ativos (não devolvidos)
    getActiveLoans: () => {
        return allQuery(
            `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date, l.is_extended, l.last_nudged_at,
                    u.name as user_name, u.email as user_email,
                    b.title as book_title, b.authors as book_authors
             FROM loans l
             LEFT JOIN users u ON l.student_id = u.id
             LEFT JOIN books b ON l.book_id = b.id
             WHERE l.returned_at IS NULL
             ORDER BY l.borrowed_at DESC`,
            []
        ).then((rows) => {
            return rows;
        }).catch((err) => {
            throw err;
        });
    },

    // Busca um empréstimo pelo ID
    getLoanById: (loan_id) => {
        return getQuery(`SELECT * FROM loans WHERE id = ?`, [loan_id]).then((row) => {
            return row;
        }).catch((err) => {
            throw err;
        });
    },
    // Estende o prazo de um empréstimo
    extendLoanBlock: (loan_id, added_days) => {
        return runQuery(
            `UPDATE loans SET is_extended = 1, due_date = datetime(due_date, '+'|| ? ||' days') WHERE id = ? AND returned_at IS NULL AND is_extended = 0`,
            [added_days, loan_id]
        ).then((result) => {
            if (result.changes === 0) {
                throw new Error('Não foi possível estender (já estendido ou devolvido).');
            }
        }).catch((err) => {
            throw err;
        });
    },
    // ...existing code...
    // Registra o último nudge enviado para um empréstimo
    setLastNudged: (loan_id) => {
        return runQuery(
            `UPDATE loans SET last_nudged_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [loan_id]
        ).then(() => {
            return;
        }).catch((err) => {
            throw err;
        });
    },
    // Encurta o prazo de um empréstimo estendido para 5 dias a partir de agora (apenas se prazo atual for maior que 5 dias)
    shortenDueDateIfLongerThan: (loan_id, targetDaysFromNow) => {
        return runQuery(
            `UPDATE loans
                    SET due_date = datetime('now', '+'|| ? ||' days')
                    WHERE id = ?
                      AND returned_at IS NULL
                      AND is_extended = 1
                      AND (due_date IS NULL OR due_date > datetime('now', '+'|| ? ||' days'))`,
            [targetDaysFromNow, loan_id, targetDaysFromNow]
        ).then((result) => {
            return result.changes > 0;
        }).catch((err) => {
            throw err;
        });
    },
};