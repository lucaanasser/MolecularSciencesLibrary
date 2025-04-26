const books = require('./books');

class BooksController {
    constructor() {
        this.subareaCodes = {
            "Física": "01",
            "Química": "02",
            "Biologia": "03",
            "Matemática": "04",
            "Computação": "05",
            "Variados": "06"
        };
        this.bookCounts = {};
    }

    async addBook(bookData) {
        return await books.addBook(bookData);
    }

    async getBooks() {
        return await books.getBooks();
    }

    async getBookById(id) {
        return await books.getBookById(id);
    }
}

module.exports = new BooksController();