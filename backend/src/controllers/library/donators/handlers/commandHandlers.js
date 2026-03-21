/**
 * Responsabilidade: handlers HTTP de comandos de doadores.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res e traduz chamadas de escrita para responses HTTP.
 * Dependencias criticas: DonatorsService e logger compartilhado.
 */

const DonatorsService = require('../../../../services/library/donators/DonatorsService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria doador e retorna id criado.
     * Onde e usada: rota POST /api/donators.
     * Dependencias chamadas: DonatorsService.addDonator.
     * Efeitos colaterais: persistencia de doador.
     */
    async addDonator(req, res) {
        try {
            log.start('Iniciando criacao de doador');
            const result = await DonatorsService.addDonator(req.body);
            const id = result?.lastID ?? result?.id ?? result;
            log.success('Doador criado com sucesso', { donator_id: id });
            return res.status(201).json({ id });
        } catch (error) {
            log.error('Falha ao criar doador', { err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove doador por id.
     * Onde e usada: rota DELETE /api/donators/:id.
     * Dependencias chamadas: DonatorsService.removeDonator.
     * Efeitos colaterais: remocao de registro.
     */
    async removeDonator(req, res) {
        try {
            log.start('Iniciando remocao de doador', { donator_id: req.params.id });
            await DonatorsService.removeDonator(req.params.id);
            log.success('Doador removido com sucesso', { donator_id: req.params.id });
            return res.status(204).end();
        } catch (error) {
            log.error('Falha ao remover doador', { donator_id: req.params.id, err: error.message });
            return res.status(400).json({ error: error.message });
        }
    }
};
