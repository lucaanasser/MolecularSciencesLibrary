// Importa funções utilitárias para executar queries no banco de dados
const { executeQuery, getQuery, allQuery } = require('../database/db');

/**
 * Modelo para operações no banco de dados relacionadas a livros.
 * Responsável apenas pela persistência e recuperação de dados.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class BooksModel {
    async getBooks(category, subcategory, searchTerm, onlyReserved = null) {
        console.log(`🔵 [BooksModel] Buscando livros: category=${category}, subcategory=${subcategory}, searchTerm=${searchTerm}, onlyReserved=${onlyReserved}`);
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
        if (onlyReserved !== null) {
            conditions.push(`is_reserved = ?`);
            params.push(onlyReserved ? 1 : 0);
        }
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        // Ordenação customizada das áreas antes de qualquer outro critério:
        // Biologia -> Química -> Física -> Matemática -> Computação -> Variados -> demais
        query += ` ORDER BY CASE area 
            WHEN 'Biologia' THEN 1
            WHEN 'Química' THEN 2
            WHEN 'Física' THEN 3
            WHEN 'Matemática' THEN 4
            WHEN 'Computação' THEN 5
            WHEN 'Variados' THEN 6
            ELSE 999 END, subarea ASC, code ASC`;
        try {
            const books = await allQuery(query, params);
            console.log(`🟢 [BooksModel] Livros encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao buscar livros:", error.message);
            throw error;
        }
    }

    async setReservedStatus(bookId, isReserved) {
        console.log(`🔵 [BooksModel] Alterando status de reserva didática: bookId=${bookId}, isReserved=${isReserved}`);
        const query = `UPDATE books SET is_reserved = ? WHERE id = ?`;
        try {
            const result = await executeQuery(query, [isReserved ? 1 : 0, bookId]);
            console.log(`🟢 [BooksModel] Status de reserva didática alterado: bookId=${bookId}, isReserved=${isReserved}`);
            return result;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao alterar status de reserva didática:", error.message);
            throw error;
        }
    }

    // Método para buscar todos os livros sem filtros
    async getAll() {
        console.log("🔵 [BooksModel] Buscando todos os livros");
        return this.getBooks();
    }

    async insertBook(bookData) {
        console.log("🔵 [BooksModel] Inserindo livro:", bookData.title || bookData.code);
        const query = `
            INSERT INTO books (id, area, subarea, authors, edition, language, code, title, subtitle, volume, is_reserved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            bookData.volume,
            bookData.is_reserved || 0
        ];
        try {
            const result = await executeQuery(query, params);
            console.log("🟢 [BooksModel] Livro inserido com sucesso:", { id: bookData.id, code: bookData.code });
            return result;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao inserir livro:", error.message);
            throw error;
        }
    }

    async getBookById(id) {
        console.log(`🔵 [BooksModel] Buscando livro por id: ${id}`);
        try {
            const book = await getQuery(`SELECT * FROM books WHERE id = ?`, [id]);
            if (book) {
                console.log("🟢 [BooksModel] Livro encontrado:", book);
            } else {
                console.warn("🟡 [BooksModel] Livro não encontrado para id:", id);
            }
            return book;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao buscar livro:", error.message);
            throw error;
        }
    }

    async getLastBookByAreaAndSubarea(area, subarea) {
        console.log(`🔵 [BooksModel] Buscando último livro por area=${area}, subarea=${subarea}`);
        const query = `
            SELECT code FROM books
            WHERE area = ? AND subarea = ?
            ORDER BY code DESC LIMIT 1
        `;
        try {
            const lastBook = await getQuery(query, [area, subarea]);
            if (lastBook) {
                console.log("🟢 [BooksModel] Último livro encontrado:", lastBook.code);
            } else {
                console.warn("🟡 [BooksModel] Nenhum livro encontrado para area/subarea:", area, subarea);
            }
            return lastBook;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao buscar último livro:", error.message);
            throw error;
        }
    }

    async deleteBook(id) {
        const query = `DELETE FROM books WHERE id = ?`;
        console.log(`🔵 [BooksModel] Deletando livro id=${id}`);
        try {
            const result = await executeQuery(query, [id]);
            if (result > 0) {
                console.log(`🟢 [BooksModel] Livro removido com sucesso: id=${id}`);
            } else {
                console.warn(`🟡 [BooksModel] Livro não encontrado para remoção: id=${id}`);
            }
            return result > 0;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao remover livro:", error.message);
            throw error;
        }
    }

    async borrowBook(bookId, studentId) {
        console.log(`🔵 [BooksModel] Emprestando livro bookId=${bookId} para studentId=${studentId}`);
        const query = `
            INSERT INTO loans (book_id, student_id)
            VALUES (?, ?)
        `;
        try {
            const result = await executeQuery(query, [bookId, studentId]);
            console.log(`🟢 [BooksModel] Livro emprestado: bookId=${bookId}, studentId=${studentId}`);
            return result;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao emprestar livro:", error.message);
            throw error;
        }
    }

    async returnBook(bookId) {
        console.log(`🔵 [BooksModel] Devolvendo livro bookId=${bookId}`);
        const query = `
            UPDATE loans
            SET returned_at = CURRENT_TIMESTAMP
            WHERE book_id = ? AND returned_at IS NULL
        `;
        try {
            const result = await executeQuery(query, [bookId]);
            console.log(`🟢 [BooksModel] Livro devolvido: bookId=${bookId}`);
            return result;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao devolver livro:", error.message);
            throw error;
        }
    }

    async getBorrowedBooks() {
        console.log("🔵 [BooksModel] Buscando livros emprestados (ativos)");
        const query = `
            SELECT * FROM loans WHERE returned_at IS NULL
        `;
        try {
            const borrowed = await allQuery(query);
            console.log(`🟢 [BooksModel] Livros emprestados encontrados: ${borrowed.length}`);
            return borrowed;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao buscar livros emprestados:", error.message);
            throw error;
        }
    }
}

module.exports = new BooksModel();