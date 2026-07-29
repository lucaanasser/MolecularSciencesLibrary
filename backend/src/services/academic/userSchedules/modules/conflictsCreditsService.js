/**
 * Responsabilidade: verificacao previa de conflitos de horario de uma turma candidata.
 * Camada: service.
 * Entradas/Saidas: recebe scheduleId/classId; retorna lista de conflitos.
 * Dependencias criticas: UserSchedulesModel, this.getFullSchedule e logger padronizado.
 */

const userSchedulesModel = require('../../../../models/academic/userSchedules/UserSchedulesModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: verifica se dois intervalos de tempo se sobrepoem (sincrono).
     * Onde/Deps: checkConflictsForClass via this; sem dependencias.
     * Efeitos: nenhum.
     */
    hasTimeOverlap(start1, end1, start2, end2) {
        const toMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const s1 = toMinutes(start1);
        const e1 = toMinutes(end1);
        const s2 = toMinutes(start2);
        const e2 = toMinutes(end2);
        // Conflito se um começa antes do outro terminar
        return s1 < e2 && s2 < e1;
    },

    /**
     * O que faz: verifica conflitos de uma turma candidata contra os slots ja no plano.
     * Onde/Deps: handler POST de checagem previa; usa this.getFullSchedule, this.hasTimeOverlap, model.getClassSchedules.
     * Efeitos: leitura em DB.
     */
    async checkConflictsForClass(scheduleId, userId, classId) {
        log.start('Verificando conflitos para turma no plano', { classId, scheduleId });
        try {
            const fullSchedule = await this.getFullSchedule(scheduleId, userId);
            if (!fullSchedule) {
                return [];
            }
            // Busca os horários da turma que queremos adicionar
            const newClassSchedules = await userSchedulesModel.getClassSchedules(classId);
            if (!newClassSchedules || newClassSchedules.length === 0) {
                log.warn('Turma não possui horários cadastrados', { classId });
                return [];
            }
            const conflicts = [];
            const existingSlots = [];
            // Coleta todos os slots de horário das turmas existentes
            for (const cls of fullSchedule.classes) {
                if (!cls.is_visible) continue;
                for (const schedule of cls.schedules || []) {
                    existingSlots.push({
                        type: 'class',
                        id: cls.id,
                        discipline_codigo: cls.discipline_codigo,
                        discipline_nome: cls.discipline_nome,
                        dia: schedule.dia,
                        horario_inicio: schedule.horario_inicio,
                        horario_fim: schedule.horario_fim
                    });
                }
            }
            // Coleta slots das disciplinas customizadas
            for (const custom of fullSchedule.customDisciplines) {
                if (!custom.is_visible) continue;
                // Agora custom.schedules é um array de horários
                for (const schedule of custom.schedules || []) {
                    existingSlots.push({
                        type: 'custom',
                        id: custom.id,
                        discipline_codigo: custom.codigo || 'CUSTOM',
                        discipline_nome: custom.nome,
                        dia: schedule.dia,
                        horario_inicio: schedule.horario_inicio,
                        horario_fim: schedule.horario_fim
                    });
                }
            }
            // Verifica conflitos da nova turma com as existentes
            for (const newSlot of newClassSchedules) {
                for (const existingSlot of existingSlots) {
                    if (newSlot.dia === existingSlot.dia) {
                        if (this.hasTimeOverlap(
                            newSlot.horario_inicio, newSlot.horario_fim,
                            existingSlot.horario_inicio, existingSlot.horario_fim
                        )) {
                            conflicts.push({
                                newClass: {
                                    dia: newSlot.dia,
                                    horario_inicio: newSlot.horario_inicio,
                                    horario_fim: newSlot.horario_fim
                                },
                                existingSlot
                            });
                        }
                    }
                }
            }
            log.success('Conflitos encontrados', { count: conflicts.length });
            return conflicts;
        } catch (error) {
            log.error('Erro ao verificar conflitos', { err: error.message });
            throw error;
        }
    }
};
