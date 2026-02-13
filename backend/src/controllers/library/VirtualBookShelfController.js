// VirtualBookShelfController gerencia as operações de controle para a estante virtual
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const VirtualBookShelfService = require('../../services/library/VirtualBookShelfService');

class VirtualBookShelfController {

    /**
     * Obtém todas as configurações de prateleiras
     */
    async getShelvesConfig(req, res) {
        try {
            console.log("🔵 [VirtualBookShelfController] GET /api/virtual-bookshelf - Obtendo configurações");
            const shelves = await VirtualBookShelfService.getShelvesConfig();
            console.log("🟢 [VirtualBookShelfController] Configurações obtidas com sucesso");
            res.json(shelves);
        } catch (error) {
            console.error("🔴 [VirtualBookShelfController] Erro ao obter configurações:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Atualiza configurações das prateleiras
     */
    async updateShelvesConfig(req, res) {
        try {
            console.log("🔵 [VirtualBookShelfController] PUT /api/virtual-bookshelf - Atualizando configurações");
            const { shelvesConfig } = req.body;
            
            if (!Array.isArray(shelvesConfig)) {
                return res.status(400).json({ error: 'shelvesConfig deve ser um array' });
            }

            const result = await VirtualBookShelfService.updateShelvesConfig(shelvesConfig);
            console.log("🟢 [VirtualBookShelfController] Configurações atualizadas com sucesso");
            res.json(result);
        } catch (error) {
            console.error("🔴 [VirtualBookShelfController] Erro ao atualizar configurações:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtém todos os livros ordenados para a estante virtual
     */
    async getOrderedBooks(req, res) {
        try {
            console.log("🔵 [VirtualBookShelfController] GET /api/virtual-bookshelf/books - Obtendo livros ordenados");
            const books = await VirtualBookShelfService.getAllBooksOrdered();
            console.log("🟢 [VirtualBookShelfController] Livros ordenados obtidos com sucesso");
            res.json(books);
        } catch (error) {
            console.error("🔴 [VirtualBookShelfController] Erro ao obter livros ordenados:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Atualiza o código inicial de uma prateleira específica
     */
    async updateShelfStartCode(req, res) {
        try {
            console.log("🔵 [VirtualBookShelfController] PUT /api/virtual-bookshelf/shelf-start - Atualizando código inicial");
            const { shelf_number, shelf_row, book_code_start } = req.body;

            if (!shelf_number || !shelf_row) {
                return res.status(400).json({ error: 'shelf_number e shelf_row são obrigatórios' });
            }

            const result = await VirtualBookShelfService.updateShelfStartCode(shelf_number, shelf_row, book_code_start);
            console.log("🟢 [VirtualBookShelfController] Código inicial atualizado com sucesso");
            res.json(result);
        } catch (error) {
            console.error("🔴 [VirtualBookShelfController] Erro ao atualizar código inicial:", error.message);
            res.status(400).json({ error: error.message });
        }
    }

        /**
     * Atualiza o código final de uma prateleira específica (apenas para última prateleira)
     */
    async updateShelfEndCode(req, res) {
        try {
            console.log("🔵 [VirtualBookShelfController] PUT /api/virtual-bookshelf/shelf-end - Atualizando código final");
            const { shelf_number, shelf_row, book_code_end } = req.body;

            if (!shelf_number || !shelf_row) {
                return res.status(400).json({ error: 'shelf_number e shelf_row são obrigatórios' });
            }

            const result = await VirtualBookShelfService.updateShelfEndCode(shelf_number, shelf_row, book_code_end);
            console.log("🟢 [VirtualBookShelfController] Código final atualizado com sucesso");
            res.json(result);
        } catch (error) {
            console.error("🔴 [VirtualBookShelfController] Erro ao atualizar código final:", error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Valida um código de livro
     */
    async validateBookCode(req, res) {
        try {
            console.log("🔵 [VirtualBookShelfController] GET /api/virtual-bookshelf/validate - Validando código");
            const { bookCode } = req.query;

            if (!bookCode) {
                return res.status(400).json({ error: 'bookCode é obrigatório' });
            }

            const result = await VirtualBookShelfService.validateBookCode(bookCode);
            console.log("🟢 [VirtualBookShelfController] Validação realizada com sucesso");
            res.json(result);
        } catch (error) {
            console.error("🔴 [VirtualBookShelfController] Erro ao validar código:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtém livros para uma prateleira específica
     */
    async getBooksForShelf(req, res) {
        try {
            console.log("🔵 [VirtualBookShelfController] GET /api/virtual-bookshelf/shelf-books - Obtendo livros da prateleira");
            const { shelf_number, shelf_row } = req.query;

            if (!shelf_number || !shelf_row) {
                return res.status(400).json({ error: 'shelf_number e shelf_row são obrigatórios' });
            }

            // Busca a configuração da prateleira e todas as prateleiras
            const allShelves = await VirtualBookShelfService.getShelvesConfig();
            const shelf = allShelves.find(s => 
                s.shelf_number == shelf_number && s.shelf_row == shelf_row
            );

            if (!shelf) {
                return res.status(404).json({ error: 'Prateleira não encontrada' });
            }

            const books = await VirtualBookShelfService.getBooksForShelf(shelf, allShelves);
            console.log("🟢 [VirtualBookShelfController] Livros da prateleira obtidos com sucesso");
            res.json(books);
        } catch (error) {
            console.error("🔴 [VirtualBookShelfController] Erro ao obter livros da prateleira:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Adiciona uma nova prateleira a uma estante existente ou nova estante
     */
    async addShelf(req, res) {
        try {
            console.log("🔵 [VirtualBookShelfController] POST /api/virtual-bookshelf/shelf - Adicionando nova prateleira");
            const { shelf_number, shelf_row, book_code_start, book_code_end } = req.body;
            if (!shelf_number || !shelf_row) {
                return res.status(400).json({ error: 'shelf_number e shelf_row são obrigatórios' });
            }
            const result = await VirtualBookShelfService.addShelf({
                shelf_number,
                shelf_row,
                book_code_start,
                book_code_end,
            });
            console.log("🟢 [VirtualBookShelfController] Nova prateleira adicionada com sucesso");
            res.json(result);
        } catch (error) {
            console.error("🔴 [VirtualBookShelfController] Erro ao adicionar prateleira:", error.message);
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new VirtualBookShelfController();