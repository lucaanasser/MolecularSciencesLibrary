// BooksService contém toda a lógica de negócio relacionada a livros
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const booksModel = require('../../models/library/BooksModel');
const DonatorsModel = require('../../models/library/DonatorsModel');
const RulesService = require('../utilities/RulesService');

// ==================== MAPEAMENTOS ====================
// A DB armazena: area = "FIS", subarea = 1
// O Frontend usa: area = "Física", subarea = "Física Geral"

// Nome amigável -> Código da DB
const areaNameToCode = {
    "Física": "FIS",
    "Química": "QUI",
    "Biologia": "BIO",
    "Matemática": "MAT",
    "Computação": "CMP",
    "Variados": "VAR"
};

// Código da DB -> Nome amigável
const areaCodeToName = Object.fromEntries(
    Object.entries(areaNameToCode).map(([name, code]) => [code, name])
);

// Subáreas por área (nome amigável -> número da DB)
const subareaNameToCode = {
    "FIS": { 
        "Física Geral": 1, 
        "Mecânica": 2, 
        "Termodinâmica": 3,
        "Eletromagnetismo": 4,
        "Física Moderna": 5,
        "Física Matemática": 6, 
        "Astronomia e Astrofísica": 7,
    },
    "QUI": { 
        "Química Geral": 1, 
        "Fisico-Química": 2, 
        "Química Inorgânica": 3,
        "Química Orgânica": 4,
        "Química Experimental": 5, 
    },
    "BIO": { 
        "Bioquímica": 1, 
        "Biologia Molecular e Celular": 2, 
        "Genética e Evolução": 3,
        "Biologia de Sistemas": 4,
        "Desenvolvimento": 5,
        "Ecologia": 6,
        "Botânica": 7,
    },
    "MAT": { 
        "Cálculo": 1,
        "Geometria Analítica": 2,
        "Álgebra Linear": 3,
        "Análise": 4,
        "Álgebra Abstrata": 5,
        "Topologia e Geometria": 6,
        "Lógica e Fundamentos": 7
    },
    "CMP": { 
        "Fundamentos de Computação": 1,
        "Algorítmos e Estruturas de Dados": 2,
        "Análise Numérica": 3,
        "Probabilidade e Estatística": 4, 
        "Teoria da Computação": 5,
        "Programação": 6,
        "Sistemas e Redes": 7
    },
    "VAR": { 
        "Divulgação Científica": 1,
        "Filosofia e História da Ciência": 2,
        "Handbooks e Manuais": 3,
        "Interdisciplinares": 4,
        "Miscelânea": 5, 
    }
};

// Gera mapeamento inverso: número -> nome por área
const subareaCodeToName = {};
for (const [areaCode, subareas] of Object.entries(subareaNameToCode)) {
    subareaCodeToName[areaCode] = Object.fromEntries(
        Object.entries(subareas).map(([name, code]) => [code, name])
    );
}

// ==================== FUNÇÕES DE CONVERSÃO ====================

/**
 * Converte nome amigável da área para código da DB
 * @param {string} areaName - Nome amigável (ex: "Física")
 * @returns {string} Código da DB (ex: "FIS") ou o próprio valor se já for código
 */
function toAreaCode(areaName) {
    if (!areaName) return null;
    // Se já é um código válido, retorna ele mesmo
    if (areaCodeToName[areaName]) return areaName;
    // Senão, converte nome -> código
    return areaNameToCode[areaName] || areaName;
}

/**
 * Converte código da área da DB para nome amigável
 * @param {string} areaCode - Código da DB (ex: "FIS")
 * @returns {string} Nome amigável (ex: "Física") ou o próprio valor se já for nome
 */
function toAreaName(areaCode) {
    if (!areaCode) return null;
    // Se já é um nome válido, retorna ele mesmo
    if (areaNameToCode[areaCode]) return areaCode;
    // Senão, converte código -> nome
    return areaCodeToName[areaCode] || areaCode;
}

/**
 * Converte nome da subárea para código numérico
 * @param {string} areaCode - Código da área (ex: "FIS")
 * @param {string|number} subareaName - Nome ou número da subárea
 * @returns {number|null} Código numérico da subárea
 */
function toSubareaCode(areaCode, subareaName) {
    if (subareaName === null || subareaName === undefined) return null;
    // Se já é número, retorna como número
    if (typeof subareaName === 'number') return subareaName;
    const num = parseInt(subareaName, 10);
    if (!isNaN(num)) return num;
    // Senão, converte nome -> código
    const resolvedAreaCode = toAreaCode(areaCode);
    return subareaNameToCode[resolvedAreaCode]?.[subareaName] || null;
}

/**
 * Converte código numérico da subárea para nome amigável
 * @param {string} areaCode - Código da área (ex: "FIS")
 * @param {number} subareaCode - Código numérico da subárea
 * @returns {string|null} Nome amigável da subárea
 */
function toSubareaName(areaCode, subareaCode) {
    if (subareaCode === null || subareaCode === undefined) return null;
    const resolvedAreaCode = toAreaCode(areaCode);
    return subareaCodeToName[resolvedAreaCode]?.[subareaCode] || String(subareaCode);
}

/**
 * Converte um livro da DB para formato do frontend (com nomes amigáveis)
 * @param {Object} book - Livro com dados da DB
 * @returns {Object} Livro com nomes amigáveis
 */
function bookToFrontend(book) {
    if (!book) return null;
    return {
        ...book,
        areaCode: book.area, // mantém código original
        subareaCode: book.subarea, // mantém código original
        area: toAreaName(book.area),
        subarea: toSubareaName(book.area, book.subarea)
    };
}

/**
 * Converte dados do frontend para formato da DB (com códigos)
 * @param {Object} data - Dados com nomes amigáveis
 * @returns {Object} Dados com códigos da DB
 */
function frontendToDB(data) {
    if (!data) return null;
    const areaCode = toAreaCode(data.area);
    return {
        ...data,
        area: areaCode,
        subarea: toSubareaCode(areaCode, data.subarea)
    };
}

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
        // Gera 12 dígitos aleatórios
        let base12 = '';
        for (let i = 0; i < 12; i++) {
            base12 += Math.floor(Math.random() * 10).toString();
        }
        const check = ean13Checksum(base12);
        ean = Number(`${base12}${check}`);
        exists = await booksModel.getBookById(ean);
    }
    return ean;
}

class BooksService {
    /**
     * Busca livros para autocomplete (retorna apenas informações básicas)
     * @param {string} query - Termo de busca
     * @param {number} limit - Limite de resultados
     * @returns {Promise<Array>} Lista simplificada de livros
     */
    async searchBooks(query, limit = 10) {
        try {
            console.log(`🔵 [BooksService] Autocomplete: query="${query}", limit=${limit}`);
            
            if (!query || query.length < 2) {
                return [];
            }
            
            const books = await booksModel.searchBooks(query, limit);
            
            // Retorna informações essenciais com nomes amigáveis para o frontend
            const results = books.map(book => ({
                id: book.id,
                code: book.code,
                title: book.title,
                authors: book.authors,
                areaCode: book.area,
                subareaCode: book.subarea,
                area: toAreaName(book.area),
                subarea: toSubareaName(book.area, book.subarea)
            }));
            
            console.log(`🟢 [BooksService] ${results.length} resultados de autocomplete`);
            return results;
        } catch (error) {
            console.error("🔴 [BooksService] Erro no autocomplete:", error.message);
            throw error;
        }
    }

    /**
     * Conta total de livros com filtros aplicados
     * @param {Object} filters - Filtros de busca
     * @returns {Promise<number>} Total de livros
     */
    async countBooks(filters) {
        try {
            console.log(`🔵 [BooksService] Contando livros com filtros:`, filters);
            
            // Converte filtros do frontend para códigos da DB
            const areaCode = toAreaCode(filters.category);
            const subareaCode = toSubareaCode(areaCode, filters.subcategory);
            const searchTerm = filters.q || filters.search || null;
            const onlyReserved = filters.reserved === 'true' ? true : (filters.reserved === 'false' ? false : null);
            
            const count = await booksModel.countBooks(areaCode, subareaCode, searchTerm, onlyReserved);
            
            console.log(`🟢 [BooksService] Total: ${count} livros`);
            return count;
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao contar livros:", error.message);
            throw error;
        }
    }

    async generateBookCode({ area, subarea, addType, selectedBook, volume }) {
        console.log(`🔵 [BooksService] Gerando código para livro: area=${area}, subarea=${subarea}, addType=${addType}, volume=${volume}`);
        // Converte para códigos da DB
        const areaCode = toAreaCode(area) || "XXX";
        const subareaNum = toSubareaCode(areaCode, subarea);
        const subareaCode = String(subareaNum || subarea).padStart(2, "0");

        // NOVO EXEMPLAR: retorna o mesmo código do livro base
        if (addType === "exemplar" && selectedBook && selectedBook.code) {
            console.log("🟡 [BooksService] Novo exemplar, reutilizando código:", selectedBook.code);
            return selectedBook.code;
        }

        // NOVO VOLUME: substitui o volume no código base por v.{volume}
        if (addType === "volume" && selectedBook && selectedBook.code) {
            let baseCode = selectedBook.code;
            // remove sufixo de volume em formatos "-v1", " v1" ou " v.1"
            baseCode = baseCode.replace(/[\s-]?v\.?\d+$/i, "");
            const newCode = `${baseCode} v.${parseInt(volume, 10)}`;
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
            const code = `${baseCode} v.${parseInt(volume, 10)}`;
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
                volume,
                code: providedCode
            } = bookData;

            // Converte área e subárea do frontend para códigos da DB
            const areaCode = toAreaCode(area);
            const subareaNum = toSubareaCode(areaCode, subarea);
            
            // Se o código foi fornecido (ex: importação CSV), usa ele
            // Caso contrário, gera automaticamente
            let code;
            if (providedCode && addType === 'csv_import') {
                code = providedCode;
                console.log("🟡 [BooksService] Usando código fornecido:", code);
            } else {
                code = await this.generateBookCode({ area, subarea, addType, selectedBook, volume });
            }

            // Gere EAN-13 automaticamente (ou use o barcode fornecido)
            const id = bookData.barcode && bookData.barcode.length === 13 ? 
                       Number(bookData.barcode) : 
                       await generateUniqueEAN13();

            const bookToInsert = {
                id,
                area: areaCode,
                subarea: subareaNum,
                authors,
                edition,
                language,
                code,
                title,
                subtitle,
                volume: volume && volume !== "null" ? parseInt(volume, 10) : null,
                is_reserved: 0 
            };

            const result = await booksModel.insertBook(bookToInsert);

            console.log("🟢 [BooksService] Livro inserido com sucesso:", { id, code });
            return { id, code /*, barcodeImage: pngBuffer */ };
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao adicionar livro:", error.message);
            throw error;
        }
    }

    async getBooks(filters) {
        try {
            console.log(`[BooksService] Buscando livros:`, filters);
            
            // Converte filtros do frontend para códigos da DB
            const areaCode = toAreaCode(filters.category);
            const subareaCode = toSubareaCode(areaCode, filters.subcategory);
            const searchTerm = filters.q || filters.search || null;
            const onlyReserved = filters.reserved === 'true' ? true : (filters.reserved === 'false' ? false : null);
            
            // Paginação
            const limit = filters.limit ? parseInt(filters.limit) : null;
            const offset = filters.offset ? parseInt(filters.offset) : 0;
            
            // Busca livros do banco (com paginação se limit for fornecido)
            const books = await booksModel.getBooks(areaCode, subareaCode, searchTerm, onlyReserved, limit, offset);
            const borrowed = await booksModel.getBorrowedBooks();
            const rules = await RulesService.getRules();
            const windowDays = rules?.extension_window_days ?? 3;
            const now = new Date();
            const borrowedMap = {};
            borrowed.forEach(b => { borrowedMap[b.book_id] = b; });
            // Calcula status e outros campos
            let result = books.map(book => {
                const loan = borrowedMap[book.id];
                let overdue = false;
                if (loan && loan.due_date) {
                    const dueDate = new Date(loan.due_date);
                    overdue = dueDate < now;
                }
                let status = "disponível";
                if (loan && overdue) status = "atrasado";
                else if (loan) status = "emprestado";
                else if (book.is_reserved === 1) status = "reserva didática";
                let due_in_window = false;
                const is_extended = loan?.is_extended === 1;
                if (loan && loan.due_date && !overdue) {
                    const dueDate = new Date(loan.due_date);
                    const diffDays = Math.ceil((dueDate - now)/(1000*60*60*24));
                    if (diffDays >= 0 && diffDays <= windowDays && !is_extended) due_in_window = true;
                }
                return {
                    ...book,
                    // Converte área e subárea para nomes amigáveis no frontend
                    areaCode: book.area,
                    subareaCode: book.subarea,
                    area: toAreaName(book.area),
                    subarea: toSubareaName(book.area, book.subarea),
                    available: !loan,
                    overdue,
                    status,
                    student_id: loan ? loan.student_id : null,
                    loan_id: loan ? loan.loan_id : null,
                    due_in_window,
                    is_extended,
                    due_date: loan?.due_date || null
                };
            });
            // Filtro para livros estendidos
            if (filters.extended === true || filters.extended === 'true') {
                result = result.filter(book => book.is_extended === true);
            }
            // Filtra por status se solicitado, mas sempre mantém o filtro textual
            if (filters.status) {
                result = result.filter(book => book.status === filters.status);
            }
            console.log(`[BooksService] Livros encontrados: ${result.length}`);
            return result;
        } catch (error) {
            console.error("[BooksService] Erro ao buscar livros:", error.message);
            throw error;
        }
    }

    async getBookById(id) {
        try {
            console.log(`🔵 [BooksService] Buscando livro por id: ${id}`);
            const book = await booksModel.getBookById(id);
            
            if (!book) {
                console.log(`🟡 [BooksService] Livro não encontrado: ${id}`);
                return null;
            }
            
            // Buscar informações do doador
            const donator = await DonatorsModel.getDonatorByBookId(id);
            if (donator) {
                book.donator_name = donator.name;
            }
            
            // Converte para formato do frontend
            const result = {
                ...book,
                areaCode: book.area,
                subareaCode: book.subarea,
                area: toAreaName(book.area),
                subarea: toSubareaName(book.area, book.subarea)
            };
            
            console.log(`🟢 [BooksService] Livro encontrado: ${result.title}`);
            return result;
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao buscar livro por id: ${error.message}`);
            throw error;
        }
    }

    async borrowBook(bookId, studentId) {
        try {
            console.log(`🔵 [BooksService] Emprestando livro bookId=${bookId} para studentId=${studentId}`);
            // Busca o livro para verificar se é reserva didática
            const book = await booksModel.getBookById(bookId);
            if (book && book.is_reserved === 1) {
                const msg = `Livro ${bookId} está marcado como reserva didática e não pode ser emprestado.`;
                console.warn(`🟡 [BooksService] ${msg}`);
                throw new Error(msg);
            }
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
        
        // Formato para o frontend: usa nomes amigáveis
        // areas: { "Física": "Física", ... } - chave = valor para facilitar uso no Select
        // subareas: { "Física": { "Física Geral": "Física Geral", ... } }
        const areas = {};
        const subareas = {};
        
        for (const [areaName, areaCode] of Object.entries(areaNameToCode)) {
            areas[areaName] = areaName;
            
            // Converte subáreas para formato nome: nome
            subareas[areaName] = {};
            const areaSubareas = subareaNameToCode[areaCode] || {};
            for (const subareaName of Object.keys(areaSubareas)) {
                subareas[areaName][subareaName] = subareaName;
            }
        }
        
        const mappings = {
            areas,
            subareas,
            // Mantém mapeamentos internos para compatibilidade
            areaNameToCode,
            areaCodeToName,
            subareaNameToCode,
            subareaCodeToName
        };
        console.log("🟢 [BooksService] Mapeamentos obtidos");
        return mappings;
    }

    async setReservedStatus(bookId, isReserved) {
        try {
            console.log(`🔵 [BooksService] Alterando status de reserva didática: bookId=${bookId}, isReserved=${isReserved}`);
            await booksModel.setReservedStatus(bookId, isReserved);
            console.log(`🟢 [BooksService] Status de reserva didática alterado: bookId=${bookId}, isReserved=${isReserved}`);
            return { success: true, is_reserved: isReserved };
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao alterar status de reserva didática: ${error.message}`);
            throw error;
        }
    }

    async getReservedBooks() {
        try {
            console.log(`🔵 [BooksService] Buscando livros reservados didaticamente`);
            const books = await booksModel.getBooks(null, null, null, true);
            console.log(`🟢 [BooksService] Livros reservados encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksService] Erro ao buscar livros reservados:", error.message);
            throw error;
        }
    }

    async clearAllReservedBooks() {
        try {
            console.log(`🔵 [BooksService] Removendo todos os livros da reserva didática`);
            const result = await booksModel.clearAllReservedBooks();
            console.log(`🟢 [BooksService] Todos os livros removidos da reserva didática`);
            return { success: true, message: 'Todos os livros foram removidos da reserva didática', affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`🔴 [BooksService] Erro ao limpar reserva didática: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new BooksService();