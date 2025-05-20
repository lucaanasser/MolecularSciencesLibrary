// Importa funções utilitárias para executar queries no banco de dados
const { executeQuery, getQuery, allQuery } = require('../database/db');

/**
 * Modelo para operações no banco de dados relacionadas a livros.
 * Responsável apenas pela persistência e recuperação de dados.
 */
class BooksModel {
    async getBooks(category, subcategory, searchTerm) {
        let query = `SELECT * FROM books`;
        const params = [];
        const conditions = [];

        if (category) {
            conditions.push(`area = ?`);
            params.push(category);
        }
        if (subcategory) {
            conditions.push(`subarea = ?`);
            params.push(parseInt(subcategory, 10));
        }
        if (searchTerm) {
            conditions.push(`(title LIKE ? OR authors LIKE ? OR subtitle LIKE ?)`);
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        return await allQuery(query, params);
    }

    async insertBook(bookData) {
        const query = `
            INSERT INTO books (area, subarea, authors, edition, language, volume, exemplar, code, title, subtitle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            bookData.area,
            bookData.subarea,
            bookData.authors,
            bookData.edition,
            bookData.language,
            bookData.volume,
            bookData.exemplar,
            bookData.code,
            bookData.title,
            bookData.subtitle,
        ];
        return await executeQuery(query, params);
    }

    async getBookById(id) {
        return await getQuery(`SELECT * FROM books WHERE id = ?`, [id]);
    }

    async getLastBookByAreaAndSubarea(area, subarea) {
        const query = `
            SELECT code FROM books
            WHERE area = ? AND subarea = ?
            ORDER BY code DESC LIMIT 1
        `;
        return await getQuery(query, [area, subarea]);
    }

    async getMaxExemplarByCode(code) {
        const query = `
            SELECT MAX(exemplar) as maxExemplar FROM books WHERE code = ?
        `;
        return await getQuery(query, [code]);
    }

    async deleteBook(id) {
        const query = `DELETE FROM books WHERE id = ?`;
        console.log(`[MODEL] Executando query: ${query} com id=${id}`);
        const result = await executeQuery(query, [id]);
        console.log(`[MODEL] Resultado do executeQuery para delete:`, result);
        return result > 0;
    }

    // Adiciona um novo exemplar para um código de livro
    async addExemplar(bookData) {
        // Conta quantos exemplares já existem para esse código
        const countSql = `SELECT COUNT(*) as total FROM books WHERE code = ?`;
        const { total } = await getQuery(countSql, [bookData.code]);
        const exemplarNumber = total + 1;

        const sql = `
            INSERT INTO books (code, title, authors, edition, volume, subtitle, language, area, subarea, exemplar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await executeQuery(sql, [
            bookData.code,
            bookData.title,
            bookData.authors,
            bookData.edition,
            bookData.volume,
            bookData.subtitle,
            bookData.language,
            bookData.area,
            bookData.subarea,
            exemplarNumber
        ]);
        return exemplarNumber;
    }

    // Remove um exemplar e reordena os demais
    async removeExemplarById(id) {
        // Busca o exemplar a ser removido
        const book = await this.getBookById(id);
        if (!book) throw new Error('Livro não encontrado');

        // Remove o exemplar
        const deleteSql = `DELETE FROM books WHERE id = ?`;
        await executeQuery(deleteSql, [id]);

        // Reordena os exemplares restantes
        const reorderSql = `
            UPDATE books
            SET exemplar = exemplar - 1
            WHERE code = ? AND exemplar > ?
        `;
        await executeQuery(reorderSql, [book.code, book.exemplar]);
    }

    // Busca todos os exemplares de um código, ordenados
    async getExemplaresByCode(code) {
        const sql = `SELECT * FROM books WHERE code = ? ORDER BY exemplar ASC`;
        return await allQuery(sql, [code]);
    }

    // Adiciona um novo livro (primeiro exemplar)
    async addNewBook(bookData) {
        const sql = `
            INSERT INTO books (code, title, authors, edition, volume, subtitle, language, area, subarea, exemplar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `;
        await executeQuery(sql, [
            bookData.code,
            bookData.title,
            bookData.authors,
            bookData.edition,
            bookData.volume,
            bookData.subtitle,
            bookData.language,
            bookData.area,
            bookData.subarea
        ]);
        return 1;
    }

    async borrowBook(bookId, exemplar, studentId) {
        const query = `
            INSERT INTO borrowed_books (book_id, exemplar, student_id)
            VALUES (?, ?, ?)
        `;
        return await executeQuery(query, [bookId, exemplar, studentId]);
    }

    async returnBook(bookId, exemplar) {
        const query = `
            UPDATE borrowed_books
            SET returned_at = CURRENT_TIMESTAMP
            WHERE book_id = ? AND exemplar = ? AND returned_at IS NULL
        `;
        return await executeQuery(query, [bookId, exemplar]);
    }

    async isBookAvailable(bookId, exemplar) {
        const query = `
            SELECT * FROM borrowed_books
            WHERE book_id = ? AND exemplar = ? AND returned_at IS NULL
        `;
        const result = await getQuery(query, [bookId, exemplar]);
        return !result; // true se não existe empréstimo ativo
    }

    // Retorna todos os empréstimos ativos para todos os livros
    async getBorrowedBooks() {
        const query = `
            SELECT * FROM borrowed_books WHERE returned_at IS NULL
        `;
        return await allQuery(query);
    }
}

module.exports = new BooksModel();