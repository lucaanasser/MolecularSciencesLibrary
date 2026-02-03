// UserSchedulesService contém toda a lógica de negócio relacionada às grades/planos dos usuários
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const userSchedulesModel = require('../../models/academic/UserSchedulesModel');

/**
 * Paleta de cores padrão para disciplinas
 */
const DEFAULT_COLORS = [
    '#14b8a6', // teal-500
    '#f97316', // orange-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#22c55e', // green-500
    '#3b82f6', // blue-500
    '#eab308', // yellow-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#a855f7', // purple-500
];

class UserSchedulesService {
    /**
     * Retorna a próxima cor da paleta baseado no número de disciplinas
     */
    getNextColor(currentCount) {
        return DEFAULT_COLORS[currentCount % DEFAULT_COLORS.length];
    }

    /**
     * Lista todos os planos de um usuário
     */
    async getUserSchedules(userId) {
        console.log(`🔵 [UserSchedulesService] Listando planos do usuário ${userId}`);
        try {
            const schedules = await userSchedulesModel.getSchedulesByUserId(userId);
            console.log(`🟢 [UserSchedulesService] ${schedules.length} planos encontrados`);
            return schedules;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao listar planos:", error.message);
            throw error;
        }
    }

    /**
     * Obtém um plano por ID com validação de propriedade
     */
    async getScheduleById(scheduleId, userId) {
        console.log(`🔵 [UserSchedulesService] Buscando plano ${scheduleId}`);
        try {
            const schedule = await userSchedulesModel.getScheduleById(scheduleId);
            if (!schedule) {
                console.log(`🟡 [UserSchedulesService] Plano não encontrado`);
                return null;
            }
            if (schedule.user_id !== userId) {
                console.log(`🟡 [UserSchedulesService] Usuário não é dono do plano`);
                return null;
            }
            console.log(`🟢 [UserSchedulesService] Plano encontrado`);
            return schedule;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao buscar plano:", error.message);
            throw error;
        }
    }

    /**
     * Obtém plano completo com todas as turmas e disciplinas customizadas
     */
    async getFullSchedule(scheduleId, userId) {
        console.log(`🔵 [UserSchedulesService] Buscando plano completo ${scheduleId}`);
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return null;
            }

            const fullSchedule = await userSchedulesModel.getFullSchedule(scheduleId);
            console.log(`🟢 [UserSchedulesService] Plano completo carregado`);
            return fullSchedule;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao buscar plano completo:", error.message);
            throw error;
        }
    }

    /**
     * Cria um novo plano para o usuário
     */
    async createSchedule(userId, name) {
        console.log(`🔵 [UserSchedulesService] Criando plano para usuário ${userId}`);
        try {
            // Conta planos existentes para sugerir nome
            const existingSchedules = await userSchedulesModel.getSchedulesByUserId(userId);
            const scheduleName = name || `Plano ${existingSchedules.length + 1}`;
            
            const schedule = await userSchedulesModel.createSchedule(userId, scheduleName);
            console.log(`🟢 [UserSchedulesService] Plano criado: ${schedule.id}`);
            return schedule;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao criar plano:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza um plano (nome)
     */
    async updateSchedule(scheduleId, userId, updates) {
        console.log(`🔵 [UserSchedulesService] Atualizando plano ${scheduleId}`);
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return null;
            }

            const updated = await userSchedulesModel.updateSchedule(scheduleId, updates);
            console.log(`🟢 [UserSchedulesService] Plano atualizado`);
            return updated;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao atualizar plano:", error.message);
            throw error;
        }
    }

    /**
     * Soft delete de um plano
     */
    async deleteSchedule(scheduleId, userId) {
        console.log(`🔵 [UserSchedulesService] Deletando plano ${scheduleId}`);
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return false;
            }

            await userSchedulesModel.deleteSchedule(scheduleId);
            console.log(`🟢 [UserSchedulesService] Plano deletado (soft delete)`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao deletar plano:", error.message);
            throw error;
        }
    }

    /**
     * Adiciona uma turma ao plano
     */
    async addClassToSchedule(scheduleId, userId, classId) {
        console.log(`🔵 [UserSchedulesService] Adicionando turma ${classId} ao plano ${scheduleId}`);
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return null;
            }

            // Conta disciplinas para determinar cor
            const existingClasses = await userSchedulesModel.getScheduleClasses(scheduleId);
            const customDisciplines = await userSchedulesModel.getCustomDisciplines(scheduleId);
            const totalCount = existingClasses.length + customDisciplines.length;
            const color = this.getNextColor(totalCount);

            const result = await userSchedulesModel.addClassToSchedule(scheduleId, classId, color);
            console.log(`🟢 [UserSchedulesService] Turma adicionada`);
            return result;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao adicionar turma:", error.message);
            throw error;
        }
    }

    /**
     * Remove uma turma do plano
     */
    async removeClassFromSchedule(scheduleId, userId, classId) {
        console.log(`🔵 [UserSchedulesService] Removendo turma ${classId} do plano ${scheduleId}`);
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return false;
            }

            await userSchedulesModel.removeClassFromSchedule(scheduleId, classId);
            console.log(`🟢 [UserSchedulesService] Turma removida`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao remover turma:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma turma no plano (cor, visibilidade)
     */
    async updateScheduleClass(scheduleClassId, userId, updates) {
        console.log(`🔵 [UserSchedulesService] Atualizando turma ${scheduleClassId}`);
        try {
            // TODO: Validar propriedade através do schedule_id
            await userSchedulesModel.updateScheduleClass(scheduleClassId, updates);
            console.log(`🟢 [UserSchedulesService] Turma atualizada`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao atualizar turma:", error.message);
            throw error;
        }
    }

    /**
     * Adiciona uma disciplina customizada
     */
    async addCustomDiscipline(scheduleId, userId, disciplineData) {
        console.log(`🔵 [UserSchedulesService] Adicionando disciplina customizada ao plano ${scheduleId}`);
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return null;
            }

            // Conta disciplinas para determinar cor
            const existingClasses = await userSchedulesModel.getScheduleClasses(scheduleId);
            const customDisciplines = await userSchedulesModel.getCustomDisciplines(scheduleId);
            const totalCount = existingClasses.length + customDisciplines.length;
            
            const color = disciplineData.color || this.getNextColor(totalCount);

            const result = await userSchedulesModel.addCustomDiscipline(scheduleId, {
                ...disciplineData,
                color
            });
            console.log(`🟢 [UserSchedulesService] Disciplina customizada adicionada`);
            return result;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao adicionar disciplina customizada:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma disciplina customizada
     */
    async updateCustomDiscipline(customId, userId, updates) {
        console.log(`🔵 [UserSchedulesService] Atualizando disciplina customizada ${customId}`);
        try {
            // TODO: Validar propriedade
            await userSchedulesModel.updateCustomDiscipline(customId, updates);
            console.log(`🟢 [UserSchedulesService] Disciplina customizada atualizada`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao atualizar disciplina customizada:", error.message);
            throw error;
        }
    }

    /**
     * Remove uma disciplina customizada
     */
    async deleteCustomDiscipline(customId, userId) {
        console.log(`🔵 [UserSchedulesService] Removendo disciplina customizada ${customId}`);
        try {
            // Busca a disciplina customizada para obter o schedule_id
            const custom = await userSchedulesModel.getCustomDisciplineById(customId);
            if (!custom) {
                throw new Error('Disciplina customizada não encontrada');
            }
            
            // Valida que pertence ao usuário
            const schedule = await userSchedulesModel.getScheduleById(custom.schedule_id);
            if (!schedule || schedule.user_id !== userId) {
                throw new Error('Acesso negado');
            }
            
            await userSchedulesModel.deleteCustomDiscipline(customId, custom.schedule_id);
            console.log(`🟢 [UserSchedulesService] Disciplina customizada removida`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao remover disciplina customizada:", error.message);
            throw error;
        }
    }

    /**
     * Detecta conflitos de horário em um plano
     */
    async detectConflicts(scheduleId, userId) {
        console.log(`🔵 [UserSchedulesService] Detectando conflitos no plano ${scheduleId}`);
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

            console.log(`🟢 [UserSchedulesService] ${conflicts.length} conflitos detectados`);
            return conflicts;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao detectar conflitos:", error.message);
            throw error;
        }
    }

    /**
     * Verifica se dois intervalos de tempo se sobrepõem
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
    }

    /**
     * Calcula total de créditos de um plano (incluindo disciplinas customizadas)
     */
    async calculateCredits(scheduleId, userId) {
        console.log(`🔵 [UserSchedulesService] Calculando créditos do plano ${scheduleId}`);
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

            console.log(`🟢 [UserSchedulesService] Créditos: aula=${creditos_aula}, trabalho=${creditos_trabalho}`);
            return { creditos_aula, creditos_trabalho };
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao calcular créditos:", error.message);
            throw error;
        }
    }

    /**
     * Verifica conflitos antes de adicionar uma turma específica
     */
    async checkConflictsForClass(scheduleId, userId, classId) {
        console.log(`🔵 [UserSchedulesService] Verificando conflitos para turma ${classId} no plano ${scheduleId}`);
        try {
            const fullSchedule = await this.getFullSchedule(scheduleId, userId);
            if (!fullSchedule) {
                return [];
            }

            // Busca os horários da turma que queremos adicionar
            const newClassSchedules = await userSchedulesModel.getClassSchedules(classId);
            if (!newClassSchedules || newClassSchedules.length === 0) {
                console.log(`🟡 [UserSchedulesService] Turma não possui horários cadastrados`);
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

            console.log(`🟢 [UserSchedulesService] ${conflicts.length} conflitos encontrados`);
            return conflicts;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao verificar conflitos:", error.message);
            throw error;
        }
    }

    /**
     * Lista todas as disciplinas customizadas do usuário
     */
    async getCustomDisciplines(userId) {
        console.log(`🔵 [UserSchedulesService] Listando disciplinas customizadas do usuário ${userId}`);
        try {
            const disciplines = await userSchedulesModel.getCustomDisciplinesByUserId(userId);
            console.log(`🟢 [UserSchedulesService] ${disciplines.length} disciplinas customizadas encontradas`);
            return disciplines;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao listar disciplinas customizadas:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza a cor de uma turma específica no plano
     */
    async updateScheduleClassColor(scheduleId, userId, classId, color) {
        console.log(`🔵 [UserSchedulesService] Atualizando cor da turma ${classId} no plano ${scheduleId}`);
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            await userSchedulesModel.updateScheduleClassByClassId(scheduleId, classId, { color });
            console.log(`🟢 [UserSchedulesService] Cor da turma atualizada`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao atualizar cor da turma:", error.message);
            throw error;
        }
    }

    // ===================== DISCIPLINAS NA LISTA (SIDEBAR) =====================

    /**
     * Adiciona uma disciplina à lista do plano
     */
    async addDisciplineToSchedule(scheduleId, userId, disciplineId, options = {}) {
        console.log(`🔵 [UserSchedulesService] Adicionando disciplina ${disciplineId} à lista do plano ${scheduleId}`);
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            // Conta itens para determinar cor
            const existingDisciplines = await userSchedulesModel.getScheduleDisciplines(scheduleId);
            const color = options.color || this.getNextColor(existingDisciplines.length);

            const result = await userSchedulesModel.addDisciplineToSchedule(scheduleId, disciplineId, {
                ...options,
                color
            });
            console.log(`🟢 [UserSchedulesService] Disciplina adicionada à lista`);
            return result;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao adicionar disciplina à lista:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma disciplina na lista do plano
     */
    async updateScheduleDiscipline(scheduleId, userId, disciplineId, updates) {
        console.log(`🔵 [UserSchedulesService] Atualizando disciplina ${disciplineId} na lista do plano ${scheduleId}`);
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            // Busca o registro da disciplina no plano
            const disciplines = await userSchedulesModel.getScheduleDisciplines(scheduleId);
            const discipline = disciplines.find(d => d.discipline_id === disciplineId);
            
            if (!discipline) {
                throw new Error('Disciplina não encontrada no plano');
            }

            await userSchedulesModel.updateScheduleDiscipline(discipline.id, updates);
            console.log(`🟢 [UserSchedulesService] Disciplina atualizada na lista`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao atualizar disciplina na lista:", error.message);
            throw error;
        }
    }

    /**
     * Remove uma disciplina da lista do plano
     */
    async removeDisciplineFromSchedule(scheduleId, userId, disciplineId) {
        console.log(`🔵 [UserSchedulesService] Removendo disciplina ${disciplineId} da lista do plano ${scheduleId}`);
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            await userSchedulesModel.removeDisciplineFromSchedule(scheduleId, disciplineId);
            console.log(`🟢 [UserSchedulesService] Disciplina removida da lista`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao remover disciplina da lista:", error.message);
            throw error;
        }
    }

    /**
     * Lista as disciplinas na lista de um plano
     */
    async getScheduleDisciplines(scheduleId, userId) {
        console.log(`🔵 [UserSchedulesService] Listando disciplinas do plano ${scheduleId}`);
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            const disciplines = await userSchedulesModel.getScheduleDisciplines(scheduleId);
            console.log(`🟢 [UserSchedulesService] ${disciplines.length} disciplinas encontradas`);
            return disciplines;
        } catch (error) {
            console.error("🔴 [UserSchedulesService] Erro ao listar disciplinas:", error.message);
            throw error;
        }
    }
}

module.exports = new UserSchedulesService();
