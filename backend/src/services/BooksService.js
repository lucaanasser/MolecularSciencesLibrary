// BooksService contém toda a lógica de negócio relacionada a livros
const booksModel = require('../models/BooksModel');
// const bwipjs = require('bwip-js'); // Descomente se for gerar imagem

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

// Função para calcular o dígito verificador EAN-13
function ean13Checksum(number12) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(number12[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return check;
}

// Gera um EAN-13 único (prefixo 978 + timestamp + random)
async function generateUniqueEAN13() {
    let ean;
    let exists = true;
    while (exists) {
        const prefix = 978; // Número
        const middle = Number(Date.now().toString().slice(-8)); // Número
        const random = Math.floor(Math.random() * 10);
        const base12 = Number(`${prefix}${middle.toString().padStart(8, '0')}${random}`);
        const check = ean13Checksum(base12.toString().padStart(12, '0'));
        ean = Number(`${base12}${check}`);
        exists = await booksModel.getBookById(ean);
    }
    return ean;
}

class BooksService {
    async generateBookCode({ area, subarea, addType, selectedBook, volume }) {
        const areaCode = areaCodes[area] || "XXX";
        const subareaCode = String(subarea).padStart(2, "0");

        // NOVO EXEMPLAR: retorna o mesmo código do livro base
        if (addType === "exemplar" && selectedBook && selectedBook.code) {
            return selectedBook.code;
        }

        // NOVO VOLUME: substitui o volume no código base por v{volume}
        if (addType === "volume" && selectedBook && selectedBook.code) {
            // Remove qualquer sufixo de volume antigo (vY, v1, v2, etc)
            let baseCode = selectedBook.code;
            // Remove qualquer ocorrência de ' v' ou '-v' seguido de número no final
            baseCode = baseCode.replace(/[\s\-]?v\d+$/i, "");
            // Adiciona o novo volume no formato correto
            return `${baseCode}-v${parseInt(volume, 10)}`;
        }

        // NOVO LIVRO: gera código sequencial
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
        if (volume && parseInt(volume, 10) !== 0 && volume !== "null") {
            return `${baseCode}-v${parseInt(volume, 10)}`;
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
            title,
            subtitle,
            addType,         
            selectedBook,    
            volume
        } = bookData;

        const subareaInt = parseInt(subarea, 10);
        const code = await this.generateBookCode({ area, subarea, addType, selectedBook, volume });

        // Gere EAN-13 automaticamente
        const id = await generateUniqueEAN13();

        const bookToInsert = {
            id,
            area,
            subarea: subareaInt,
            authors,
            edition,
            language,
            code,
            title,
            subtitle,
            volume: volume && volume !== "null" ? parseInt(volume, 10) : null
        };

        const result = await booksModel.insertBook(bookToInsert);

        // // Gerar imagem do código de barras EAN-13 (comentado)
        // const pngBuffer = await bwipjs.toBuffer({
        //     bcid:        'ean13',
        //     text:        id,
        //     scale:       3,
        //     height:      10,
        //     includetext: true,
        //     textxalign:  'center',
        // });

        return { id, code /*, barcodeImage: pngBuffer */ };
    }

    // Remova métodos e lógicas relacionadas a exemplares
    // Exemplo: getMaxExemplarByCode, removeExemplarById, etc.

    async getBooks(category, subcategory, searchTerm) {
        const books = await booksModel.getBooks(category, subcategory, searchTerm);
        const borrowed = await booksModel.getBorrowedBooks();
        const borrowedSet = new Set(
            borrowed.map(b => b.book_id)
        );
        return books.map(book => ({
            ...book,
            available: !borrowedSet.has(book.id)
        }));
    }

    async borrowBook(bookId, studentId) {
        return await booksModel.borrowBook(bookId, studentId);
    }

    async returnBook(bookId) {
        return await booksModel.returnBook(bookId);
    }

    async removeBookById(id) {
        await booksModel.removeBookById(id);
        return { success: true, message: 'Livro removido com sucesso' };
    }

    async deleteBook(id) {
        return await this.removeBookById(id);
    }

    getCategoryMappings() {
        return {
            areaCodes,
            subareaCodes
        };
    }
}

module.exports = new BooksService();