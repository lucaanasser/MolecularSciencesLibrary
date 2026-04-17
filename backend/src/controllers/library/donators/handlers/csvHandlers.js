/**
 * Responsabilidade: handlers HTTP de importacao/exportacao CSV de doadores.
 * Camada: controller.
 * Entradas/Saidas: converte resposta de service para download/upload HTTP.
 * Dependencias criticas: DonatorsService e logger compartilhado.
 */

const DonatorsService = require('../../../../services/library/donators/DonatorsService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: gera e devolve arquivo CSV de doadores.
     * Onde e usada: rota GET /api/donators/export/csv.
     * Dependencias chamadas: DonatorsService.exportDonatorsToCSV.
     * Efeitos colaterais: nenhum.
     */
    async exportDonatorsToCSV(req, res) {
        try {
            log.start('Iniciando exportacao CSV de doadores');
            const result = await DonatorsService.exportDonatorsToCSV();
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            log.success('Exportacao CSV concluida', { total: result.count });
            return res.send(result.content);
        } catch (error) {
            log.error('Falha ao exportar CSV de doadores', { err: error.message });
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * O que faz: importa doadores a partir de arquivo CSV.
     * Onde e usada: rota POST /api/donators/import/csv.
     * Dependencias chamadas: DonatorsService.importDonatorsFromCSV.
     * Efeitos colaterais: cria multiplos registros de doadores.
     */
    async importDonatorsFromCSV(req, res) {
        try {
            log.start('Iniciando importacao CSV de doadores');
            const results = await DonatorsService.importDonatorsFromCSV(req.file);
            log.success('Importacao CSV de doadores concluida', {
                success: results.success,
                failed: results.failed
            });
            return res.status(200).json(results);
        } catch (error) {
            const status = error.message === 'Nenhum arquivo CSV fornecido' ? 400 : 500;
            log.error('Falha ao importar CSV de doadores', { err: error.message });
            return res.status(status).json({ success: false, message: error.message });
        }
    }
};
