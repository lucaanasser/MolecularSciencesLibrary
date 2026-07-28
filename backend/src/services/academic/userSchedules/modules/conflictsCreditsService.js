/**
 * Responsabilidade: deteccao de conflitos de horario e calculo de creditos de um plano.
 * Camada: service.
 * Entradas/Saidas: recebe scheduleId/classId; retorna listas de conflitos e totais de creditos.
 * Dependencias criticas: UserSchedulesModel, this.getFullSchedule e logger padronizado.
 */

const userSchedulesModel = require('../../../../models/academic/userSchedules/UserSchedulesModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: detecta conflitos de horario entre turmas e customizadas visiveis do plano.
     * Onde/Deps: handler GET de conflitos; usa this.getFullSchedule e this.hasTimeOverlap.
     * Efeitos: leitura em DB (via getFullSchedule).
     */
    async detectConflicts(scheduleId, userId) {
        log.start('Detectando conflitos no plano', { scheduleId });
        try {
            const fullSchedule = await this.getFullSchedule(scheduleId, userId);
            if (!fullSchedule) {
                return [];
            }
            const conflicts = [];
            const allSlots = [];
            // Coleta todos os slots de horário das turmas
            for (const cls of fullSchedule.classes) {
                if (!cls.is_visible) continue;
                for (const schedule of cls.schedules || []) {
                    allSlots.push({
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
                allSlots.push({
                    type: 'custom',
                    id: custom.id,
                    discipline_codigo: custom.codigo || 'CUSTOM',
                    discipline_nome: custom.nome,
                    dia: custom.dia,
                    horario_inicio: custom.horario_inicio,
                    horario_fim: custom.horario_fim
                });
            }
            // Verifica conflitos
            for (let i = 0; i < allSlots.length; i++) {
                for (let j = i + 1; j < allSlots.length; j++) {
                    const a = allSlots[i];
                    const b = allSlots[j];
                    if (a.dia === b.dia) {
                        // Verifica sobreposição de horários
                        if (this.hasTimeOverlap(a.horario_inicio, a.horario_fim, b.horario_inicio, b.horario_fim)) {
                            conflicts.push({
                                slot1: a,
                                slot2: b
                            });
                        }
                    }
                }
            }
            log.success('Conflitos detectados', { count: conflicts.length });
            return conflicts;
        } catch (error) {
            log.error('Erro ao detectar conflitos', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: verifica se dois intervalos de tempo se sobrepoem (sincrono).
     * Onde/Deps: detectConflicts e checkConflictsForClass via this; sem dependencias.
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
     * O que faz: calcula total de creditos (turmas unicas visiveis + customizadas visiveis).
     * Onde/Deps: handler GET de creditos; usa this.getFullSchedule.
     * Efeitos: leitura em DB (via getFullSchedule).
     */
    async calculateCredits(scheduleId, userId) {
        log.start('Calculando créditos do plano', { scheduleId });
        try {
            const fullSchedule = await this.getFullSchedule(scheduleId, userId);
            if (!fullSchedule) {
                return { creditos_aula: 0, creditos_trabalho: 0 };
            }
            let creditos_aula = 0;
            let creditos_trabalho = 0;
            // Soma créditos das turmas (apenas disciplinas visíveis e únicas)
            const disciplineIds = new Set();
            for (const cls of fullSchedule.classes) {
                if (!cls.is_visible) continue;
                if (disciplineIds.has(cls.discipline_id)) continue; // Evita contar mesma disciplina duas vezes
                disciplineIds.add(cls.discipline_id);
                creditos_aula += cls.creditos_aula || 0;
                creditos_trabalho += cls.creditos_trabalho || 0;
            }
            // Soma créditos das disciplinas customizadas (apenas visíveis)
            for (const custom of fullSchedule.customDisciplines) {
                if (!custom.is_visible) continue;
                creditos_aula += custom.creditos_aula || 0;
                creditos_trabalho += custom.creditos_trabalho || 0;
            }
            log.success('Créditos calculados', { creditos_aula, creditos_trabalho });
            return { creditos_aula, creditos_trabalho };
        } catch (error) {
            log.error('Erro ao calcular créditos', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: verifica conflitos de uma turma candidata contra os slots ja no plano.
     * Onde/Deps: handler GET de checagem previa; usa this.getFullSchedule, this.hasTimeOverlap, model.getClassSchedules.
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
