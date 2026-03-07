/**
 * Modelo para operações no banco de dados relacionadas a livros.
 * Responsável apenas pela persistência e recuperação de dados.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const { executeQuery, getQuery, allQuery } = require('../../database/db');

class BooksModel {

    constructor() {
        this.allFields = ['id', 'code', 'area', 'subarea', 'title', 'subtitle', 'authors', 'edition', 'volume', 'language', 'status'];
        this.filters = ['q', 'area', 'subarea', 'status'];
        this.orderByArea = `ORDER BY 
            CASE area 
                WHEN 'Matemática' THEN 1
                WHEN 'Física' THEN 2
                WHEN 'Química' THEN 3
                WHEN 'Biologia' THEN 4
                WHEN 'Computação' THEN 5
                WHEN 'Variados' THEN 6
                ELSE 999 
            END`;
        this.orderBy = (field) => field === 'area' ? this.orderByArea : `ORDER BY count DESC`;
    }
    
    async addBook(bookData) {
        console.log("🔵 [BooksModel] Inserindo livro:", bookData.id);
        const fields = this.allFields.join(', ');
        const placeholders = this.allFields.map(() => '?').join(', ');
        const query = `INSERT INTO books (${fields}) VALUES (${placeholders})`;
        const params = this.allFields.map(field => bookData[field]);
        try {
            const result = await executeQuery(query, params);
            console.log("🟢 [BooksModel] Livro inserido com sucesso:", bookData.id);
            return result;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao inserir livro:", error.message);
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

    async searchBooks(q, limit, fields) {
        console.log(`🔵 [BooksModel] Buscando com autocomplete: query="${q}", limit=${limit}, fields=${fields.join(', ')}`);
        const words = q.trim().split(/\s+/);
        const conditions = words.map(() => '(title LIKE ? OR authors LIKE ? OR code LIKE ?)').join(' AND ');
        const sql = `
            SELECT ${fields.join(', ')}
            FROM books
            WHERE ${conditions}
            ORDER BY
                CASE
                    WHEN ${words.map(() => 'title LIKE ?').join(' AND ')} THEN 1
                    WHEN ${words.map(() => 'authors LIKE ?').join(' AND ')} THEN 2
                    WHEN ${words.map(() => 'code LIKE ?').join(' AND ')} THEN 3
                    ELSE 4
                END,
                title ASC
            LIMIT ?
          `;

        const params = [
          ...words.flatMap(w => [`%${w}%`, `%${w}%`, `%${w}%`]), // WHERE
          ...words.map(w => `%${w}%`), // ORDER BY title
          ...words.map(w => `%${w}%`), // ORDER BY authors
          ...words.map(w => `%${w}%`), // ORDER BY code
          limit
        ];
        
        try {
            const books = await allQuery(sql, params);
            console.log(`🟢 [BooksModel] ${books.length} livros encontrados no autocomplete`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro na busca com autocomplete:", error.message);
            throw error;
        }
    }

    async getBooks(filters) {
        console.log(`🔵 [BooksModel] Buscando livros com filtros: ${JSON.stringify(filters)}`);
        
        // Usa o método auxiliar para montar filtros e parâmetros
        const { where, params } = this._buildFilterQuery(filters);
        let query = `
            SELECT *,
                CASE
                    WHEN EXISTS (
                        SELECT 1 FROM loans l
                        WHERE l.book_id = books.id
                          AND l.returned_at IS NULL
                          AND l.due_date IS NOT NULL
                          AND l.due_date < CURRENT_TIMESTAMP
                    ) THEN 'atrasado'
                    ELSE status
                END as display_status
            FROM books${where}`;
        
        // Executa a query e retorna os resultados
        try {
            const books = await allQuery(query, params);
            console.log(`🟢 [BooksModel] Livros encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao buscar livros:", error.message);
            throw error;
        }
    }    

    async getBooksBy(field) {
        const query = `SELECT *, COUNT(*) as count FROM books GROUP BY ${field} ${this.orderBy(field)}`;
        try {
            const books = await allQuery(query);
            console.log(`🟢 [BooksModel] Livros agrupados por ${field} encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao buscar livros agrupados:", error.message);
            throw error;
        }
    }

    async getAllBooks() {
        console.log("🔵 [BooksModel] Buscando todos os livros");
        return this.getBooks({});
    }

    async countBooks(filters) {
        console.log(`🔵 [BooksModel] Contando livros: filters=${JSON.stringify(filters)}`);
        
        // Usa o método auxiliar para montar filtros e parâmetros
        const { where, params } = this._buildFilterQuery(filters);
        const query = `SELECT COUNT(*) as count FROM books${where}`;
        
        // Executa a query e retorna o total
        try {
            const result = await getQuery(query, params);
            const count = result.count;
            console.log(`🟢 [BooksModel] Total de livros: ${count}`);
            return count;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao contar livros:", error.message);
            throw error;
        }
    }

    async countBooksBy(field) {
      console.log(`🔵 [BooksModel] Contando livros agrupados por ${field}`);
      const query = `SELECT ${field}, COUNT(*) as count FROM books GROUP BY ${field} ${this.orderBy(field)}`;
      try {
          const result = await allQuery(query);
          console.log(`🟢 [BooksModel] Contagem agrupada:`, result);
          return result;
      } catch (error) {
          console.error("🔴 [BooksModel] Erro ao contar agrupado:", error.message);
          throw error;
      }
    }

    async setReservedStatus(bookId, status) {
        console.log(`🔵 [BooksModel] Alterando status de reserva didática: bookId=${bookId}, status=${status}`);
        const statusValue = status ? 'reservado' : 'disponível';
        const query = `UPDATE books SET status = ? WHERE id = ?`;
        try {
            const result = await executeQuery(query, [statusValue, bookId]);
            console.log(`🟢 [BooksModel] Status de reserva didática alterado: bookId=${bookId}, status=${statusValue}`);
            return result;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao alterar status de reserva didática:", error.message);
            throw error;
        }
    }

    async clearAllReservedBooks() {
        console.log(`🔵 [BooksModel] Removendo todos os livros da reserva didática`);
        const query = `UPDATE books SET status = 'disponível' WHERE status = 'reservado'`;
        try {
            const result = await executeQuery(query, []);
            console.log(`🟢 [BooksModel] Todos os livros removidos da reserva didática: ${result.affectedRows} livros afetados`);
            return result;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao limpar reserva didática:", error.message);
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
                throw new Error("Livro não encontrado. Verifique o código de barras fornecido e tente novamente.");
            }
            return book;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao buscar livro:", error.message);
            throw error;
        }
    }

    async getBooksByCode(code) {
        console.log(`🔵 [BooksModel] Buscando livros pelo código: ${code}`);
        const query = `
            SELECT b.*, d.name AS donator_name, d.tag AS donator_tag
            FROM books b
            LEFT JOIN donators d ON d.book_id = b.id AND d.donation_type = 'book'
            WHERE b.code = ?
        `;
        try {
            const books = await allQuery(query, [code]);
            console.log(`🟢 [BooksModel] Livros encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao buscar livros pelo código:", error.message);
            throw error;
        }
    }

    async getLastBookInSubarea(area, subarea) {
        console.log(`🔵 [BooksModel] Buscando último livro sequencial com area=${area}, subarea=${subarea}`);
        const query = `
            SELECT code FROM books
            WHERE area = ? AND subarea = ?
            ORDER BY code DESC LIMIT 1
        `;
        try {
            const lastBook = await getQuery(query, [area, subarea]);
            if (lastBook) {
                console.log("🟢 [BooksModel] Último livro encontrado: ", lastBook.code);
            } else {
                console.warn("🟡 [BooksModel] Nenhum livro encontrado para area/subarea: ", area, subarea);
            }
            return lastBook;
        } catch (error) {
            console.error("🔴 [BooksModel] Erro ao buscar último livro:", error.message);
            throw error;
        }
    }

    /* ========================= MÉTODOS AUXILIARES ========================= */
    
    _normalizeFilters(filters){
        for (const key of this.filters) {
              if (filters[key]) {
                  filters[key] = Array.isArray(filters[key])
                      ? filters[key].flatMap(v => v.split(','))
                      : filters[key].split(',');
              }
          }
        return filters;
    }

    _buildFilterQuery(filters ) {
        const f = this._normalizeFilters(filters);
        const params = [];
        const conditions = [];
        for (const filter of this.filters) {
            if (f[filter]) {
                if (filter === 'q') {
                    conditions.push(`(title LIKE ? COLLATE NOCASE OR authors LIKE ? COLLATE NOCASE OR subtitle LIKE ? COLLATE NOCASE OR code LIKE ? COLLATE NOCASE)`);
                    params.push(`%${f.q}%`, `%${f.q}%`, `%${f.q}%`, `%${f.q}%`);
                } else if (Array.isArray(f[filter])) {
                    // Suporte a múltiplos valores: area IN (?, ?, ...)
                    const arr = f[filter].filter(Boolean);
                    if (arr.length > 0) {
                        conditions.push(`${filter} IN (${arr.map(() => '?').join(',')})`);
                        params.push(...arr);
                    }
                } else {
                    conditions.push(`${filter} = ?`);
                    params.push(f[filter]);
                }
            }
        }
        return {
            where: conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '',
            params
        };
    }
}

module.exports = new BooksModel();