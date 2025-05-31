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
    createLoan: (book_id, student_id) => {
        console.log(`🔵 [LoansModel] Criando empréstimo: book_id=${book_id}, student_id=${student_id}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.run(
                `INSERT INTO borrowed_books (book_id, student_id) VALUES (?, ?)`,
                [book_id, student_id],
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
                `SELECT bb.id as loan_id, bb.book_id, bb.student_id, bb.borrowed_at, bb.returned_at,
                        u.name as user_name, u.email as user_email,
                        b.title as book_title, b.authors as book_authors
                 FROM borrowed_books bb
                 LEFT JOIN users u ON bb.student_id = u.id
                 LEFT JOIN books b ON bb.book_id = b.id
                 ORDER BY bb.borrowed_at DESC`,
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
    getLoansByUser: (userId) => {
        console.log(`🔵 [LoansModel] Buscando empréstimos do usuário: userId=${userId}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.all(
                `SELECT bb.id as loan_id, bb.book_id, bb.student_id, bb.borrowed_at, bb.returned_at,
                        b.title as book_title, b.authors as book_authors
                 FROM borrowed_books bb
                 LEFT JOIN books b ON bb.book_id = b.id
                 WHERE bb.student_id = ?
                 ORDER BY bb.borrowed_at DESC`,
                [userId],
                (err, rows) => {
                    db.close();
                    if (err) {
                        console.error(`🔴 [LoansModel] Erro ao buscar empréstimos do usuário: ${err.message}`);
                        reject(err);
                    }
                    else {
                        console.log(`🟢 [LoansModel] Empréstimos do usuário ${userId} encontrados: ${rows.length}`);
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
                `UPDATE borrowed_books SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
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

    // Verifica se existe empréstimo ativo para um livro
    hasActiveLoan: (book_id) => {
        console.log(`🔵 [LoansModel] Verificando empréstimo ativo para book_id=${book_id}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.get(
                `SELECT id FROM borrowed_books WHERE book_id = ? AND returned_at IS NULL`,
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
    getActiveLoanByUserAndBook: (userId, bookId) => {
        console.log(`🔵 [LoansModel] Buscando empréstimo ativo do usuário ${userId} para o livro ${bookId}`);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.get(
                `SELECT id as loan_id FROM borrowed_books WHERE student_id = ? AND book_id = ? AND returned_at IS NULL`,
                [userId, bookId],
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
                            console.warn(`🟡 [LoansModel] Nenhum empréstimo ativo encontrado para usuário ${userId} e livro ${bookId}`);
                        }
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
                `SELECT bb.id as loan_id, bb.book_id, bb.student_id, bb.borrowed_at, bb.returned_at,
                        u.name as user_name, u.email as user_email,
                        b.title as book_title, b.authors as book_authors
                 FROM borrowed_books bb
                 LEFT JOIN users u ON bb.student_id = u.id
                 LEFT JOIN books b ON bb.book_id = b.id
                 WHERE bb.returned_at IS NULL
                 ORDER BY bb.borrowed_at DESC`,
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
                `SELECT id as loan_id FROM borrowed_books WHERE book_id = ? AND returned_at IS NULL`,
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
};