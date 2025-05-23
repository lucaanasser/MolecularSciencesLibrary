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
            INSERT INTO books (id, area, subarea, authors, edition, language, code, title, subtitle, volume)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            bookData.id,
            bookData.area,
            bookData.subarea,
            bookData.authors,
            bookData.edition,
            bookData.language,
            bookData.code,
            bookData.title,
            bookData.subtitle,
            bookData.volume
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

    async deleteBook(id) {
        const query = `DELETE FROM books WHERE id = ?`;
        console.log(`[MODEL] Executando query: ${query} com id=${id}`);
        const result = await executeQuery(query, [id]);
        console.log(`[MODEL] Resultado do executeQuery para delete:`, result);
        return result > 0;
    }

    async borrowBook(bookId, studentId) {
        const query = `
            INSERT INTO borrowed_books (book_id, student_id)
            VALUES (?, ?)
        `;
        return await executeQuery(query, [bookId, studentId]);
    }

    async returnBook(bookId) {
        const query = `
            UPDATE borrowed_books
            SET returned_at = CURRENT_TIMESTAMP
            WHERE book_id = ? AND returned_at IS NULL
        `;
        return await executeQuery(query, [bookId]);
    }

    async getBorrowedBooks() {
        const query = `
            SELECT * FROM borrowed_books WHERE returned_at IS NULL
        `;
        return await allQuery(query);
    }
}

module.exports = new BooksModel();