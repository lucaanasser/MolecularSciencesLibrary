const sqlite3 = require('sqlite3');
const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || 'app/database/library.db';

/**
 * Model responsável pelo acesso ao banco de dados para empréstimos de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
function getDb() {
    return new sqlite3.Database(dbPath);
}

module.exports = {
    // Cria um novo empréstimo
    createLoan: (book_id, student_id, due_date) => {
        console.log(`🔵 [LoansModel] Criando empréstimo: book_id=${book_id}, student_id=${student_id}`);
        let dueDateSql = due_date;
        if (due_date && typeof due_date === 'string') {
            // Remove o 'T' e o 'Z' do ISO, pega só a parte relevante
            dueDateSql = due_date.replace('T', ' ').replace(/\..*$/, '');
        }
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.run(
                `INSERT INTO loans (book_id, student_id, due_date) VALUES (?, ?, ?)`,
                [book_id, student_id, dueDateSql],
                function (err) {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao criar empréstimo: ${err.message}`);
                        reject(err);
                    }
                    else {
                        console.log(`🟢 [LoansModel] Empréstimo criado com id: ${this.lastID}`);
                        resolve({ id: this.lastID });
                    }
                }
            );
        });
    },

    // Busca todos os empréstimos com detalhes do usuário e do livro
    getLoansWithDetails: () => {
        console.log("🔵 [LoansModel] Buscando todos os empréstimos com detalhes");
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.all(
                `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date,
                        u.name as user_name, u.email as user_email,
                        b.title as book_title, b.authors as book_authors
                 FROM loans l
                 LEFT JOIN users u ON l.student_id = u.id
                 LEFT JOIN books b ON l.book_id = b.id
                 ORDER BY l.borrowed_at DESC`,
                [],
                (err, rows) => {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao buscar empréstimos: ${err.message}`);
                        reject(err);
                    }
                    else {
                        console.log(`🟢 [LoansModel] Empréstimos encontrados: ${rows.length}`);
                        resolve(rows);
                    }
                }
            );
        });
    },

    // Busca empréstimos de um usuário específico
    getLoansByUser: (user_id) => {
        console.log(`🔵 [LoansModel] Buscando empréstimos do usuário: ${user_id}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.all(
                `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date,
                        b.title as book_title, b.authors as book_authors
                 FROM loans l
                 LEFT JOIN books b ON l.book_id = b.id
                 WHERE l.student_id = ?
                 ORDER BY l.borrowed_at DESC`,
                [user_id],
                (err, rows) => {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao buscar empréstimos do usuário: ${err.message}`);
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                }
            );
        });
    },

    // Registra devolução de um empréstimo
    returnLoan: (loan_id) => {
        console.log(`🔵 [LoansModel] Registrando devolução do empréstimo: loan_id=${loan_id}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.run(
                `UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
                [loan_id],
                function (err) {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao registrar devolução: ${err.message}`);
                        reject(err);
                    }
                    else {
                        console.log(`🟢 [LoansModel] Devolução registrada para empréstimo id: ${loan_id}`);
                        resolve({ updated: this.changes });
                    }
                }
            );
        });
    },

    // Devolve um empréstimo
    returnBook: (loan_id) => {
        console.log(`🔵 [LoansModel] Devolvendo empréstimo: loan_id=${loan_id}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.run(
                `UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
                [loan_id],
                function (err) {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao devolver empréstimo: ${err.message}`);
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Empréstimo não encontrado ou já devolvido.'));
                    } else {
                        console.log(`🟢 [LoansModel] Empréstimo devolvido com sucesso: loan_id=${loan_id}`);
                        resolve();
                    }
                }
            );
        });
    },

    // Verifica se existe empréstimo ativo para um livro
    hasActiveLoan: (book_id) => {
        console.log(`🔵 [LoansModel] Verificando empréstimo ativo para book_id=${book_id}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.get(
                `SELECT id FROM loans WHERE book_id = ? AND returned_at IS NULL`,
                [book_id],
                (err, row) => {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao verificar empréstimo ativo: ${err.message}`);
                        reject(err);
                    }
                    else {
                        if (row) {
                            console.warn(`🟡 [LoansModel] Livro ${book_id} já está emprestado`);
                        } else {
                            console.log(`🟢 [LoansModel] Livro ${book_id} disponível para empréstimo`);
                        }
                        resolve(!!row); // true se existe empréstimo ativo
                    }
                }
            );
        });
    },

    // Busca empréstimo ativo de um usuário para um livro
    getActiveLoanByUserAndBook: (user_id, book_id) => {
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.get(
                `SELECT id as loan_id FROM loans WHERE student_id = ? AND book_id = ? AND returned_at IS NULL`,
                [user_id, book_id],
                (err, row) => {
                    db.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    },

    // Busca todos os empréstimos ativos (não devolvidos) com detalhes do usuário e do livro
    getActiveLoansWithDetails: () => {
        console.log("🔵 [LoansModel] Buscando empréstimos ativos com detalhes");
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.all(
                `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date,
                        u.name as user_name, u.email as user_email,
                        b.title as book_title, b.authors as book_authors
                 FROM loans l
                 LEFT JOIN users u ON l.student_id = u.id
                 LEFT JOIN books b ON l.book_id = b.id
                 WHERE l.returned_at IS NULL
                 ORDER BY l.borrowed_at DESC`,
                [],
                (err, rows) => {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao buscar empréstimos ativos: ${err.message}`);
                        reject(err);
                    }
                    else {
                        console.log(`🟢 [LoansModel] Empréstimos ativos encontrados: ${rows.length}`);
                        resolve(rows);
                    }
                }
            );
        });
    },

    // Busca empréstimo ativo para um livro (independente do usuário)
    getActiveLoanByBookId: (bookId) => {
        console.log(`🔵 [LoansModel] Buscando empréstimo ativo para o livro ${bookId}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.get(
                `SELECT id as loan_id FROM loans WHERE book_id = ? AND returned_at IS NULL`,
                [bookId],
                (err, row) => {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao buscar empréstimo ativo: ${err.message}`);
                        reject(err);
                    }
                    else {
                        if (row) {
                            console.log(`🟢 [LoansModel] Empréstimo ativo encontrado:`, row);
                        } else {
                            console.warn(`🟡 [LoansModel] Nenhum empréstimo ativo encontrado para o livro ${bookId}`);
                        }
                        resolve(row);
                    }
                }
            );
        });
    },

    // Renova um empréstimo
    renewLoan: (loan_id, renewal_days) => {
        console.log(`🔵 [LoansModel] Renovando empréstimo: loan_id=${loan_id}, renewal_days=${renewal_days}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.run(
                `UPDATE loans SET renewals = renewals + 1, due_date = datetime(due_date, '+' || ? || ' days') WHERE id = ? AND returned_at IS NULL`,
                [renewal_days, loan_id],
                function (err) {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao renovar empréstimo: ${err.message}`);
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Empréstimo não encontrado ou já devolvido.'));
                    } else {
                        console.log(`🟢 [LoansModel] Empréstimo renovado com sucesso: loan_id=${loan_id}`);
                        resolve();
                    }
                }
            );
        });
    },

    // Verifica se um livro está emprestado
    isBookLoaned: (book_id) => {
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.get(
                `SELECT id FROM loans WHERE book_id = ? AND returned_at IS NULL`,
                [book_id],
                (err, row) => {
                    db.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(!!row);
                    }
                }
            );
        });
    },

    // Busca todos os empréstimos ativos (não devolvidos)
    getActiveLoans: () => {
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.all(
                `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date,
                        u.name as user_name, u.email as user_email,
                        b.title as book_title, b.authors as book_authors
                 FROM loans l
                 LEFT JOIN users u ON l.student_id = u.id
                 LEFT JOIN books b ON l.book_id = b.id
                 WHERE l.returned_at IS NULL
                 ORDER BY l.borrowed_at DESC`,
                [],
                (err, rows) => {
                    db.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    },
};