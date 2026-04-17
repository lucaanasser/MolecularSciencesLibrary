/**
 * Responsabilidade: handlers HTTP de importacao/exportacao CSV de usuarios.
 * Camada: controller.
 * Entradas/Saidas: converte retorno do service para download/upload HTTP.
 * Dependencias criticas: UsersService e logger compartilhado.
 */

const UsersService = require('../../../../services/library/users/UsersService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: exporta usuarios para arquivo CSV.
     * Onde e usada: rota GET /api/users/export/csv.
     * Dependencias chamadas: UsersService.exportUsersToCSV.
     * Efeitos colaterais: nenhum.
     */
    async exportUsersToCSV(req, res) {
        try {
            const result = await UsersService.exportUsersToCSV();
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            return res.send(result.content);
        } catch (error) {
            log.error('Falha ao exportar usuarios para CSV', { err: error.message });
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * O que faz: importa usuarios via arquivo CSV.
     * Onde e usada: rota POST /api/users/import/csv.
     * Dependencias chamadas: UsersService.importUsersFromCSV.
     * Efeitos colaterais: cria usuarios em lote.
     */
    async importUsersFromCSV(req, res) {
        try {
            const results = await UsersService.importUsersFromCSV(req.file);
            return res.status(200).json(results);
        } catch (error) {
            const status = error.message === 'Nenhum arquivo CSV fornecido' ? 400 : 500;
            log.error('Falha ao importar usuarios via CSV', { err: error.message });
            return res.status(status).json({ success: false, message: error.message });
        }
    }
};
