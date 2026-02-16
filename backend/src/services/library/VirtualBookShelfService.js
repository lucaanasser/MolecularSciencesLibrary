// VirtualBookShelfService contém a lógica de negócio para ordenação dos livros na estante virtual
// Nova lógica: Admin define código INICIAL de cada prateleira, código final é calculado automaticamente
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const VirtualBookShelfModel = require('../../models/library/VirtualBookShelfModel');
const BooksModel = require('../../models/library/BooksModel');

/**
 * Service responsável pela lógica de ordenação da estante virtual
 */
class VirtualBookShelfService {

    /**
     * Ordem das áreas para classificação
     */
    static AREA_ORDER = ['BIO', 'QUI', 'FIS', 'MAT', 'CMP', 'VAR'];

    /**
     * Mapeamento de nomes de área para códigos
     */
    static AREA_NAME_TO_CODE = {
        'Biologia': 'BIO',
        'Química': 'QUI', 
        'Física': 'FIS',
        'Matemática': 'MAT',
        'Computação': 'CMP',
        'Variados': 'VAR'
    };

    /**
     * Obtém todas as configurações de prateleiras com códigos finais calculados
     */
    async getShelvesConfig() {
        console.log("🔵 [VirtualBookShelfService] Obtendo configurações das prateleiras");
        try {
            const shelves = await VirtualBookShelfModel.getAllShelves();
            // Calcula e atualiza códigos finais automaticamente
            const shelvesWithCalculatedEnds = await this.calculateEndCodes(shelves);
            console.log(`🟢 [VirtualBookShelfService] Configurações obtidas: ${shelves.length}`);
            return shelvesWithCalculatedEnds;
        } catch (error) {
            console.error("🔴 [VirtualBookShelfService] Erro ao obter configurações:", error.message);
            throw error;
        }
    }

    /**
     * Calcula automaticamente os códigos finais baseado nos códigos iniciais
     */
    async calculateEndCodes(shelves) {
        console.log("🔵 [VirtualBookShelfService] Calculando códigos finais das prateleiras");
        
        // Ordena prateleiras por estante e depois por prateleira
        const sortedShelves = shelves.sort((a, b) => {
            if (a.shelf_number !== b.shelf_number) {
                return a.shelf_number - b.shelf_number;
            }
            return a.shelf_row - b.shelf_row;
        });

        const result = [];
        
        for (let i = 0; i < sortedShelves.length; i++) {
            const currentShelf = { ...sortedShelves[i] };
            
            if (!currentShelf.book_code_start) {
                // Se não tem código inicial, não pode calcular final
                currentShelf.calculated_book_code_end = null;
                result.push(currentShelf);
                continue;
            }

            // Encontra a próxima prateleira com código inicial definido
            let nextShelfWithCode = null;
            for (let j = i + 1; j < sortedShelves.length; j++) {
                if (sortedShelves[j].book_code_start) {
                    nextShelfWithCode = sortedShelves[j];
                    break;
                }
            }

            if (nextShelfWithCode) {
                // O código final é um antes do código inicial da próxima prateleira
                currentShelf.calculated_book_code_end = this.getPreviousCode(nextShelfWithCode.book_code_start);
            } else {
                // É a última prateleira com código definido
                // Usa o book_code_end se foi definido manualmente, senão deixa null
                currentShelf.calculated_book_code_end = currentShelf.book_code_end || null;
            }

            result.push(currentShelf);
        }

        console.log("🟢 [VirtualBookShelfService] Códigos finais calculados");
        return result;
    }

    /**
     * Calcula o código anterior a um dado código
     * Ex: "BIO-03.05 v.1" -> "BIO-03.04 v.1"
     * Ex: "BIO-03.01 v.1" -> "BIO-02.99 v.1"
     */
    getPreviousCode(code) {
        try {
            if (!code) return null;

            const parsed = this.parseBookCode(code);
            
            if (parsed.sequential > 1) {
                // Decrementa o sequencial
                const previousSeq = (parsed.sequential - 1).toString().padStart(2, '0');
                const volumePart = parsed.volume > 0 ? ` v.${parsed.volume}` : '';
                return `${parsed.area}-${parsed.subarea.toString().padStart(2, '0')}.${previousSeq}${volumePart}`;
            } else if (parsed.subarea > 1) {
                // Se sequencial é 1, vai para subárea anterior com sequencial 99
                const previousSubarea = (parsed.subarea - 1).toString().padStart(2, '0');
                const volumePart = parsed.volume > 0 ? ` v.${parsed.volume}` : '';
                return `${parsed.area}-${previousSubarea}.99${volumePart}`;
            } else {
                // Se também é subárea 1, vai para área anterior
                const areaIndex = VirtualBookShelfService.AREA_ORDER.indexOf(parsed.area);
                if (areaIndex > 0) {
                    const previousArea = VirtualBookShelfService.AREA_ORDER[areaIndex - 1];
                    const volumePart = parsed.volume > 0 ? ` v.${parsed.volume}` : '';
                    return `${previousArea}-99.99${volumePart}`;
                }
            }

            return null;
        } catch (error) {
            console.warn(`🟡 [VirtualBookShelfService] Erro ao calcular código anterior para ${code}:`, error.message);
            return null;
        }
    }

    /**
     * Atualiza configurações das prateleiras
     */
    async updateShelvesConfig(shelvesConfig) {
        console.log("🔵 [VirtualBookShelfService] Atualizando configurações das prateleiras");
        try {
            await VirtualBookShelfModel.updateShelvesConfig(shelvesConfig);
            console.log("🟢 [VirtualBookShelfService] Configurações atualizadas com sucesso");
            return { success: true };
        } catch (error) {
            console.error("🔴 [VirtualBookShelfService] Erro ao atualizar configurações:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza o código inicial de uma prateleira específica
     */
    async updateShelfStartCode(shelf_number, shelf_row, book_code_start) {
        console.log(`🔵 [VirtualBookShelfService] Atualizando código inicial da prateleira ${shelf_number}-${shelf_row}`);
        try {
            // Valida o código do livro antes de salvar
            if (book_code_start) {
                const validation = await this.validateBookCode(book_code_start);
                if (!validation.isValid) {
                    throw new Error(`Código de livro inválido: ${book_code_start}`);
                }
            }

            await VirtualBookShelfModel.updateShelfStartCode(shelf_number, shelf_row, book_code_start);
            console.log("🟢 [VirtualBookShelfService] Código inicial atualizado com sucesso");
            return { success: true };
        } catch (error) {
            console.error("🔴 [VirtualBookShelfService] Erro ao atualizar código inicial:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza o código final de uma prateleira específica
     */
    async updateShelfEndCode(shelf_number, shelf_row, book_code_end) {
        console.log(`🔵 [VirtualBookShelfService] Atualizando código final da prateleira ${shelf_number}-${shelf_row}`);
        try {
            // Valida o código do livro antes de salvar
            if (book_code_end) {
                const validation = await this.validateBookCode(book_code_end);
                if (!validation.isValid) {
                    throw new Error(`Código de livro inválido: ${book_code_end}`);
                }
            }

            await VirtualBookShelfModel.updateShelfEndCode(shelf_number, shelf_row, book_code_end);
            console.log("🟢 [VirtualBookShelfService] Código final atualizado com sucesso");
            return { success: true };
        } catch (error) {
            console.error("🔴 [VirtualBookShelfService] Erro ao atualizar código final:", error.message);
            throw error;
        }
    }

    /**
     * Obtém todos os livros ordenados conforme a lógica da estante virtual
     */
    async getAllBooksOrdered() {
        console.log("🔵 [VirtualBookShelfService] Ordenando todos os livros para estante virtual");
        try {
            const books = await BooksModel.getAllBooks();
            const borrowed = books.filter(b => b.status === "emprestado");
            // Garante que book_id e id são do mesmo tipo (number)
            const borrowedSet = new Set(
                borrowed.map(b => Number(b.book_id))
            );
            // Adiciona o status disponível a cada livro e converte area para código
            const booksWithAvailability = books.map(book => ({
                ...book,
                area: VirtualBookShelfService.AREA_NAME_TO_CODE[book.area] || book.area,
                available: !borrowedSet.has(Number(book.id))
            }));
            const orderedBooks = this.sortBooks(booksWithAvailability);
            console.log(`🟢 [VirtualBookShelfService] Livros ordenados: ${orderedBooks.length}`);
            return orderedBooks;
        } catch (error) {
            console.error("🔴 [VirtualBookShelfService] Erro ao ordenar livros:", error.message);
            throw error;
        }
    }

    /**
     * Ordena os livros seguindo a lógica:
     * 1. Por área (BIO, QUI, FIS, MAT, CMP, VAR)
     * 2. Por subárea (numerical ascending)
     * 3. Por sequencial (ascending within subarea)
     * 4. Por volume (v1, v2, v3...)
     */
    sortBooks(books) {
        console.log("🔵 [VirtualBookShelfService] Aplicando ordenação customizada dos livros");
        
        return books.sort((a, b) => {
            return this.compareBookCodes(a.code, b.code);
        });
    }

    /**
     * Compara dois códigos de livros no formato BIO-03.02 v.1
     * Retorna -1 se a < b, 1 se a > b, 0 se iguais
     */
    compareBookCodes(codeA, codeB) {
        const parsedA = this.parseBookCode(codeA);
        const parsedB = this.parseBookCode(codeB);
        
        // 1. Comparar por área
        const areaIndexA = VirtualBookShelfService.AREA_ORDER.indexOf(parsedA.area);
        const areaIndexB = VirtualBookShelfService.AREA_ORDER.indexOf(parsedB.area);
        
        if (areaIndexA !== areaIndexB) {
            return areaIndexA - areaIndexB;
        }

        // 2. Comparar por subárea
        if (parsedA.subarea !== parsedB.subarea) {
            return parsedA.subarea - parsedB.subarea;
        }

        // 3. Comparar por sequencial
        if (parsedA.sequential !== parsedB.sequential) {
            return parsedA.sequential - parsedB.sequential;
        }

        // 4. Comparar por volume
        return parsedA.volume - parsedB.volume;
    }

    /**
     * Converte um código de livro em suas partes componentes
     * Aceita formatos como "BIO-03.02 v.1" e o formato antigo "BIO-03.02-v1"
     * Ex: "BIO-03.02 v.1" -> {area: "BIO", subarea: 3, sequential: 2, volume: 1}
     */
    parseBookCode(code) {
        try {
            if (!code) {
                return { area: '', subarea: 0, sequential: 0, volume: 0 };
            }

            const normalized = String(code).trim().replace(/\s+/g, ' ');

            // Extrair área, subárea e sequencial
            // Ex.: BIO-03.02 v.1 | BIO-03.02-v1
            const mainMatch = normalized.match(/^([A-Za-z]{3})-(\d{2})\.(\d{2})/);
            if (!mainMatch) {
                // fallback simples: tentar dividir por '-' e '.' como antes
                const parts = normalized.split('-v');
                const mainPart = parts[0] || normalized;
                const mainParts = mainPart.split('-');
                if (mainParts.length < 2) {
                    return { area: mainPart, subarea: 0, sequential: 0, volume: 0 };
                }
                const area = mainParts[0];
                const subareaSeq = mainParts[1];
                const subareaSeqParts = subareaSeq.split('.');
                const subarea = parseInt(subareaSeqParts[0], 10) || 0;
                const sequential = parseInt(subareaSeqParts[1], 10) || 0;
                // Extrair volume pelo padrão com espaço/hífen e com/sem ponto após 'v'
                const volFallback = normalized.match(/(?:^|[\s-])v\.?([0-9]+)\s*$/i);
                const volume = volFallback ? parseInt(volFallback[1], 10) || 0 : 0;
                return { area, subarea, sequential, volume };
            }

            const area = mainMatch[1].toUpperCase();
            const subarea = parseInt(mainMatch[2], 10) || 0;
            const sequential = parseInt(mainMatch[3], 10) || 0;

            // Extrair volume: aceita " v.1", "-v1", " v1", "-v.1"
            const volMatch = normalized.match(/(?:^|[\s-])v\.?([0-9]+)\s*$/i);
            const volume = volMatch ? parseInt(volMatch[1], 10) || 0 : 0;

            return { area, subarea, sequential, volume };
        } catch (error) {
            console.warn(`🟡 [VirtualBookShelfService] Erro ao parsear código ${code}:`, error.message);
            return { area: '', subarea: 0, sequential: 0, volume: 0 };
        }
    }

    /**
     * Retorna uma representação canônica (para comparação) independente do formato de exibição
     * Ex.: BIO-03.02 v.1 | BIO-03.02-v1 -> BIO-03.02-v1
     */
    formatComparableCode(code) {
        const { area, subarea, sequential, volume } = this.parseBookCode(code);
        if (!area) return '';
        const vol = volume > 0 ? `-v${volume}` : '';
        return `${area}-${subarea.toString().padStart(2, '0')}.${sequential.toString().padStart(2, '0')}${vol}`;
    }

    /**
     * Obtém livros para uma prateleira específica baseado nas configurações
     */
    async getBooksForShelf(shelf, allShelves, allBooks = null) {
        console.log(`🔵 [VirtualBookShelfService] Obtendo livros para prateleira ${shelf.shelf_number}-${shelf.shelf_row}`);
        
        try {
            if (!shelf.book_code_start) {
                console.log("🟡 [VirtualBookShelfService] Prateleira sem código inicial definido");
                return [];
            }
            
            // Se não forneceu os livros, busca todos
            if (!allBooks) {
                allBooks = await this.getAllBooksOrdered();
            }

            
            // Calcula códigos finais se necessário
            const shelvesWithEndCodes = await this.calculateEndCodes(allShelves);
            const currentShelfWithEndCode = shelvesWithEndCodes.find(s => 
                s.shelf_number === shelf.shelf_number && s.shelf_row === shelf.shelf_row
            );

            if (!currentShelfWithEndCode || !currentShelfWithEndCode.calculated_book_code_end) {
                console.log("🟡 [VirtualBookShelfService] Não foi possível calcular código final para esta prateleira");
                return [];
            }

            const startCode = shelf.book_code_start;
            const endCode = currentShelfWithEndCode.calculated_book_code_end;

            // Filtra livros que pertencem a esta prateleira usando comparação correta de códigos
            const booksForShelf = allBooks.filter(book => {
                return this.isCodeInRange(book.code, startCode, endCode);
            });

            console.log(`🟢 [VirtualBookShelfService] Livros encontrados para prateleira: ${booksForShelf.length}`);
            return booksForShelf;

        } catch (error) {
            console.error("🔴 [VirtualBookShelfService] Erro ao obter livros da prateleira:", error.message);
            throw error;
        }
    }

    /**
     * Verifica se um código está dentro do range especificado
     * Usa comparação correta considerando a estrutura BIO-03.02 v.1
     */
    isCodeInRange(bookCode, startCode, endCode) {
        const compareWithStart = this.compareBookCodes(bookCode, startCode);
        const compareWithEnd = this.compareBookCodes(bookCode, endCode);
        
        // bookCode >= startCode && bookCode <= endCode
        return compareWithStart >= 0 && compareWithEnd <= 0;
    }

    /**
     * Valida se um código de livro existe
     */
    async validateBookCode(bookCode) {
        console.log(`🔵 [VirtualBookShelfService] Validando código de livro: ${bookCode}`);
        try {
            const books = await BooksModel.getAllBooks();
            const target = this.formatComparableCode(bookCode);
            const book = books.find(b => this.formatComparableCode(b.code) === target);
            
            const isValid = !!book;
            console.log(`🟢 [VirtualBookShelfService] Código ${bookCode} é ${isValid ? 'válido' : 'inválido'}`);
            return { isValid, book };
        } catch (error) {
            console.error("🔴 [VirtualBookShelfService] Erro ao validar código:", error.message);
            throw error;
        }
    }

    /**
     * Adiciona uma nova prateleira a uma estante existente ou nova estante
     */
    async addShelf({ shelf_number, shelf_row, book_code_start = null, book_code_end = null }) {
        console.log(`🔵 [VirtualBookShelfService] Adicionando nova prateleira: estante ${shelf_number}, prateleira ${shelf_row}`);
        try {
            // Verifica se já existe
            const existing = await VirtualBookShelfModel.getShelf(shelf_number, shelf_row);
            if (existing) {
                throw new Error('Já existe uma prateleira com esse número de estante e prateleira.');
            }
            await VirtualBookShelfModel.insertShelf(shelf_number, shelf_row, book_code_start, book_code_end);
            console.log("🟢 [VirtualBookShelfService] Nova prateleira inserida com sucesso");
            return { success: true };
        } catch (error) {
            console.error("🔴 [VirtualBookShelfService] Erro ao adicionar prateleira:", error.message);
            throw error;
        }
    }
}

module.exports = new VirtualBookShelfService();