/**
 * Responsabilidade: escrita de disciplinas customizadas (user_custom_disciplines) e seus horarios.
 * Camada: model.
 * Entradas/Saidas: dados de disciplina e listas de horarios; grava e reflete na lista do plano.
 * Dependencias criticas: db (executeQuery) e logger padronizado.
 */

const { executeQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria uma disciplina customizada com multiplos horarios e a adiciona a lista do plano.
     * Onde e usada: UserSchedulesService ao adicionar disciplina manual.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere em user_custom_disciplines, user_custom_discipline_schedules,
     *   user_schedule_disciplines (id negativo) e toca updated_at do plano.
     * @param {number} scheduleId - ID do plano
     * @param {object} data - { nome, codigo, creditos_aula, creditos_trabalho, color, schedules: [{dia, horario_inicio, horario_fim}] }
     */
    async addCustomDiscipline(scheduleId, { nome, codigo, creditos_aula, creditos_trabalho, color = '#14b8a6', schedules = [] }) {
        log.start('Adicionando disciplina customizada', { nome });

        try {
            // 1. Criar entrada na tabela user_custom_disciplines
            const query = `
                INSERT INTO user_custom_disciplines
                (schedule_id, nome, codigo, creditos_aula, creditos_trabalho, color, created_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;
            const result = await executeQuery(query, [scheduleId, nome, codigo, creditos_aula, creditos_trabalho, color]);
            const customDisciplineId = result.lastID;
            log.success('Disciplina customizada criada', { customDisciplineId });

            // 2. Inserir horários na tabela separada
            if (schedules && schedules.length > 0) {
                const scheduleQuery = `
                    INSERT INTO user_custom_discipline_schedules
                    (custom_discipline_id, dia, horario_inicio, horario_fim, created_at)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                `;

                for (const schedule of schedules) {
                    await executeQuery(scheduleQuery, [
                        customDisciplineId,
                        schedule.dia,
                        schedule.horario_inicio,
                        schedule.horario_fim
                    ]);
                }
                log.success('Horarios adicionados', { count: schedules.length });
            }

            // 3. Adicionar à lista de disciplinas do plano (user_schedule_disciplines)
            // Usa ID negativo para diferenciar de disciplinas regulares
            const addToListQuery = `
                INSERT INTO user_schedule_disciplines
                (schedule_id, discipline_id, selected_class_id, is_visible, is_expanded, color, created_at)
                VALUES (?, ?, NULL, 1, 0, ?, CURRENT_TIMESTAMP)
            `;
            await executeQuery(addToListQuery, [scheduleId, -customDisciplineId, color]);
            log.success('Disciplina customizada adicionada a lista do plano', { customDisciplineId, scheduleId });

            // 4. Atualiza updated_at do plano
            await executeQuery(
                `UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );

            // Retornar disciplina com schedules
            return {
                id: customDisciplineId,
                schedule_id: scheduleId,
                nome,
                codigo,
                creditos_aula,
                creditos_trabalho,
                color,
                schedules
            };
        } catch (error) {
            log.error('Erro ao adicionar disciplina customizada', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza campos e/ou horarios de uma disciplina customizada.
     * Onde e usada: UserSchedulesService ao editar disciplina manual.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza user_custom_disciplines e recria user_custom_discipline_schedules.
     * @param {number} id - ID da disciplina customizada
     * @param {object} data - { nome, codigo, creditos_aula, creditos_trabalho, color, is_visible, schedules }
     */
    async updateCustomDiscipline(id, { nome, codigo, creditos_aula, creditos_trabalho, color, is_visible, schedules }) {
        log.start('Atualizando disciplina customizada', { id });
        const updates = [];
        const params = [];

        if (nome !== undefined) { updates.push('nome = ?'); params.push(nome); }
        if (codigo !== undefined) { updates.push('codigo = ?'); params.push(codigo); }
        if (creditos_aula !== undefined) { updates.push('creditos_aula = ?'); params.push(creditos_aula); }
        if (creditos_trabalho !== undefined) { updates.push('creditos_trabalho = ?'); params.push(creditos_trabalho); }
        if (color !== undefined) { updates.push('color = ?'); params.push(color); }
        if (is_visible !== undefined) { updates.push('is_visible = ?'); params.push(is_visible ? 1 : 0); }

        if (updates.length === 0 && !schedules) {
            return null;
        }

        try {
            // Atualizar campos básicos
            if (updates.length > 0) {
                params.push(id);
                const query = `UPDATE user_custom_disciplines SET ${updates.join(', ')} WHERE id = ?`;
                await executeQuery(query, params);
                log.success('Disciplina customizada atualizada', { id });
            }

            // Atualizar horários se fornecidos
            if (schedules !== undefined) {
                // Remover horários existentes
                await executeQuery(
                    `DELETE FROM user_custom_discipline_schedules WHERE custom_discipline_id = ?`,
                    [id]
                );

                // Inserir novos horários
                if (schedules.length > 0) {
                    const scheduleQuery = `
                        INSERT INTO user_custom_discipline_schedules
                        (custom_discipline_id, dia, horario_inicio, horario_fim, created_at)
                        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                    `;

                    for (const schedule of schedules) {
                        await executeQuery(scheduleQuery, [
                            id,
                            schedule.dia,
                            schedule.horario_inicio,
                            schedule.horario_fim
                        ]);
                    }
                    log.success('Horarios atualizados', { count: schedules.length });
                }
            }

            return true;
        } catch (error) {
            log.error('Erro ao atualizar disciplina customizada', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: exclui permanentemente uma disciplina customizada de todas as tabelas relacionadas.
     * Onde e usada: UserSchedulesService ao excluir disciplina manual definitivamente.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: hard delete em user_custom_discipline_schedules, user_schedule_disciplines (id negativo)
     *   e user_custom_disciplines.
     */
    async deleteCustomDiscipline(id) {
        log.start('Excluindo permanentemente disciplina customizada', { id });
        try {
            // Remove horários da customizada
            await executeQuery(
                `DELETE FROM user_custom_discipline_schedules WHERE custom_discipline_id = ?`,
                [id]
            );
            // Remove de TODOS os planos onde foi adicionada via search (discipline_id = -id)
            await executeQuery(
                `DELETE FROM user_schedule_disciplines WHERE discipline_id = ?`,
                [-id]
            );
            // Remove o registro principal
            await executeQuery(
                `DELETE FROM user_custom_disciplines WHERE id = ?`,
                [id]
            );

            log.success('Disciplina customizada excluida permanentemente', { id });
            return true;
        } catch (error) {
            log.error('Erro ao excluir disciplina customizada', { err: error.message });
            throw error;
        }
    }
};
