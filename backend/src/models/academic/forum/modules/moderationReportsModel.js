/**
 * Responsabilidade: denuncias (reports) de conteudo do forum - criar, listar e atualizar status.
 * Camada: model.
 * Entradas/Saidas: dados/ids de denuncia e status; retorna ids, listas e flags de sucesso.
 * Dependencias criticas: db (executeQuery/allQuery) e logger padronizado.
 */

const { executeQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria uma denuncia (pendente) de uma pergunta ou resposta.
     * Onde e usada: ForumService ao denunciar conteudo.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere linha em forum_reports.
     */
    async createReport({ reporter_id, target_type, target_id, motivo }) {
        log.start('Criando denuncia', { reporter_id, target_type, target_id });

        try {
            const { lastID: reportId } = await executeQuery(
                `INSERT INTO forum_reports (reporter_id, target_type, target_id, motivo, status, created_at)
                 VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
                [reporter_id, target_type, target_id, motivo]
            );

            log.success('Denuncia criada', { reportId });
            return reportId;
        } catch (error) {
            log.error('Erro ao criar denuncia', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: lista denuncias (opcionalmente por status) com nome do denunciante e um preview do conteudo.
     * Onde e usada: painel de moderacao do forum.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getReports({ status = null } = {}) {
        log.start('Buscando denuncias', { status });

        try {
            let query = `
                SELECT
                    r.*,
                    u.name as reporter_nome,
                    CASE r.target_type
                        WHEN 'question' THEN (SELECT titulo FROM forum_questions WHERE id = r.target_id)
                        ELSE (SELECT conteudo FROM forum_answers WHERE id = r.target_id)
                    END as target_preview,
                    CASE r.target_type
                        WHEN 'question' THEN r.target_id
                        ELSE (SELECT question_id FROM forum_answers WHERE id = r.target_id)
                    END as question_id
                FROM forum_reports r
                JOIN users u ON r.reporter_id = u.id
            `;
            const params = [];

            if (status) {
                query += ' WHERE r.status = ?';
                params.push(status);
            }

            query += ' ORDER BY r.created_at DESC';

            const reports = await allQuery(query, params);
            log.success('Denuncias encontradas', { count: reports.length });
            return reports;
        } catch (error) {
            log.error('Erro ao buscar denuncias', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza o status de uma denuncia ('resolved' ou 'dismissed') e registra a data de resolucao.
     * Onde e usada: painel de moderacao ao tratar denuncias.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza forum_reports.
     */
    async updateReportStatus(id, status) {
        log.start('Atualizando status da denuncia', { id, status });

        try {
            await executeQuery(
                `UPDATE forum_reports SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [status, id]
            );
            log.success('Status da denuncia atualizado', { id });
            return true;
        } catch (error) {
            log.error('Erro ao atualizar denuncia', { err: error.message });
            throw error;
        }
    }
};
