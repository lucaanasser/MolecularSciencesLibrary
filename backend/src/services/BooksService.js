// BooksService contém toda a lógica de negócio relacionada a livros
const booksModel = require('../models/BooksModel');

// Mapeamento de códigos de área (ex: Física -> FIS)
const areaCodes = {
    "Física": "FIS",
    "Química": "QUI",
    "Biologia": "BIO",
    "Matemática": "MAT",
    "Computação": "CMP",
    "Variados": "VAR"
};

// Mapeamento de códigos de subárea para cada área
const subareaCodes = {
    "Física": { 
        "Física Geral": 1, 
        "Mecânica Clássica": 2, 
        "Termodinâmica": 3,
        "Eletromagnetismo": 4,
        "Física Moderna": 5,
        "Física Matemática": 6, 
        "Astronomia e Astrofísica": 7,
    },
    "Química": { 
        "Química Geral": 1, 
        "Fisico-Química": 2, 
        "Química Inorgância": 3,
        "Química Orgânica": 4,
        "Química Analítica": 5, 
    },
    "Biologia": { 
        "Bioquímica": 1, 
        "Biologia Molecular e Celular": 2, 
        "Genética e Evolução": 3,
        "Biologia de Sistemas": 4,
        "Desenvolvimento": 5,
        "Ecologia": 6,
        "Botânica": 7,
    },
    "Matemática": { 
        "Álgebra": 1,
        "Cálculo": 2,
        "Geometria": 3 
    },
    "Computação": { 
        "Algoritmos": 1,
        "Estruturas de Dados": 2, 
        "Teoria da Computação": 3 
    },
    "Variados": { 
        "Divulgação Científica": 1,
        "Filosofia e História da Ciência": 2,
        "Handbooks e Manuais": 3,
        "Interdisciplinares": 4,
        "Miscelânea": 5, 
    }
};

class BooksService {
    async generateBookCode({ area, subarea, volume }) {
        const areaCode = areaCodes[area] || "XXX";
        const subareaCode = String(subarea).padStart(2, "0");
        const lastBook = await booksModel.getLastBookByAreaAndSubarea(area, parseInt(subarea, 10));
        let seq = "01";
        if (lastBook && lastBook.code) {
            const parts = lastBook.code.split(" ")[0].split(".");
            if (parts.length >= 2) {
                const lastSeq = parseInt(parts[1], 10);
                seq = (lastSeq + 1).toString().padStart(2, "0");
            }
        }
        const baseCode = `${areaCode}-${subareaCode}.${seq}`;
        if (volume && parseInt(volume, 10) !== 0) {
            return `${baseCode} v${parseInt(volume, 10)}`;
        } else {
            return baseCode;
        }
    }

    async addBook(bookData) {
        const {
            area,
            subarea,
            authors,
            edition,
            language,
            volume,
            title,
            subtitle,
            selectedBook,
            newVolume,
            isNewVolume
        } = bookData;

        const subareaInt = parseInt(subarea, 10);
        let code;
        let exemplarNumber = 1;

        if (selectedBook && selectedBook.code) {
            if (isNewVolume) {
                const codeBase = selectedBook.code.split(" v")[0]; 
                code = `${codeBase} v${parseInt(newVolume, 10)}`;
            } else {
                code = selectedBook.code;
                const result = await booksModel.getMaxExemplarByCode(code);
                exemplarNumber = (result && result.maxExemplar ? result.maxExemplar : 0) + 1;
            }
        } else {
            code = await this.generateBookCode({ area, subarea, volume });
        }
        
        const bookToInsert = {
            area,
            subarea: subareaInt,
            authors,
            edition,
            language,
            volume: isNewVolume ? newVolume : volume,
            exemplar: exemplarNumber,
            code,
            title,
            subtitle,
        };

        const result = await booksModel.insertBook(bookToInsert);
        return { id: result, code, exemplar: exemplarNumber };
    }

    async borrowBook(bookId, exemplar, studentId) {
        // studentId pode ser mockado, ex: Math.floor(Math.random() * 10000)
        return await booksModel.borrowBook(bookId, exemplar, studentId);
    }

    async returnBook(bookId, exemplar) {
        return await booksModel.returnBook(bookId, exemplar);
    }

    // Ao buscar livros, inclua a informação de disponibilidade
    async getBooks(category, subcategory, searchTerm) {
        const books = await booksModel.getBooks(category, subcategory, searchTerm);
        const borrowed = await booksModel.getBorrowedBooks();
        const borrowedSet = new Set(
            borrowed.map(b => `${b.book_id}-${b.exemplar}`)
        );
        return books.map(book => ({
            ...book,
            available: !borrowedSet.has(`${book.id}-${book.exemplar}`)
        }));
    }

    async getBookById(id) {
        return await booksModel.getBookById(id);
    }

    async removeExemplarById(id) {
        // Remove exemplar e reordena
        await booksModel.removeExemplarById(id);
        return { success: true, message: 'Exemplar removido e reordenado com sucesso' };
    }

    async deleteBook(id) {
        // Para compatibilidade, pode chamar removeExemplarById
        return await this.removeExemplarById(id);
    }

    getCategoryMappings() {
        return {
            areaCodes,
            subareaCodes
        };
    }
}

module.exports = new BooksService();