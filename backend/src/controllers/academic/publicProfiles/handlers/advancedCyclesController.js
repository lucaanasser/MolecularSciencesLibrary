/**
 * Responsabilidade: handlers HTTP dos ciclos avancados do perfil (CRUD e tags).
 * Camada: controller.
 * Entradas/Saidas: req/res de ciclos avancados; delega ao AdvancedCyclesModel e traduz status.
 * Dependencias criticas: AdvancedCyclesModel e logger padronizado.
 */

const advancedCyclesModel = require('../../../../models/academic/publicProfiles/AdvancedCyclesModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria um ciclo avancado para o usuario.
     * Onde e usada: POST /:userId/advanced-cycles.
     * Dependencias chamadas: advancedCyclesModel.create.
     * Efeitos colaterais: persiste ciclo em DB.
     */
    async createAdvancedCycle(req, res) {
        try {
            const { userId } = req.params;
            log.start('Criando ciclo', { userId });

            const cycle = await advancedCyclesModel.create(userId, req.body);

            log.success('Ciclo criado', { userId });
            res.status(201).json(cycle);
        } catch (error) {
            log.error('Erro ao criar ciclo', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: atualiza um ciclo avancado existente.
     * Onde e usada: PUT /:userId/advanced-cycles/:cycleId.
     * Dependencias chamadas: advancedCyclesModel.update.
     * Efeitos colaterais: persiste alteracoes do ciclo em DB.
     */
    async updateAdvancedCycle(req, res) {
        try {
            const { cycleId } = req.params;
            log.start('Atualizando ciclo', { cycleId });

            const cycle = await advancedCyclesModel.update(cycleId, req.body);

            log.success('Ciclo atualizado', { cycleId });
            res.status(200).json(cycle);
        } catch (error) {
            log.error('Erro ao atualizar ciclo', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove um ciclo avancado.
     * Onde e usada: DELETE /:userId/advanced-cycles/:cycleId.
     * Dependencias chamadas: advancedCyclesModel.delete.
     * Efeitos colaterais: remove ciclo do DB.
     */
    async deleteAdvancedCycle(req, res) {
        try {
            const { cycleId } = req.params;
            log.start('Deletando ciclo', { cycleId });

            await advancedCyclesModel.delete(cycleId);

            log.success('Ciclo deletado', { cycleId });
            res.status(200).json({ message: 'Ciclo deletado com sucesso' });
        } catch (error) {
            log.error('Erro ao deletar ciclo', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: adiciona uma tag a um ciclo avancado.
     * Onde e usada: POST /:userId/advanced-cycles/:cycleId/tags.
     * Dependencias chamadas: advancedCyclesModel.addTag.
     * Efeitos colaterais: persiste tag do ciclo em DB.
     */
    async addCycleTag(req, res) {
        try {
            const { cycleId } = req.params;
            const { label, category } = req.body;
            log.start('Adicionando tag ao ciclo', { cycleId });

            const tag = await advancedCyclesModel.addTag(cycleId, label, category);

            log.success('Tag adicionada', { cycleId });
            res.status(201).json(tag);
        } catch (error) {
            log.error('Erro ao adicionar tag ao ciclo', { err: error.message });
            res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove uma tag de um ciclo avancado.
     * Onde e usada: DELETE /:userId/advanced-cycles/:cycleId/tags/:tagId.
     * Dependencias chamadas: advancedCyclesModel.removeTag.
     * Efeitos colaterais: remove tag do ciclo do DB.
     */
    async removeCycleTag(req, res) {
        try {
            const { tagId } = req.params;
            log.start('Removendo tag', { tagId });

            await advancedCyclesModel.removeTag(tagId);

            log.success('Tag removida', { tagId });
            res.status(200).json({ message: 'Tag removida com sucesso' });
        } catch (error) {
            log.error('Erro ao remover tag do ciclo', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    }
};
