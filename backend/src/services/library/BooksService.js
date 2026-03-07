/* BooksService contém toda a lógica de negócio relacionada a livros
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const BooksModel = require('../../models/library/BooksModel');
const { escapeCSV, importFromCSV } = require('../../utils/csvUtils');
const { areaMapping, subareaMapping, validateArea, validateSubarea } = require('../../utils/validBookAreas.js');

class BooksService {

    constructor() {
        this.allFields = ['id', 'code', 'area', 'subarea', 'title', 'subtitle', 'authors', 'edition', 'volume', 'language', 'status'];
        this.requiredFields = ['area', 'subarea',  'title',  'authors', 'edition', 'volume', 'language'];
        this.basicFields = ['id', 'code', 'title', 'authors', 'area']; // campos básicos para autocomplete - possivelmente mudar, não sei se são os melhores
    }
    
    /**
     * Adiciona um novo livro ao sistema.
     * Valida área/subárea, gera códigos, limpa campos e insere no banco.
     * 
     * @param {Object} bookData - Dados do livro. Esperado:
     *   {
     *     id?: number,           // EAN-13 (opcional)
     *     code?: string,         // Código de posição (opcional)
     *     area: string,          // Área (obrigatório) -- o valor deve ser um dos keys de areaMapping
     *     subarea: string,       // Subárea (obrigatório) -- o valor deve ser um dos keys de subareaMapping[areaMapping[area]]
     *     title: string,         // Título (obrigatório)
     *     subtitle?: string,     // Subtítulo (opcional)
     *     authors: string,       // Autores (obrigatório)
     *     edition: number,       // Edição (obrigatório)
     *     volume: number,        // Volume (obrigatório)
     *     language: string,      // Idioma (obrigatório)
     *     status?: string        // Status (opcional, padrão "disponível")
     *   }
     * @param {string|null} selectedBookcode - Código de referência para exemplares/volumes já catalogados (opcional)
     * @returns {Promise<Object>} Resultado da inserção
     * @throws {Error} Caso alguma validação falhe ou ocorra erro no processo
     */
    async addBook(bookData, selectedBookcode = null) {
        console.log("🔵 [BooksService] Iniciando adição de livro:", bookData.title);
        
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
                code = await this._generateBookCode(bookData, selectedBookcode);
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

        // Usa edição fornecida ou define como 1
        if (!bookData.edition) {
            bookData.edition = 1;
            console.log("🟡 [BooksService] Edição não fornecida, definida como 1ª");
        }

        // Limpa espaços extras de todos os campos string
        for (const field of this.allFields) {
            if (typeof bookData[field] === "string") {
                bookData[field] = bookData[field].replace(/\s+/g, ' ').trim();
            }
        }

        // Monta objeto do livro com todos os campos para inserção
        const bookToInsert = {};
        for (const field of this.allFields) {
            if (field === 'id') bookToInsert.id = id;
            else if (field === 'code') bookToInsert.code = code;
            else bookToInsert[field] = bookData[field] || (field === 'status' ? "disponível" : null);
        }
        try {
            const result = await BooksModel.addBook(bookToInsert);
            console.log("🟢 [BooksService] Livro inserido com sucesso: ", id);
            return result;
        }
        catch (error) {
            console.error("🔴 [BooksService] Erro ao inserir livro: ", error.message);
            throw error;
        }
    }

    /**
     * Importa livros a partir de um arquivo CSV.
     * @param {Object} file - Arquivo CSV (buffer)
     * @returns {Promise<Object>} Resultado da importação:
     *   {
     *     success: number  -- número de importações bem sucedidas
     *     failed: number   -- número de importações falhas
     *     errors: string[] -- log dos erros ocorridos durante a importação
     *   }
     * @throws {Error} Caso ocorra erro na importação
     */
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
            mapRow: (rowData) => {
                const row = {};
                for (const field in rowData) {
                    let value = rowData[field];
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
            addFn: this.addBook.bind(this),
            logger
        });
    }

    /**
     * Busca livros para autocomplete.
     * @param {string} q - Query de busca
     * @param {number} limit - Limite de resultados
     * @returns {Promise<Array>} Lista de livros encontrados
     */
    async searchBooks(q = null, limit = 10) {
        if (!q || q.trim().length == 0) {
            console.warn("🟡 [BooksService] Consulta de autocomplete com query vazia, retornando array vazio");
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

    /**
     * Busca livros com filtros.
     * 
     * @param {Object} filters - Filtros de busca. Campos aceitos:
     *   {
     *     q?: string,  -- query
     *     area?: string | string[],
     *     subarea?: string | string[],
     *     status?: string | string[],
     *   }
     * @param {number|null} limit - Limite de resultados
     * @param {number} offset - Offset de resultados
     * @returns {Promise<Array>} Lista de livros encontrados
     */
    async getBooks(filters = {}) {
        console.log(`🔵[BooksService] Buscando livros com filtros:`, filters);
        try {
            const result = await BooksModel.getBooks(filters);
            console.log(`🟢 [BooksService] Livros encontrados: ${result.length}`);
            return result;
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao buscar livros: ", error.message);
            throw error;
        }
    }

    /**
     * Busca livros agrupados por um campo específico.
     * @param {string} field - Campo para agrupar
     * @returns {Promise<Array>} Lista de livros encontrados
     * 
     * OBSERVAÇÃO: Atualmente não está na rota pois só era usada internamente por ReportsService
     */
    async getBooksBy(field) {
        console.log(`🔵 [BooksService] Buscando livros agrupados por ${field}`);
        if (!this.allFields.includes(field)) {
            console.warn(`🟡 [BooksService] Campo ${field} não é válido. Campos válidos: ${this.allFields.join(', ')}`);
            throw new Error(`Campo inválido: ${field}. Campos válidos: ${this.allFields.join(', ')}`);
        }
        try {
            // Busca todos os livros daquele campo
            const books = await BooksModel.getBooksBy(field);
            console.log(`🟢 [BooksService] Livros agrupados por ${field}: ${Object.keys(books).length} grupos`);
            return books;
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao agrupar livros por ${field}:`, error.message);
            throw error;
        }
    }

    /**
     * Conta livros com filtros.
     * @param {Object} filters - Filtros de busca. Campos aceitos: os mesmos de getBooks()
     * @returns {Promise<number>} Total de livros encontrados
     */
    async countBooks(filters = {}) {
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

    /**
     * Conta livros agrupados por um campo específico.
     * @param {string} field - Campo para agrupar (area, subarea, status, language)
     * @returns {Promise<number>} Total de livros encontrados
     * 
     * OBSERVAÇÃO: Atualmente não está na rota pois só é usada internamente por ReportsService
     */
    async countBooksBy(field) {
        console.log(`🔵 [BooksService] Contando livros agrupados por ${field}`);
        if (!this.allFields.includes(field)) {
            console.warn(`🟡 [BooksService] Campo ${field} não é válido. Campos válidos: ${this.allFields.join(', ')}`);
            throw new Error(`Campo inválido: ${field}. Campos válidos: ${this.allFields.join(', ')}`);
        }
        try {
            const count = await BooksModel.countBooksBy(field);
            console.log(`🟢 [BooksService] Contagem agrupada por ${field} concluída`);
            return count;
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao contar livros por ${field}:`, error.message);
            throw error;
        }
    }

    /**
     * Exporta catálogo de livros para CSV.
     * @returns {Promise<string>} CSV dos livros
     * @throws {Error} Caso ocorra erro
     */
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

    /**
     * Altera status de reserva didática de um livro.
     * @param {number} id - ID do livro
     * @param {boolean} status - Status de reserva
     * @returns {Promise<Object>} Resultado da operação
     * @throws {Error} Caso ocorra erro
     */
    async setReservedStatus(id, status) {
        console.log(`🔵 [BooksService] Alterando status de reserva didática: bookId=${id}, status=${status}`);
        const book = await this.getBookById(id);
        try {
            const indifferent = (status && book.status === "reservado") || (!status && book.status !== "reservado");
            if (indifferent) {
                console.warn(`🟡 [BooksService] Status de reserva didática já é ${book.status} para o livro id=${id}`);
                throw new Error(`Livro "${book.title}" ${status ? "já" : "não"} estava reservado`);
            }
            await BooksModel.setReservedStatus(id, status);
            console.log(`🟢 [BooksService] Status de reserva didática alterado: bookId=${id}, status=${status}`);
            return { success: true, book: book.title, is_reserved: status };
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao alterar status de reserva didática para ${book.title}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Remove todos os livros da reserva didática.
     * @returns {Promise<Object>} Resultado da operação
     * @throws {Error} Caso ocorra erro
     */
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

    /**
     * Busca livros reservados didaticamente.
     * @returns {Promise<Array>} Lista de livros reservados
     * @throws {Error} Caso ocorra erro
     */
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

    /**
     * Busca livro por ID.
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Livro encontrado
     * @throws {Error} Caso ocorra erro
     */
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

    async getBooksByCode(code) {
        console.log(`🔵 [BooksService] Buscando livros pelo código: ${code}`);
        try {
            const books = await BooksModel.getBooksByCode(code);
            console.log(`🟢 [BooksService] Livros encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao buscar livros pelo código:", error.message);
            throw error;
        }
    }

    /**
     * Remove livro por ID.
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Resultado da remoção
     * @throws {Error} Caso ocorra erro
     */
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

    /**
     * Gera um código EAN-13 único para livro.
     * @returns {Promise<number>} Código EAN-13
     */
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

    /**
     * Gera código de posição para livro.
     * @param {Object} bookData - Dados do livro. Campos aceitos: os mesmos de addBook()
     * @param {string|null} selectedBookcode - Código de referência
     * @returns {Promise<string>} Código gerado
     */
    async _generateBookCode(bookData, selectedBookcode) {
        console.log(`🔵 [BooksService] Gerando código para o livro`);
        
        // LIVRO EXISTENTE: reutiliza o código do livro selecionado, ajustando volume se necessário
        if (selectedBookcode) {
            // Extrai o volume do livro selecionado
            const match = selectedBookcode.match(/ v\.(\d+)$/i);
            const referenceVolume = match ? parseInt(match[1], 10) : 0;
            
            // NOVO EXEMPLAR: volume é igual ao do livro selecionado
            if (bookData.volume === referenceVolume) {
                console.log("🟡 [BooksService] Novo exemplar, reutilizando código:", selectedBookcode);
                return selectedBookcode;
            }
            
            // NOVO VOLUME: volume diferente do livro selecionado
            else {
                let baseCode = selectedBookcode.replace(/ v\.\d+$/i, ""); // remove sufixo de volume
                if (bookData.volume === 0) return baseCode;
                const newCode = `${baseCode} v.${parseInt(bookData.volume, 10)}`;
                console.log("🟡 [BooksService] Novo volume, código gerado:", newCode);
                return newCode;
            }
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