const sqlite3 = require('sqlite3');
const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || 'app/database/library.db';

function getDb() {
    return new sqlite3.Database(dbPath);
}

module.exports = {
    // Cria um novo empréstimo
    createLoan: (book_id, student_id) => {
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.run(
                `INSERT INTO borrowed_books (book_id, student_id) VALUES (?, ?)`,
                [book_id, student_id],
                function (err) {
                    db.close();
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    },

    // Busca todos os empréstimos com detalhes do usuário e do livro
    getLoansWithDetails: () => {
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
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Busca empréstimos de um usuário específico
    getLoansByUser: (userId) => {
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
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Registra devolução de um empréstimo
    returnLoan: (loan_id) => {
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.run(
                `UPDATE borrowed_books SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
                [loan_id],
                function (err) {
                    db.close();
                    if (err) reject(err);
                    else resolve({ updated: this.changes });
                }
            );
        });
    },

    // Verifica se existe empréstimo ativo para um livro
    hasActiveLoan: (book_id) => {
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.get(
                `SELECT id FROM borrowed_books WHERE book_id = ? AND returned_at IS NULL`,
                [book_id],
                (err, row) => {
                    db.close();
                    if (err) reject(err);
                    else resolve(!!row); // true se existe empréstimo ativo
                }
            );
        });
    },

    // Busca empréstimo ativo de um usuário para um livro
    getActiveLoanByUserAndBook: (userId, bookId) => {
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.get(
                `SELECT id as loan_id FROM borrowed_books WHERE student_id = ? AND book_id = ? AND returned_at IS NULL`,
                [userId, bookId],
                (err, row) => {
                    db.close();
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },
};