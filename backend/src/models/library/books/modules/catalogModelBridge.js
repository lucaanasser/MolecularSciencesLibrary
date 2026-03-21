/**
 * Responsabilidade: persistencia de catalogo de livros no dominio unificado books.
 * Camada: model.
 * Entradas/Saidas: CRUD e consultas de books no SQLite.
 * Dependencias criticas: database/db.
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');

const allFields = ['id', 'code', 'area', 'subarea', 'title', 'subtitle', 'authors', 'edition', 'volume', 'language', 'status'];
const filters = ['q', 'area', 'subarea', 'status'];
const orderByArea = `ORDER BY
    CASE area
        WHEN 'Matemática' THEN 1
        WHEN 'Física' THEN 2
        WHEN 'Química' THEN 3
        WHEN 'Biologia' THEN 4
        WHEN 'Computação' THEN 5
        WHEN 'Variados' THEN 6
        ELSE 999
    END`;

function orderBy(field) {
    return field === 'area' ? orderByArea : 'ORDER BY count DESC';
}

function normalizeFilters(input = {}) {
    const normalized = { ...input };
    for (const key of filters) {
        if (!normalized[key]) continue;
        normalized[key] = Array.isArray(normalized[key])
            ? normalized[key].flatMap((value) => String(value).split(','))
            : String(normalized[key]).split(',');
    }
    return normalized;
}

function buildFilterQuery(input = {}) {
    const normalized = normalizeFilters(input);
    const params = [];
    const conditions = [];

    for (const filter of filters) {
        if (!normalized[filter]) continue;

        if (filter === 'q') {
            conditions.push('(title LIKE ? COLLATE NOCASE OR authors LIKE ? COLLATE NOCASE OR subtitle LIKE ? COLLATE NOCASE OR code LIKE ? COLLATE NOCASE)');
            params.push(`%${normalized.q}%`, `%${normalized.q}%`, `%${normalized.q}%`, `%${normalized.q}%`);
            continue;
        }

        if (Array.isArray(normalized[filter])) {
            const values = normalized[filter].filter(Boolean);
            if (!values.length) continue;
            conditions.push(`${filter} IN (${values.map(() => '?').join(',')})`);
            params.push(...values);
            continue;
        }

        conditions.push(`${filter} = ?`);
        params.push(normalized[filter]);
    }

    return {
        where: conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '',
        params
    };
}

module.exports = {
    async addBook(bookData) {
        const fieldList = allFields.join(', ');
        const placeholders = allFields.map(() => '?').join(', ');
        const params = allFields.map((field) => bookData[field]);
        return executeQuery(`INSERT INTO books (${fieldList}) VALUES (${placeholders})`, params);
    },

    async deleteBook(id) {
        const result = await executeQuery('DELETE FROM books WHERE id = ?', [id]);
        return result > 0;
    },

    async searchBooks(q, limit, fields) {
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
            ...words.flatMap((word) => [`%${word}%`, `%${word}%`, `%${word}%`]),
            ...words.map((word) => `%${word}%`),
            ...words.map((word) => `%${word}%`),
            ...words.map((word) => `%${word}%`),
            limit
        ];

        return allQuery(sql, params);
    },

    async getBooks(filtersInput = {}) {
        const { where, params } = buildFilterQuery(filtersInput);
        const query = `
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
            FROM books${where}
        `;
        return allQuery(query, params);
    },

    async getBooksBy(field) {
        return allQuery(`SELECT *, COUNT(*) as count FROM books GROUP BY ${field} ${orderBy(field)}`);
    },

    async getAllBooks() {
        return this.getBooks({});
    },

    async countBooks(filtersInput = {}) {
        const { where, params } = buildFilterQuery(filtersInput);
        const result = await getQuery(`SELECT COUNT(*) as count FROM books${where}`, params);
        return result.count;
    },

    async countBooksBy(field) {
        return allQuery(`SELECT ${field}, COUNT(*) as count FROM books GROUP BY ${field} ${orderBy(field)}`);
    },

    async setReservedStatus(bookId, status) {
        const statusValue = status ? 'reservado' : 'disponível';
        return executeQuery('UPDATE books SET status = ? WHERE id = ?', [statusValue, bookId]);
    },

    async clearAllReservedBooks() {
        return executeQuery("UPDATE books SET status = 'disponível' WHERE status = 'reservado'", []);
    },

    async getBookById(id) {
        const book = await getQuery('SELECT * FROM books WHERE id = ?', [id]);
        if (!book) throw new Error('Livro não encontrado. Verifique o código de barras fornecido e tente novamente.');
        return book;
    },

    async getBooksByCode(code) {
        const query = `
            SELECT b.*, d.name AS donator_name, d.tag AS donator_tag
            FROM books b
            LEFT JOIN donators d ON d.book_id = b.id AND d.donation_type = 'book'
            WHERE b.code = ?
        `;
        return allQuery(query, [code]);
    },

    async getLastBookInSubarea(area, subarea) {
        const query = `
            SELECT code FROM books
            WHERE area = ? AND subarea = ?
            ORDER BY code DESC LIMIT 1
        `;
        return getQuery(query, [area, subarea]);
    }
};
