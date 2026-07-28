/**
 * Responsabilidade: handlers HTTP de publicacao sandbox, opcoes de roster e PDF de ciclo avancado.
 * Camada: controller.
 * Entradas/Saidas: req/res de publicacao/geracao; delega a service e servicos externos e traduz status.
 * Dependencias criticas: PublicProfilesService, GitHubPublishService, AdvancedPdfService, erros de ProfileTransformer e logger.
 */

const publicProfilesService = require('../../../../services/academic/PublicProfilesService');
const GitHubPublishService = require('../../../../services/academic/GitHubPublishService');
const AdvancedPdfService = require('../../../../services/academic/AdvancedPdfService');
const {
    MissingRequiredFieldError,
    MissingRosterSelectionError,
    MissingRosterValidationError
} = require('../../../../services/academic/ProfileTransformer');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: publica perfil no repositorio sandbox e abre PR.
     * Onde e usada: POST /:userId/publish-sandbox.
     * Dependencias chamadas: publicProfilesService.prepareSandboxPublishPayload, GitHubPublishService.publishProfile.
     * Efeitos colaterais: cria branch/commit/PR no repo sandbox.
     */
    async publishSandbox(req, res) {
        try {
            const { userId } = req.params;
            const { selectedRosterName, includePhoto, advancedPdfIds } = req.body || {};
            log.start('Iniciando publicacao sandbox', { userId });

            const { cmPayload, advancedPdfEntries } = await publicProfilesService.prepareSandboxPublishPayload(userId, {
                selectedRosterName,
                includePhoto,
                advancedPdfIds
            });

            const publisher = new GitHubPublishService();
            const publishResult = await publisher.publishProfile(cmPayload, userId, { advancedPdfEntries });

            if (!publishResult.success) {
                log.error('Falha na publicacao', { success: publishResult.success, error: publishResult.error });
                return res.status(500).json(publishResult);
            }

            log.success('Publicacao concluida', {
                branchName: publishResult.branchName,
                prUrl: publishResult.prUrl,
                noChanges: publishResult.noChanges
            });

            return res.status(200).json(publishResult);
        } catch (error) {
            if (
                error instanceof MissingRequiredFieldError ||
                error instanceof MissingRosterSelectionError ||
                error instanceof MissingRosterValidationError
            ) {
                log.warn('Perfil incompleto para publicacao', { err: error.message });
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            log.error('Erro na publicacao sandbox', { err: error.message });
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    /**
     * O que faz: lista nomes oficiais da turma para selecao de publicacao.
     * Onde e usada: GET /:userId/publish-sandbox/roster-options.
     * Dependencias chamadas: publicProfilesService.getSandboxRosterOptions.
     * Efeitos colaterais: nenhum.
     */
    async getSandboxRosterOptions(req, res) {
        try {
            const { userId } = req.params;
            const options = await publicProfilesService.getSandboxRosterOptions(userId);
            return res.status(200).json({ success: true, ...options });
        } catch (error) {
            if (error instanceof MissingRosterValidationError || error instanceof MissingRequiredFieldError) {
                return res.status(400).json({ success: false, error: error.message });
            }

            log.error('Erro ao buscar opcoes de roster', { err: error.message });
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * O que faz: gera PDF do ciclo avancado e retorna para download.
     * Onde e usada: POST /:userId/advanced-cycles/:cycleId/pdf.
     * Dependencias chamadas: publicProfilesService.prepareAdvancedPdfPayload, AdvancedPdfService.generateAdvancedPdf.
     * Efeitos colaterais: nenhum.
     */
    async getAdvancedCyclePDF(req, res) {
        try {
            const { userId, cycleId } = req.params;
            const { selectedRosterName } = req.body || {};

            log.start('Gerando PDF do ciclo', { cycleId });

            if (!selectedRosterName) {
                return res.status(400).json({ error: 'selectedRosterName e obrigatorio para gerar PDF.' });
            }

            const { cmPayload, entry } = await publicProfilesService.prepareAdvancedPdfPayload(
                userId,
                cycleId,
                selectedRosterName
            );

            const pdfBuffer = await AdvancedPdfService.generateAdvancedPdf({
                studentName: cmPayload.nome,
                turma: cmPayload.turma,
                cycle: entry.cycle,
                disciplines: entry.disciplines,
                experiences: entry.experiences
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${entry.fileName}`);
            return res.status(200).send(pdfBuffer);
        } catch (error) {
            log.error('Erro ao gerar PDF do ciclo', { err: error.message });
            return res.status(500).json({ error: error.message });
        }
    }
};
