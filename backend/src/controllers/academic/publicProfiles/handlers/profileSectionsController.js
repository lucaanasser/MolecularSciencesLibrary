/**
 * Responsabilidade: handlers HTTP das secoes de disciplinas e experiencias internacionais do perfil.
 * Camada: controller.
 * Entradas/Saidas: req/res de CRUD de disciplinas/internacional; delega aos models e traduz status.
 * Dependencias criticas: ProfileDisciplinesModel, InternationalExperiencesModel e logger padronizado.
 */

const profileDisciplinesModel = require('../../../../models/academic/publicProfiles/ProfileDisciplinesModel');
const internationalExperiencesModel = require('../../../../models/academic/publicProfiles/InternationalExperiencesModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria uma disciplina do perfil.
     * Onde e usada: POST /:userId/disciplines.
     * Dependencias chamadas: profileDisciplinesModel.create.
     * Efeitos colaterais: persiste disciplina em DB.
     */
    async createDiscipline(req, res) {
        try {
            const { userId } = req.params;
            log.start('Criando disciplina', { userId });

            const discipline = await profileDisciplinesModel.create(userId, req.body);

            log.success('Disciplina criada', { userId });
            res.status(201).json(discipline);
        } catch (error) {
            log.error('Erro ao criar disciplina', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: atualiza uma disciplina do perfil.
     * Onde e usada: PUT /:userId/disciplines/:discId.
     * Dependencias chamadas: profileDisciplinesModel.update.
     * Efeitos colaterais: persiste alteracoes da disciplina em DB.
     */
    async updateDiscipline(req, res) {
        try {
            const { discId } = req.params;
            log.start('Atualizando disciplina', { discId });

            const discipline = await profileDisciplinesModel.update(discId, req.body);

            log.success('Disciplina atualizada', { discId });
            res.status(200).json(discipline);
        } catch (error) {
            log.error('Erro ao atualizar disciplina', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove uma disciplina do perfil.
     * Onde e usada: DELETE /:userId/disciplines/:discId.
     * Dependencias chamadas: profileDisciplinesModel.delete.
     * Efeitos colaterais: remove disciplina do DB.
     */
    async deleteDiscipline(req, res) {
        try {
            const { discId } = req.params;
            log.start('Deletando disciplina', { discId });

            await profileDisciplinesModel.delete(discId);

            log.success('Disciplina deletada', { discId });
            res.status(200).json({ message: 'Disciplina deletada com sucesso' });
        } catch (error) {
            log.error('Erro ao deletar disciplina', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: cria uma experiencia internacional do perfil.
     * Onde e usada: POST /:userId/international.
     * Dependencias chamadas: internationalExperiencesModel.create.
     * Efeitos colaterais: persiste experiencia em DB.
     */
    async createInternational(req, res) {
        try {
            const { userId } = req.params;
            log.start('Criando experiencia internacional', { userId });

            const experience = await internationalExperiencesModel.create(userId, req.body);

            log.success('Experiencia criada', { userId });
            res.status(201).json(experience);
        } catch (error) {
            log.error('Erro ao criar experiencia internacional', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: atualiza uma experiencia internacional do perfil.
     * Onde e usada: PUT /:userId/international/:expId.
     * Dependencias chamadas: internationalExperiencesModel.update.
     * Efeitos colaterais: persiste alteracoes da experiencia em DB.
     */
    async updateInternational(req, res) {
        try {
            const { expId } = req.params;
            log.start('Atualizando experiencia internacional', { expId });

            const experience = await internationalExperiencesModel.update(expId, req.body);

            log.success('Experiencia atualizada', { expId });
            res.status(200).json(experience);
        } catch (error) {
            log.error('Erro ao atualizar experiencia internacional', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove uma experiencia internacional do perfil.
     * Onde e usada: DELETE /:userId/international/:expId.
     * Dependencias chamadas: internationalExperiencesModel.delete.
     * Efeitos colaterais: remove experiencia do DB.
     */
    async deleteInternational(req, res) {
        try {
            const { expId } = req.params;
            log.start('Deletando experiencia internacional', { expId });

            await internationalExperiencesModel.delete(expId);

            log.success('Experiencia deletada', { expId });
            res.status(200).json({ message: 'Experiência deletada com sucesso' });
        } catch (error) {
            log.error('Erro ao deletar experiencia internacional', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    }
};
