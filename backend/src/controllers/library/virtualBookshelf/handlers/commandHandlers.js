/**
 * Responsabilidade: concentrar handlers de escrita da estante virtual.
 * Camada: controller.
 * Entradas/Saidas: valida payloads de comando e responde status HTTP de alteracao.
 * Dependencias criticas: VirtualBookshelfService e logger compartilhado.
 */

const VirtualBookshelfService = require('../../../../services/library/virtualBookshelf/VirtualBookshelfService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: atualiza configuracao completa das prateleiras.
     * Onde e usada: rotas PUT / e PUT /shelves/config.
     * Dependencias chamadas: VirtualBookshelfService.updateShelvesConfig.
     * Efeitos colaterais: persiste alteracoes em DB.
     */
    async updateShelvesConfig(req, res) {
        const { shelvesConfig } = req.body;

        log.start('Iniciando atualizacao completa da configuracao de prateleiras', {
            route: req.route?.path,
            method: req.method,
            total_shelves: Array.isArray(shelvesConfig) ? shelvesConfig.length : undefined
        });

        if (!Array.isArray(shelvesConfig)) {
            log.warn('Payload invalido para atualizacao de configuracao', { expected_type: 'array' });
            return res.status(400).json({ error: 'shelvesConfig deve ser um array' });
        }

        try {
            const result = await VirtualBookshelfService.updateShelvesConfig(shelvesConfig);
            log.success('Configuracao de prateleiras atualizada com sucesso', {
                total_shelves: shelvesConfig.length
            });
            return res.json(result);
        } catch (error) {
            log.error('Falha ao atualizar configuracao de prateleiras', { err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: atualiza codigo inicial de uma prateleira.
     * Onde e usada: rotas PUT /shelf-start e PUT /shelves/:shelfNumber/:shelfRow/start-code.
     * Dependencias chamadas: VirtualBookshelfService.updateShelfStartCode.
     * Efeitos colaterais: persiste alteracao em DB.
     */
    async updateShelfStartCode(req, res) {
        const shelfNumber = req.body.shelf_number || req.params.shelfNumber;
        const shelfRow = req.body.shelf_row || req.params.shelfRow;
        const bookCodeStart = req.body.book_code_start;

        log.start('Iniciando atualizacao de codigo inicial de prateleira', {
            route: req.route?.path,
            method: req.method,
            shelf_number: shelfNumber,
            shelf_row: shelfRow
        });

        if (!shelfNumber || !shelfRow) {
            log.warn('Atualizacao de codigo inicial sem parametros obrigatorios', {
                required: 'shelf_number,shelf_row'
            });
            return res.status(400).json({ error: 'shelf_number e shelf_row sao obrigatorios' });
        }

        try {
            const result = await VirtualBookshelfService.updateShelfStartCode(shelfNumber, shelfRow, bookCodeStart);
            log.success('Codigo inicial atualizado com sucesso', {
                shelf_number: shelfNumber,
                shelf_row: shelfRow
            });
            return res.json(result);
        } catch (error) {
            log.error('Falha ao atualizar codigo inicial da prateleira', {
                shelf_number: shelfNumber,
                shelf_row: shelfRow,
                err: error.message
            });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: atualiza codigo final manual de uma prateleira.
     * Onde e usada: rotas PUT /shelf-end e PUT /shelves/:shelfNumber/:shelfRow/end-code.
     * Dependencias chamadas: VirtualBookshelfService.updateShelfEndCode.
     * Efeitos colaterais: persiste alteracao em DB.
     */
    async updateShelfEndCode(req, res) {
        const shelfNumber = req.body.shelf_number || req.params.shelfNumber;
        const shelfRow = req.body.shelf_row || req.params.shelfRow;
        const bookCodeEnd = req.body.book_code_end;

        log.start('Iniciando atualizacao de codigo final de prateleira', {
            route: req.route?.path,
            method: req.method,
            shelf_number: shelfNumber,
            shelf_row: shelfRow
        });

        if (!shelfNumber || !shelfRow) {
            log.warn('Atualizacao de codigo final sem parametros obrigatorios', {
                required: 'shelf_number,shelf_row'
            });
            return res.status(400).json({ error: 'shelf_number e shelf_row sao obrigatorios' });
        }

        try {
            const result = await VirtualBookshelfService.updateShelfEndCode(shelfNumber, shelfRow, bookCodeEnd);
            log.success('Codigo final atualizado com sucesso', {
                shelf_number: shelfNumber,
                shelf_row: shelfRow
            });
            return res.json(result);
        } catch (error) {
            log.error('Falha ao atualizar codigo final da prateleira', {
                shelf_number: shelfNumber,
                shelf_row: shelfRow,
                err: error.message
            });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: adiciona nova prateleira na configuracao da estante virtual.
     * Onde e usada: rotas POST /shelf e POST /shelves.
     * Dependencias chamadas: VirtualBookshelfService.addShelf.
     * Efeitos colaterais: cria registro em DB.
     */
    async addShelf(req, res) {
        const { shelf_number, shelf_row, book_code_start, book_code_end } = req.body;

        log.start('Iniciando criacao de nova prateleira', {
            route: req.route?.path,
            method: req.method,
            shelf_number,
            shelf_row
        });

        if (!shelf_number || !shelf_row) {
            log.warn('Criacao de prateleira sem parametros obrigatorios', {
                required: 'shelf_number,shelf_row'
            });
            return res.status(400).json({ error: 'shelf_number e shelf_row sao obrigatorios' });
        }

        try {
            const result = await VirtualBookshelfService.addShelf({
                shelf_number,
                shelf_row,
                book_code_start,
                book_code_end
            });

            log.success('Prateleira criada com sucesso', { shelf_number, shelf_row });
            return res.json(result);
        } catch (error) {
            log.error('Falha ao criar nova prateleira', {
                shelf_number,
                shelf_row,
                err: error.message
            });
            return res.status(400).json({ error: error.message });
        }
    }
};
