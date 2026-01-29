// BooksController gerencia as operações de controle para livros, 
// conectando as rotas aos serviços.
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const booksService = require('../services/BooksService');
const BooksModel = require('../models/BooksModel');


const { escapeCSV, importFromCSV } = require('../utils/csvUtils');

class BooksController {
    constructor() {
        // Inicializações ou configurações do controller, se necessário
    }

    /**
     * Busca um livro pelo ID, delegando ao serviço
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Livro encontrado ou null
     */
    async getBookById(id) {
        try {
            console.log(`🔵 [BooksController] Buscando livro por id: ${id}`);
            const book = await booksService.getBookById(id);
            if (book) {
                console.log("🟢 [BooksController] Livro encontrado:", book);
            } else {
                console.warn("🟡 [BooksController] Livro não encontrado para id:", id);
            }
            return book;
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao buscar livro:", error.message);
            throw error;
        }
    }
    /**
     * Adiciona um novo livro ou exemplar, delegando ao serviço
     * @param {Object} bookData - Dados do livro a ser adicionado
     * @returns {Promise<Object>} Resultado da operação
     */
    async addBook(bookData) {
        try {
            return await booksService.addBook(bookData);
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao adicionar livro:", error.message);
            throw error;
        }
    }

    /**
     * Busca livros por filtros dinâmicos, incluindo status
     * @param {Object} filters - Filtros recebidos da query
     * @returns {Promise<Array>} Lista de livros encontrados
     */
    async getBooksByFilters(filters) {
        try {
            console.log(`[BooksController] Buscando livros por filtros:`, filters);
            const books = await booksService.getBooks(filters);
            console.log(`[BooksController] Livros encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error(`[BooksController] Erro ao buscar livros:`, error.message);
            throw error;
        }
    }

    /**
     * Busca livros por categoria e subcategoria, delegando ao serviço
     * @param {string} category - Nome da categoria
     * @param {string|number} subcategory - Código da subcategoria
     * @returns {Promise<Array>} Lista de livros encontrados
     */
    async getBooks(category, subcategory, searchTerm) {
        try {
            console.log(`🔵 [BooksController] Buscando livros: category=${category}, subcategory=${subcategory}, searchTerm=${searchTerm}`);
            const books = await booksService.getBooks(category, subcategory, searchTerm);
            console.log(`🟢 [BooksController] Livros encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao buscar livros:", error.message);
            throw error;
        }
    }

    /**
     * Retorna os mapeamentos de códigos de área e subárea
     * @returns {Object} Objeto com areaCodes e subareaCodes
     */
    getCategoryMappings() {
        console.log("🔵 [BooksController] Obtendo mapeamentos de categorias e subcategorias");
        const mappings = booksService.getCategoryMappings();
        console.log("🟢 [BooksController] Mapeamentos obtidos");
        return mappings;
    }

    /**
     * Remove um livro pelo ID, delegando ao serviço
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Resultado da operação
     */
    async deleteBook(id) {
        try {
            console.log(`🔵 [BooksController] Removendo livro id=${id}`);
            await booksService.removeBookById(id);
            console.log(`🟢 [BooksController] Livro removido com sucesso: id=${id}`);
            return { success: true, message: 'Livro removido com sucesso' };
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao remover livro: ${error.message}`);
            throw error;
        }
    }

    /**
     * Empresta um livro a um estudante, delegando ao serviço
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async borrowBook(req, res) {
        const { bookId, studentId } = req.body;
        const sid = studentId || Math.floor(Math.random() * 10000);
        console.log(`🔵 [BooksController] Emprestando livro bookId=${bookId} para studentId=${sid}`);
        try {
            await booksService.borrowBook(bookId, sid);
            console.log(`🟢 [BooksController] Livro emprestado com sucesso: bookId=${bookId}, studentId=${sid}`);
            res.status(200).json({ success: true, message: 'Livro emprestado com sucesso' });
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao emprestar livro: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Devolve um livro emprestado, delegando ao serviço
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async returnBook(req, res) {
        const { bookId } = req.body;
        console.log(`🔵 [BooksController] Devolvendo livro bookId=${bookId}`);
        try {
            await booksService.returnBook(bookId);
            console.log(`🟢 [BooksController] Livro devolvido com sucesso: bookId=${bookId}`);
            res.status(200).json({ success: true, message: 'Livro devolvido com sucesso' });
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao devolver livro: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Lista todos os livros ordenados, delegando ao modelo e à função de ordenação
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async listOrdered(req, res) {
        try {
            const books = await BooksModel.getAll();
            // Apenas retorna os livros sem ordenar aqui, pois a ordenação é feita na VirtualBookShelfService
            res.json(books);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * Lista todos os livros ordenados conforme a estante virtual
     */
    async listVirtualOrdered(req, res) {
        try {
            const books = await require('../services/VirtualBookShelfService').getAllBooksOrdered();
            res.json(books);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * Define o status de reserva didática de um livro
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async setReservedStatus(req, res) {
        const { bookId, isReserved } = req.body;
        try {
            const result = await booksService.setReservedStatus(bookId, isReserved);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Lista todos os livros reservados
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async getReservedBooks(req, res) {
        try {
            const books = await booksService.getReservedBooks();
            res.status(200).json(books);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Remove todos os livros da reserva didática
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async clearAllReservedBooks(req, res) {
        try {
            console.log('🔵 [BooksController] Removendo todos os livros da reserva didática');
            const result = await booksService.clearAllReservedBooks();
            res.status(200).json(result);
        } catch (error) {
            console.error('🔴 [BooksController] Erro ao limpar reserva didática:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Exporta todos os livros em formato CSV
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async exportBooksToCSV(req, res) {
        try {
            console.log('🔵 [BooksController] Exportando catálogo de livros em CSV');
            const books = await BooksModel.getAll();
            
            // Cabeçalhos do CSV
            const headers = [
                'ID',
                'Código',
                'Título',
                'Autores',
                'Editora',
                'Edição',
                'ISBN',
                'Ano',
                'Código de Barras',
                'Área',
                'Subárea',
                'Disponível',
                'Reserva Didática',
                'Observações'
            ];
            
            // Converter livros para linhas CSV
            const csvRows = [headers.join(',')];
            
            for (const book of books) {
                const row = [
                    book.id || '',
                    escapeCSV(book.code || ''),
                    escapeCSV(book.title || ''),
                    escapeCSV(book.authors || ''),
                    escapeCSV(book.publisher || ''),
                    escapeCSV(book.edition || ''),
                    escapeCSV(book.isbn || ''),
                    book.year || '',
                    escapeCSV(book.barcode || ''),
                    escapeCSV(book.area || ''),
                    escapeCSV(book.sub_area || ''),
                    book.available ? 'Sim' : 'Não',
                    book.is_reserved === 1 ? 'Sim' : 'Não',
                    escapeCSV(book.observations || '')
                ];
                csvRows.push(row.join(','));
            }
            
            const csvContent = csvRows.join('\n');
            
            // Configurar headers da resposta
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="catalogo_livros_${new Date().toISOString().split('T')[0]}.csv"`);
            
            console.log(`🟢 [BooksController] CSV exportado com sucesso: ${books.length} livros`);
            res.send('\ufeff' + csvContent);
        } catch (error) {
            console.error('🔴 [BooksController] Erro ao exportar CSV:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

   
    /**
     * Importa livros a partir de um arquivo CSV
     */
    async importBooksFromCSV(req, res) {
        try {
            console.log('🔵 [BooksController] Iniciando importação de livros via CSV');
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Nenhum arquivo CSV fornecido' });
            }
            const requiredFields = ['code', 'title', 'authors', 'area', 'subarea', 'edition', 'language', 'volume'];
            const logger = {
                success: (entity, row) => console.log(`🟢 [BooksController] Livro importado: ${entity.title} (linha ${row})`),
                error: (error, row, line) => console.error(`🔴 [BooksController] Erro na linha ${row}:`, error.message),
                finish: (results) => console.log(`🟢 [BooksController] Importação concluída: ${results.success} sucesso, ${results.failed} falhas`)
            };
            const results = await importFromCSV({
                fileBuffer: req.file.buffer,
                requiredFields,
                mapRow: (bookData) => ({
                    code: bookData.code.trim(),
                    title: bookData.title.trim(),
                    subtitle: bookData.subtitle?.trim() || '',
                    authors: bookData.authors.trim(),
                    area: bookData.area.trim(),
                    subarea: bookData.subarea.trim(),
                    edition: bookData.edition.trim(),
                    language: parseInt(bookData.language),
                    volume: bookData.volume.trim(),
                    isbn: bookData.isbn?.trim() || '',
                    year: bookData.year?.trim() || '',
                    publisher: bookData.publisher?.trim() || '',
                    observations: bookData.observations?.trim() || '',
                    barcode: bookData.barcode?.trim() || '',
                    addType: 'csv_import'
                }),
                addFn: booksService.addBook,
                logger
            });
            res.status(200).json(results);
        } catch (error) {
            console.error('🔴 [BooksController] Erro ao importar CSV:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

// Exporta uma instância única do controlador
module.exports = new BooksController();