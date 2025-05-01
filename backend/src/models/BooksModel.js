// Importa funções utilitárias para executar queries no banco de dados
const { executeQuery, getQuery, allQuery } = require('../database/db');

/**
 * Modelo para operações no banco de dados relacionadas a livros.
 * Responsável apenas pela persistência e recuperação de dados.
 */
class BooksModel {
    /**
     * Busca todos os livros de uma determinada área e subárea.
     * Se não forem passados parâmetros, retorna todos os livros.
     * @param {string} category - Nome da área (ex: "Física")
     * @param {number} subcategory - Código da subárea (ex: 1)
     * @returns {Promise<Array>} Lista de livros encontrados
     */
    async getBooks(category, subcategory) {
        let query = `SELECT * FROM books`;
        const params = [];
        if (category && subcategory) {
            // Filtra por área e subárea
            query += ` WHERE area = ? AND subarea = ?`;
            params.push(category, parseInt(subcategory, 10));
        } else if (category) {
            // Filtra apenas por área
            query += ` WHERE area = ?`;
            params.push(category);
        }
        return await allQuery(query, params);
    }

    /**
     * Insere um novo livro no banco de dados.
     * @param {Object} bookData - Dados do livro a ser inserido
     * @returns {Promise<number>} ID do livro inserido
     */
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

    /**
     * Busca um livro pelo seu ID.
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Livro encontrado
     */
    async getBookById(id) {
        return await getQuery(`SELECT * FROM books WHERE id = ?`, [id]);
    }

    /**
     * Busca o último livro adicionado para uma determinada área e subárea
     * @param {string} area - Nome da área
     * @param {number} subarea - Código da subárea
     * @returns {Promise<Object>} Último livro encontrado
     */
    async getLastBookByAreaAndSubarea(area, subarea) {
        const query = `
            SELECT code FROM books
            WHERE area = ? AND subarea = ?
            ORDER BY code DESC LIMIT 1
        `;
        return await getQuery(query, [area, subarea]);
    }

    /**
     * Busca o maior número de exemplar para um determinado código de livro
     * @param {string} code - Código do livro
     * @returns {Promise<Object>} Objeto com o maior número de exemplar
     */
    async getMaxExemplarByCode(code) {
        const query = `
            SELECT MAX(exemplar) as maxExemplar FROM books WHERE code = ?
        `;
        return await getQuery(query, [code]);
    }
}

// Exporta uma instância única do modelo
module.exports = new BooksModel();