/* BooksService contém toda a lógica de negócio relacionada a livros
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const BooksModel = require('../../models/library/BooksModel');
const { escapeCSV, importFromCSV } = require('../../utils/csvUtils');
const { areaMapping, subareaMapping, validateArea, validateSubarea } = require('../../utils/bookValidAreas.js');

class BooksService {

    constructor() {
        this.allFields = ['id', 'code', 'area', 'subarea', 'title', 'subtitle', 'authors', 'edition', 'volume', 'language', 'status'];
        this.requiredFields = ['area', 'subarea',  'title',  'authors', 'edition', 'volume', 'language'];
        this.basicFields = ['id', 'code', 'title', 'authors', 'area']; // campos básicos para autocomplete - possivelmente mudar, não sei se são os melhores
    }
    
    async addBook(bookData, addType = null, selectedBook = null) {
        console.log("🔵 [BooksService] Iniciando adição de livro:", bookData.id || bookData.title);
        
        // Verifica se a área e a subárea fornecidas são válidas
        try {
            validateArea(bookData.area);
            validateSubarea(areaMapping[bookData.area], bookData.subarea);
            console.log("🟢 [BooksService] Área e subárea validadas: ", bookData.area, "-", bookData.subarea);
        } catch (error) {
            console.error("🔴 [BooksService] Erro de validação de área/subárea:", error.message);
            throw error;
        }

        // Usa código de posição fornecido ou gera automaticamente
        let code;
        if (bookData.code) {
            code = bookData.code;
            console.log("🟡 [BooksService] Usando código de posição fornecido:", code);
        } else {
            try {
                code = await this._generateBookCode(bookData, addType, selectedBook);
                console.log("🟢 [BooksService] Código de posição gerado automaticamente:", code);
            }
            catch (error) {
                console.error("🔴 [BooksService] Erro ao gerar código de posição:", error.message);
                throw error;
            }
        }

        // Usa código de barras fornecido ou gera um EAN-13 único
        let id;
        if (bookData.id && bookData.id.toString().length === 13) {
            id = bookData.id;
            console.log("🟡 [BooksService] Usando código de barras fornecido:", id);
        } else {
            id = await this._generateUniqueEAN13();
            console.log("🟢 [BooksService] Código de barras gerado automaticamente:", id);
        }

        // Monta objeto do livro com todos os campos para inserção
        const bookToInsert = {};
        for (const field of this.allFields) {
            if (field === 'id') bookToInsert.id = id;
            else if (field === 'code') bookToInsert.code = code;
            else bookToInsert[field] = bookData[field] || (field === 'status' ? "disponível" : null);
        }
        try {
            const result = await BooksModel.insertBook(bookToInsert);
            console.log("🟢 [BooksService] Livro inserido com sucesso: ", id);
            return result;
        }
        catch (error) {
            console.error("🔴 [BooksService] Erro ao inserir livro: ", error.message);
            throw error;
        }
    }

    async importBooksFromCSV(file) {
        console.log("🔵 [BooksService] Iniciando importação de livros via CSV");
        const logger = {
            success: (entity, row) => console.log(`🟢 [BooksService] Livro importado: ${entity.title} (linha ${row})`),
            error: (error, row) => console.error(`🔴 [BooksService] Erro na linha ${row}:`, error.message),
            finish: (results) => console.log(`🟢 [BooksService] Importação concluída: ${results.success} sucesso, ${results.failed} falhas`)
        };
        return await importFromCSV({
            fileBuffer: file.buffer,
            requiredFields: this.requiredFields,
            mapRow: (bookData) => {
                const row = {};
                for (const field of this.allFields) {
                    let value = bookData[field];
                    if (typeof value === 'string') value = value.trim();
                    if ((field === 'id' || field === 'edition' || field === 'volume') && value) {
                        value = parseInt(value);
                    }
                    if (field === 'status' && value) {
                        value = value.toLowerCase();
                    }
                    row[field] = value || null;
                }
                return row;
            },
            addFn: this.addBook,
            logger
        });
    }

    async borrowBook(bookId, userId) {
        console.log(`🔵 [BooksService] Emprestando livro bookId=${bookId} para userId=${userId}`);
        try {
            // Busca o livro para verificar se é reserva didática
            const book = await BooksModel.getBookById(bookId);
            if (book && book.status == "reservado") {
                const msg = `Livro ${bookId} está marcado como reserva didática e não pode ser emprestado.`;
                console.warn(`🟡 [BooksService] ${msg}`);
                throw new Error(msg);
            }
            // Realiza o empréstimo
            const result = await BooksModel.borrowBook(bookId, userId);
            console.log(`🟢 [BooksService] Livro emprestado com sucesso: bookId=${bookId}, userId=${userId}`);
            return result;
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao emprestar livro: ${error.message}`);
            throw error;
        }
    }

    async returnBook(bookId) {
        console.log(`🔵 [BooksService] Devolvendo livro bookId=${bookId}`);
        try {
            const result = await BooksModel.returnBook(bookId);
            console.log(`🟢 [BooksService] Livro devolvido com sucesso: bookId=${bookId}`);
            return result;
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao devolver livro: ${error.message}`);
            throw error;
        }
    }

    async searchBooks(q = null, limit = 10) {
        if (!q || q.trim() === "") {
            console.warn("🟡 [BooksService] Consulta de autocomplete vazia, retornando array vazio");
            return [];
        }
        console.log(`🔵 [BooksService] Buscando livros para autocomplete: query="${q}", limit=${limit}`);
        try {
            const results = await BooksModel.searchBooks(q, limit, this.basicFields);
            console.log(`🟢 [BooksService] ${results.length} resultados de autocomplete`);
            return results;
        } catch (error) {
            console.error("🔴 [BooksService] Erro no autocomplete:", error.message);
            throw error;
        }
    }

    async getBooks(filters = {}, limit = null, offset = 0) {
        console.log(`🔵[BooksService] Buscando livros com filtros:`, filters);
        try {
            const result = await BooksModel.getBooks(filters, limit, offset);
            console.log(`🟢 [BooksService] Livros encontrados: ${result.length}`);
            return result;
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao buscar livros: ", error.message);
            throw error;
        }
    }

    async countBooks(filters) {
        console.log(`🔵 [BooksService] Contando livros com filtros:`, filters);
        try {
            const count = await BooksModel.countBooks(filters);
            console.log(`🟢 [BooksService] Total: ${count} livros`);
            return count;
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao contar livros:", error.message);
            throw error;
        }
    }

    async exportBooksToCSV() {
        console.log(`🔵 [BooksService] Exportando catálogo de livros para CSV`);
        try{
          const books = await BooksModel.getAllBooks();
          const csvRows = [this.allFields.join(',')];
          for (const book of books) {
              const row = this.allFields.map(field => escapeCSV(book[field] || ''));
              csvRows.push(row.join(','));
          }
          console.log(`🟢 [BooksService] Exportação para CSV concluída: ${books.length} livros exportados`);
          return csvRows.join('\n');
        } catch (error) {
          console.error("🔴 [BooksService] Erro ao exportar livros para CSV:", error.message);
          throw error;
        }
    }

    async setReservedStatus(bookId, isReserved) {
        console.log(`🔵 [BooksService] Alterando status de reserva didática: bookId=${bookId}, isReserved=${isReserved}`);
        try {
            await BooksModel.setReservedStatus(bookId, isReserved);
            console.log(`🟢 [BooksService] Status de reserva didática alterado: bookId=${bookId}, isReserved=${isReserved}`);
            return { success: true, is_reserved: isReserved };
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao alterar status de reserva didática: ${error.message}`);
            throw error;
        }
    }

    async clearAllReservedBooks() {
        console.log(`🔵 [BooksService] Removendo todos os livros da reserva didática`);
        try {
            const result = await BooksModel.clearAllReservedBooks();
            console.log(`🟢 [BooksService] Todos os livros removidos da reserva didática`);
            return { success: true, message: 'Todos os livros foram removidos da reserva didática', affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao limpar reserva didática: ${error.message}`);
            throw error;
        }
    }

    async getReservedBooks() {
        console.log(`🔵 [BooksService] Buscando livros reservados didaticamente`);
        try {
            const books = await BooksModel.getBooks({ status: "reservado" }, null, null);
            console.log(`🟢 [BooksService] Livros reservados encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao buscar livros reservados:", error.message);
            throw error;
        }
    }

    async getBookById(id) {
        console.log(`🔵 [BooksService] Buscando livro por id: ${id}`);
        try {
            const book = await BooksModel.getBookById(id);
            console.log(`🟢 [BooksService] Busca realizada com sucesso`);
            return book;
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao buscar livro por id: ${error.message}`);
            throw error;
        }
    }

    async deleteBook(id) {
        console.log(`🔵 [BooksService] Removendo livro id=${id}`);
        try {
            await BooksModel.deleteBook(id);
            console.log(`🟢 [BooksService] Livro removido com sucesso: id=${id}`);
            return { success: true, message: 'Livro removido com sucesso' };
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao remover livro: ${error.message}`);
            throw error;
        }
    }

    /* =============================== FUNÇÕES AUXILIARES =============================== */

    async _generateUniqueEAN13() {
      // Função auxiliar para calcular o dígito verificador EAN-13
        function completeEAN13(twelveDigitBarcode) {
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += parseInt(twelveDigitBarcode[i], 10) * (i % 2 === 0 ? 1 : 3);
            }
            const check = (10 - (sum % 10)) % 10;
            return Number(`${twelveDigitBarcode}${check}`);
        }

        // Gera códigos EAN-13 aleatórios até encontrar um que não exista no banco de dados
        let ean; let exists = true;
        while (exists) {
            let twelveDigitBarcode = '';
            for (let i = 0; i < 12; i++)
                twelveDigitBarcode += Math.floor(Math.random() * 10).toString();
            ean = completeEAN13(twelveDigitBarcode);
            exists = await BooksModel.getBookById(ean);
        }

        return ean;
    }

    async _generateBookCode(bookData, addType, selectedBook) {
        console.log(`🔵 [BooksService] Gerando código para livro: area=${bookData.area}, subarea=${bookData.subarea}, volume=${bookData.volume}`);
        
        // NOVO EXEMPLAR: reutiliza código do livro selecionado
        if (addType && addType == "exemplar" && selectedBook) {
            console.log("🟡 [BooksService] Novo exemplar, reutilizando código:", selectedBook.code);
            return selectedBook.code;
        }

        // NOVO VOLUME: baseia código no livro selecionado, ajustando o sufixo de volume
        if (addType && addType == "volume" && selectedBook) {
            let baseCode = selectedBook.code;
            baseCode = baseCode.replace(/ v\.\d+$/i, ""); // remove sufixo de volume no formato " v.#"
            if (bookData.volume == 0)
                return baseCode;
            const newCode = `${baseCode} v.${parseInt(bookData.volume, 10)}`;
            console.log("🟡 [BooksService] Novo volume, código gerado:", newCode);
            return newCode;
        } 

        // NOVO LIVRO: gera código sequencial
        const lastBook = await BooksModel.getLastBookInSubarea(bookData.area, bookData.subarea);
        let seq = "01";
        // Se já há um livro na subárea, incrementa o número sequencial
        if (lastBook && lastBook.code) { 
            const parts = lastBook.code.split(" ")[0].split("."); // "XXX-XX.XX v.#" -> ["XXX-XX", "XX"]
            if (parts.length >= 2) {
                const lastSeq = parseInt(parts[1], 10); // pega a parte "XX" do código e converte para número
                seq = (lastSeq + 1).toString().padStart(2, "0");
            }
            else {
                const msg = `Formato de código inesperado no último livro encontrado: ${lastBook.code}`;
                console.warn("🟡 [BooksService]", msg);
                throw new Error(msg);
            }
        }
        // Converte área e subárea para o formato esperado no código (XXX-XX)
        const areaCode = areaMapping[bookData.area] || "XXX";
        const subareaNum = subareaMapping[areaCode]?.[bookData.subarea] || 0;
        const subareaCode = String(subareaNum).padStart(2, "0");
        
        // Monta o código final no formato "XXX-XX.XX" ou "XXX-XX.XX v.#" se tiver volume
        const baseCode = `${areaCode}-${subareaCode}.${seq}`;
        if (bookData.volume && bookData.volume !== 0) {
            const code = `${baseCode} v.${bookData.volume}`;
            console.log("🟢 [BooksService] Código de livro com volume gerado:", code);
            return code;
        } else {
            console.log("🟢 [BooksService] Código de livro gerado:", baseCode);
            return baseCode;
        }
    }
}

module.exports = new BooksService();