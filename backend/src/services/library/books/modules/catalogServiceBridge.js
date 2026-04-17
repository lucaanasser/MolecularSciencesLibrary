/**
 * Responsabilidade: bridge de regra de negocio para catalogo de livros.
 * Camada: service.
 * Entradas/Saidas: implementa casos de uso de catalogo no dominio unificado.
 * Dependencias criticas: BooksModel, csvUtils e validBookAreas.
 */

const BooksModel = require('../../../../models/library/books/BooksModel');
const { escapeCSV, importFromCSV } = require('../../../../utils/csvUtils');
const { areaMapping, subareaMapping, validateArea, validateSubarea } = require('../../../../utils/validBookAreas');

const allFields = ['id', 'code', 'area', 'subarea', 'title', 'subtitle', 'authors', 'edition', 'volume', 'language', 'status'];
const requiredFields = ['area', 'subarea', 'title', 'authors', 'edition', 'volume', 'language'];
const basicFields = ['id', 'code', 'title', 'authors', 'area'];

module.exports = {
    async addBook(bookData, selectedBookcode = null) {
        validateArea(bookData.area);
        validateSubarea(areaMapping[bookData.area], bookData.subarea);

        const code = bookData.code || await this._generateBookCode(bookData, selectedBookcode);
        const id = bookData.id && bookData.id.toString().length === 13
            ? bookData.id
            : await this._generateUniqueEAN13();

        if (!bookData.edition) {
            bookData.edition = 1;
        }

        for (const field of allFields) {
            if (typeof bookData[field] === 'string') {
                bookData[field] = bookData[field].replace(/\s+/g, ' ').trim();
            }
        }

        const bookToInsert = {};
        for (const field of allFields) {
            if (field === 'id') bookToInsert.id = id;
            else if (field === 'code') bookToInsert.code = code;
            else bookToInsert[field] = bookData[field] || (field === 'status' ? 'disponível' : null);
        }

        return BooksModel.addBook(bookToInsert);
    },

    async importBooksFromCSV(file) {
        const logger = {
            success: () => {},
            error: () => {},
            finish: () => {}
        };

        return importFromCSV({
            fileBuffer: file.buffer,
            requiredFields,
            mapRow: (rowData) => {
                const row = {};
                for (const field in rowData) {
                    let value = rowData[field];
                    if (typeof value === 'string') value = value.trim();
                    if ((field === 'id' || field === 'edition' || field === 'volume') && value) {
                        value = parseInt(value, 10);
                    }
                    if (field === 'status' && value) {
                        value = value.toLowerCase();
                    }
                    row[field] = value || null;
                }
                return row;
            },
            addFn: this.addBook.bind(this),
            logger
        });
    },

    async searchBooks(q = null, limit = 10) {
        if (!q || q.trim().length === 0) {
            return [];
        }
        return BooksModel.searchBooks(q, limit, basicFields);
    },

    async getBooks(filters = {}) {
        return BooksModel.getBooks(filters);
    },

    async countBooks(filters = {}) {
        return BooksModel.countBooks(filters);
    },

    async exportBooksToCSV() {
        const books = await BooksModel.getAllBooks();
        const csvRows = [allFields.join(',')];
        for (const book of books) {
            const row = allFields.map((field) => escapeCSV(book[field] || ''));
            csvRows.push(row.join(','));
        }
        return csvRows.join('\n');
    },

    async setReservedStatus(id, status) {
        const book = await this.getBookById(id);
        const indifferent = (status && book.status === 'reservado') || (!status && book.status !== 'reservado');
        if (indifferent) {
            throw new Error(`Livro "${book.title}" ${status ? 'já' : 'não'} estava reservado`);
        }
        await BooksModel.setReservedStatus(id, status);
        return { success: true, book: book.title, is_reserved: status };
    },

    async clearAllReservedBooks() {
        const result = await BooksModel.clearAllReservedBooks();
        return {
            success: true,
            message: 'Todos os livros foram removidos da reserva didática',
            affectedRows: result.affectedRows
        };
    },

    async getReservedBooks() {
        return BooksModel.getBooks({ status: 'reservado' });
    },

    async getBookById(id) {
        return BooksModel.getBookById(id);
    },

    async getBooksByCode(code) {
        return BooksModel.getBooksByCode(code);
    },

    async deleteBook(id) {
        await BooksModel.deleteBook(id);
        return { success: true, message: 'Livro removido com sucesso' };
    },

    async countBooksBy(field) {
        return BooksModel.countBooksBy(field);
    },

    async _generateUniqueEAN13() {
        const completeEAN13 = (twelveDigitBarcode) => {
            let sum = 0;
            for (let index = 0; index < 12; index += 1) {
                sum += parseInt(twelveDigitBarcode[index], 10) * (index % 2 === 0 ? 1 : 3);
            }
            const check = (10 - (sum % 10)) % 10;
            return Number(`${twelveDigitBarcode}${check}`);
        };

        let ean;
        let exists = true;
        while (exists) {
            let twelveDigitBarcode = '';
            for (let index = 0; index < 12; index += 1) {
                twelveDigitBarcode += Math.floor(Math.random() * 10).toString();
            }
            ean = completeEAN13(twelveDigitBarcode);
            exists = await BooksModel.getBookById(ean).then(() => true).catch(() => false);
        }

        return ean;
    },

    async _generateBookCode(bookData, selectedBookcode) {
        if (selectedBookcode) {
            const match = selectedBookcode.match(/ v\.(\d+)$/i);
            const referenceVolume = match ? parseInt(match[1], 10) : 0;

            if (bookData.volume === referenceVolume) {
                return selectedBookcode;
            }

            const baseCode = selectedBookcode.replace(/ v\.\d+$/i, '');
            if (bookData.volume === 0) return baseCode;
            return `${baseCode} v.${parseInt(bookData.volume, 10)}`;
        }

        const lastBook = await BooksModel.getLastBookInSubarea(bookData.area, bookData.subarea);
        let seq = '01';
        if (lastBook && lastBook.code) {
            const parts = lastBook.code.split(' ')[0].split('.');
            if (parts.length < 2) {
                throw new Error(`Formato de código inesperado no último livro encontrado: ${lastBook.code}`);
            }
            seq = (parseInt(parts[1], 10) + 1).toString().padStart(2, '0');
        }

        const areaCode = areaMapping[bookData.area] || 'XXX';
        const subareaNum = subareaMapping[areaCode]?.[bookData.subarea] || 0;
        const subareaCode = String(subareaNum).padStart(2, '0');
        const baseCode = `${areaCode}-${subareaCode}.${seq}`;

        if (bookData.volume && bookData.volume !== 0) {
            return `${baseCode} v.${bookData.volume}`;
        }
        return baseCode;
    }
};
