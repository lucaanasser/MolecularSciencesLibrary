// BooksService contém toda a lógica de negócio relacionada a livros
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const booksModel = require('../models/BooksModel');
const bwipjs = require('bwip-js');
const { PDFDocument, rgb } = require('pdf-lib');

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
        console.log(`🔵 [BooksService] Gerando código para livro: area=${area}, subarea=${subarea}, addType=${addType}, volume=${volume}`);
        const areaCode = areaCodes[area] || "XXX";
        const subareaCode = String(subarea).padStart(2, "0");

        // NOVO EXEMPLAR: retorna o mesmo código do livro base
        if (addType === "exemplar" && selectedBook && selectedBook.code) {
            console.log("🟡 [BooksService] Novo exemplar, reutilizando código:", selectedBook.code);
            return selectedBook.code;
        }

        // NOVO VOLUME: substitui o volume no código base por v{volume}
        if (addType === "volume" && selectedBook && selectedBook.code) {
            let baseCode = selectedBook.code;
            baseCode = baseCode.replace(/[\s\-]?v\d+$/i, "");
            const newCode = `${baseCode}-v${parseInt(volume, 10)}`;
            console.log("🟡 [BooksService] Novo volume, código gerado:", newCode);
            return newCode;
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
            const code = `${baseCode}-v${parseInt(volume, 10)}`;
            console.log("🟢 [BooksService] Código de livro com volume gerado:", code);
            return code;
        } else {
            console.log("🟢 [BooksService] Código de livro gerado:", baseCode);
            return baseCode;
        }
    }

    async addBook(bookData) {
        try {
            console.log("🔵 [BooksService] Iniciando adição de livro:", bookData.title || bookData.code);
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

            console.log("🟢 [BooksService] Livro inserido com sucesso:", { id, code });
            return { id, code /*, barcodeImage: pngBuffer */ };
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao adicionar livro:", error.message);
            throw error;
        }
    }

    async getBooks(category, subcategory, searchTerm) {
        try {
            console.log(`🔵 [BooksService] Buscando livros: category=${category}, subcategory=${subcategory}, searchTerm=${searchTerm}`);
            const books = await booksModel.getBooks(category, subcategory, searchTerm);
            const borrowed = await booksModel.getBorrowedBooks();
            const borrowedSet = new Set(
                borrowed.map(b => b.book_id)
            );
            const result = books.map(book => ({
                ...book,
                available: !borrowedSet.has(book.id)
            }));
            console.log(`🟢 [BooksService] Livros encontrados: ${result.length}`);
            return result;
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao buscar livros:", error.message);
            throw error;
        }
    }

    async getBookById(id) {
        try {
            console.log(`🔵 [BooksService] Buscando livro por id: ${id}`);
            const book = await booksModel.getBookById(id);
            console.log(`🟢 [BooksService] Livro encontrado: ${book ? book.title : 'não encontrado'}`);
            return book;
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao buscar livro por id: ${error.message}`);
            throw error;
        }
    }

    async borrowBook(bookId, studentId) {
        try {
            console.log(`🔵 [BooksService] Emprestando livro bookId=${bookId} para studentId=${studentId}`);
            const result = await booksModel.borrowBook(bookId, studentId);
            console.log(`🟢 [BooksService] Livro emprestado com sucesso: bookId=${bookId}, studentId=${studentId}`);
            return result;
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao emprestar livro: ${error.message}`);
            throw error;
        }
    }

    async returnBook(bookId) {
        try {
            console.log(`🔵 [BooksService] Devolvendo livro bookId=${bookId}`);
            const result = await booksModel.returnBook(bookId);
            console.log(`🟢 [BooksService] Livro devolvido com sucesso: bookId=${bookId}`);
            return result;
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao devolver livro: ${error.message}`);
            throw error;
        }
    }

    async removeBookById(id) {
        try {
            console.log(`🔵 [BooksService] Removendo livro id=${id}`);
            await booksModel.deleteBook(id);
            console.log(`🟢 [BooksService] Livro removido com sucesso: id=${id}`);
            return { success: true, message: 'Livro removido com sucesso' };
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao remover livro: ${error.message}`);
            throw error;
        }
    }

    async deleteBook(id) {
        return await this.removeBookById(id);
    }

    getCategoryMappings() {
        console.log("🔵 [BooksService] Obtendo mapeamentos de categorias e subcategorias");
        const mappings = {
            areaCodes,
            subareaCodes
        };
        console.log("🟢 [BooksService] Mapeamentos obtidos");
        return mappings;
    }

    /**
     * Gera um PDF com etiquetas para os livros informados
     * @param {Array} books - [{id, code, ...}]
     * @param {string} spineType - 'normal' ou 'fina'
     * @returns {Promise<Buffer>} PDF buffer
     */
    async generateLabelsPdf(books, spineType) {
        // Tamanho da folha A4 em pontos
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        // Tamanho da etiqueta: largura total da folha, altura para 6 por página
        const labelsPerPage = 6;
        const labelWidth = pageWidth;
        const gapY = 10; // Espaço vertical entre etiquetas
        const totalGap = gapY * (labelsPerPage - 1);
        const labelHeight = (pageHeight - totalGap) / labelsPerPage;

        const pdfDoc = await PDFDocument.create();

        let page = null;
        let labelIndex = 0;

        for (let i = 0; i < books.length; i++) {
            if (labelIndex % labelsPerPage === 0) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
            }
            const row = labelIndex % labelsPerPage;
            const x = 0;
            // De cima para baixo
            const y = pageHeight - (row + 1) * labelHeight - row * gapY;

            const book = books[i];
            const barcodePng = await bwipjs.toBuffer({
                bcid: 'ean13',
                text: String(book.id).padStart(13, '0'),
                scale: 3,
                height: 20,
                includetext: true,
                textxalign: 'center',
            });
            const barcodeImg = await pdfDoc.embedPng(barcodePng);

            if (spineType === 'fina') {
                // Código em pé (vertical)
                page.drawText(
                    (book.code || '').replace(/-/g, '\n').replace(/\./g, '\n'),
                    { x: x + 20, y: y + labelHeight - 35, size: 12, color: rgb(0,0,0), lineHeight: 14 }
                );
                page.drawImage(barcodeImg, {
                    x: x + 120, y: y + 20, width: 300, height: 80
                });
            } else {
                // Código deitado (horizontal)
                page.drawText(book.code || '', { x: x + 20, y: y + labelHeight - 35, size: 14, color: rgb(0,0,0) });
                page.drawImage(barcodeImg, {
                    x: x + 20, y: y + 20, width: 400, height: 60
                });
            }

            // Opcional: desenhar borda da etiqueta para facilitar corte
            page.drawRectangle({
                x, y,
                width: labelWidth,
                height: labelHeight,
                borderColor: rgb(0.8,0.8,0.8),
                borderWidth: 0.5,
                opacity: 0.3
            });

            labelIndex++;
        }

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
}

module.exports = new BooksService();