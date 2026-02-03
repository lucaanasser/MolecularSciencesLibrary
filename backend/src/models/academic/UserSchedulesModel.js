// Importa funções utilitárias para executar queries no banco de dados
const { executeQuery, getQuery, allQuery } = require('../../database/db');

/**
 * Modelo para operações no banco de dados relacionadas às grades/planos de usuários.
 * Responsável apenas pela persistência e recuperação de dados.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class UserSchedulesModel {
    // ===================== USER SCHEDULES (Planos) =====================

    /**
     * Lista todos os planos de um usuário (não deletados)
     */
    async getSchedulesByUserId(userId) {
        console.log(`🔵 [UserSchedulesModel] Buscando planos do usuário: ${userId}`);
        const query = `
            SELECT * FROM user_schedules 
            WHERE user_id = ? AND is_deleted = 0 
            ORDER BY created_at ASC
        `;
        try {
            const schedules = await allQuery(query, [userId]);
            console.log(`🟢 [UserSchedulesModel] Planos encontrados: ${schedules.length}`);
            return schedules;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar planos:", error.message);
            throw error;
        }
    }

    /**
     * Busca um plano por ID
     */
    async getScheduleById(scheduleId) {
        console.log(`🔵 [UserSchedulesModel] Buscando plano por ID: ${scheduleId}`);
        const query = `SELECT * FROM user_schedules WHERE id = ? AND is_deleted = 0`;
        try {
            const schedule = await getQuery(query, [scheduleId]);
            if (schedule) {
                console.log(`🟢 [UserSchedulesModel] Plano encontrado: ${scheduleId}`);
            } else {
                console.log(`🟡 [UserSchedulesModel] Plano não encontrado: ${scheduleId}`);
            }
            return schedule;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar plano:", error.message);
            throw error;
        }
    }

    /**
     * Cria um novo plano para o usuário
     */
    async createSchedule(userId, name = 'Novo Plano') {
        console.log(`🔵 [UserSchedulesModel] Criando plano para usuário ${userId}: ${name}`);
        const query = `
            INSERT INTO user_schedules (user_id, name, is_active, is_deleted, created_at, updated_at)
            VALUES (?, ?, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        try {
            const result = await executeQuery(query, [userId, name]);
            console.log(`🟢 [UserSchedulesModel] Plano criado com ID: ${result.lastID}`);
            return { id: result.lastID, user_id: userId, name, is_active: 1, is_deleted: 0 };
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao criar plano:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza um plano (nome, is_active)
     */
    async updateSchedule(scheduleId, { name, is_active }) {
        console.log(`🔵 [UserSchedulesModel] Atualizando plano ${scheduleId}`);
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active ? 1 : 0);
        }
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(scheduleId);

        const query = `UPDATE user_schedules SET ${updates.join(', ')} WHERE id = ?`;
        try {
            await executeQuery(query, params);
            console.log(`🟢 [UserSchedulesModel] Plano ${scheduleId} atualizado`);
            return this.getScheduleById(scheduleId);
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao atualizar plano:", error.message);
            throw error;
        }
    }

    /**
     * Soft delete de um plano (marca is_deleted = 1)
     * Apaga apenas as disciplinas da lista (user_schedule_disciplines)
     */
    async deleteSchedule(scheduleId) {
        console.log(`🔵 [UserSchedulesModel] Soft delete do plano ${scheduleId}`);
        try {
            // Apaga todas as disciplinas da lista do plano
            await executeQuery(
                `DELETE FROM user_schedule_disciplines WHERE schedule_id = ?`,
                [scheduleId]
            );
            console.log(`🟢 [UserSchedulesModel] Disciplinas do plano ${scheduleId} apagadas`);
            
            // Marca o plano como deletado (soft delete)
            await executeQuery(
                `UPDATE user_schedules SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );
            console.log(`🟢 [UserSchedulesModel] Plano ${scheduleId} marcado como deletado`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao deletar plano:", error.message);
            throw error;
        }
    }

    // ===================== SCHEDULE CLASSES (Turmas no plano) =====================

    /**
     * Lista todas as turmas de um plano com informações completas
     */
    async getScheduleClasses(scheduleId) {
        console.log(`🔵 [UserSchedulesModel] Buscando turmas do plano ${scheduleId}`);
        const query = `
            SELECT 
                usc.id,
                usc.schedule_id,
                usc.class_id,
                usc.color,
                usc.is_visible,
                dc.codigo_turma,
                dc.tipo,
                dc.inicio,
                dc.fim,
                dc.observacoes,
                d.id as discipline_id,
                d.codigo as discipline_codigo,
                d.nome as discipline_nome,
                d.unidade,
                d.campus,
                d.creditos_aula,
                d.creditos_trabalho
            FROM user_schedule_classes usc
            JOIN discipline_classes dc ON usc.class_id = dc.id
            JOIN disciplines d ON dc.discipline_id = d.id
            WHERE usc.schedule_id = ?
            ORDER BY d.codigo ASC
        `;
        try {
            const classes = await allQuery(query, [scheduleId]);
            console.log(`🟢 [UserSchedulesModel] Turmas encontradas: ${classes.length}`);
            return classes;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar turmas:", error.message);
            throw error;
        }
    }

    /**
     * Busca os horários de uma turma
     */
    async getClassSchedules(classId) {
        console.log(`🔵 [UserSchedulesModel] Buscando horários da turma ${classId}`);
        const query = `
            SELECT cs.*, cp.nome as professor_nome
            FROM class_schedules cs
            LEFT JOIN class_professors cp ON cs.id = cp.schedule_id
            WHERE cs.class_id = ?
        `;
        try {
            const schedules = await allQuery(query, [classId]);
            console.log(`🟢 [UserSchedulesModel] Horários encontrados: ${schedules.length}`);
            return schedules;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar horários:", error.message);
            throw error;
        }
    }

    /**
     * Adiciona uma turma ao plano
     */
    async addClassToSchedule(scheduleId, classId, color = '#14b8a6') {
        console.log(`🔵 [UserSchedulesModel] Adicionando turma ${classId} ao plano ${scheduleId}`);
        
        // Verifica se já existe
        const existing = await getQuery(
            `SELECT id FROM user_schedule_classes WHERE schedule_id = ? AND class_id = ?`,
            [scheduleId, classId]
        );
        
        if (existing) {
            console.log(`🟡 [UserSchedulesModel] Turma já existe no plano`);
            return existing;
        }

        const query = `
            INSERT INTO user_schedule_classes (schedule_id, class_id, color, is_visible, created_at)
            VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
        `;
        try {
            const result = await executeQuery(query, [scheduleId, classId, color]);
            console.log(`🟢 [UserSchedulesModel] Turma adicionada com ID: ${result.lastID}`);
            
            // Atualiza updated_at do plano
            await executeQuery(
                `UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );
            
            return { id: result.lastID, schedule_id: scheduleId, class_id: classId, color, is_visible: 1 };
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao adicionar turma:", error.message);
            throw error;
        }
    }

    /**
     * Remove uma turma do plano
     */
    async removeClassFromSchedule(scheduleId, classId) {
        console.log(`🔵 [UserSchedulesModel] Removendo turma ${classId} do plano ${scheduleId}`);
        const query = `DELETE FROM user_schedule_classes WHERE schedule_id = ? AND class_id = ?`;
        try {
            await executeQuery(query, [scheduleId, classId]);
            console.log(`🟢 [UserSchedulesModel] Turma removida`);
            
            // Atualiza updated_at do plano
            await executeQuery(
                `UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );
            
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao remover turma:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma turma no plano (cor, visibilidade)
     */
    async updateScheduleClass(id, { color, is_visible }) {
        console.log(`🔵 [UserSchedulesModel] Atualizando turma ${id}`);
        const updates = [];
        const params = [];

        if (color !== undefined) {
            updates.push('color = ?');
            params.push(color);
        }
        if (is_visible !== undefined) {
            updates.push('is_visible = ?');
            params.push(is_visible ? 1 : 0);
        }
        params.push(id);

        if (updates.length === 0) {
            return null;
        }

        const query = `UPDATE user_schedule_classes SET ${updates.join(', ')} WHERE id = ?`;
        try {
            await executeQuery(query, params);
            console.log(`🟢 [UserSchedulesModel] Turma ${id} atualizada`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao atualizar turma:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma turma no plano pelo class_id e schedule_id
     */
    async updateScheduleClassByClassId(scheduleId, classId, { color, is_visible }) {
        console.log(`🔵 [UserSchedulesModel] Atualizando turma ${classId} no plano ${scheduleId}`);
        const updates = [];
        const params = [];

        if (color !== undefined) {
            updates.push('color = ?');
            params.push(color);
        }
        if (is_visible !== undefined) {
            updates.push('is_visible = ?');
            params.push(is_visible ? 1 : 0);
        }
        params.push(scheduleId, classId);

        if (updates.length === 0) {
            return null;
        }

        const query = `UPDATE user_schedule_classes SET ${updates.join(', ')} WHERE schedule_id = ? AND class_id = ?`;
        try {
            await executeQuery(query, params);
            console.log(`🟢 [UserSchedulesModel] Turma atualizada`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao atualizar turma:", error.message);
            throw error;
        }
    }

    // ===================== CUSTOM DISCIPLINES (Disciplinas manuais) =====================

    /**
     * Lista disciplinas customizadas de um plano com seus horários
     */
    async getCustomDisciplines(scheduleId) {
        console.log(`🔵 [UserSchedulesModel] Buscando disciplinas customizadas do plano ${scheduleId}`);
        const query = `SELECT * FROM user_custom_disciplines WHERE schedule_id = ? ORDER BY nome ASC`;
        try {
            const disciplines = await allQuery(query, [scheduleId]);
            
            // Para cada disciplina, buscar seus horários
            for (const discipline of disciplines) {
                const schedulesQuery = `
                    SELECT dia, horario_inicio, horario_fim 
                    FROM user_custom_discipline_schedules 
                    WHERE custom_discipline_id = ?
                    ORDER BY 
                        CASE dia 
                            WHEN 'seg' THEN 1
                            WHEN 'ter' THEN 2
                            WHEN 'qua' THEN 3
                            WHEN 'qui' THEN 4
                            WHEN 'sex' THEN 5
                            WHEN 'sab' THEN 6
                            ELSE 7
                        END
                `;
                discipline.schedules = await allQuery(schedulesQuery, [discipline.id]);
            }
            
            console.log(`🟢 [UserSchedulesModel] Disciplinas customizadas encontradas: ${disciplines.length}`);
            return disciplines;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar disciplinas customizadas:", error.message);
            throw error;
        }
    }

    /**
     * Busca uma disciplina customizada por ID
     */
    async getCustomDisciplineById(id) {
        console.log(`🔵 [UserSchedulesModel] Buscando disciplina customizada ${id}`);
        const query = `SELECT * FROM user_custom_disciplines WHERE id = ?`;
        try {
            const discipline = await getQuery(query, [id]);
            if (discipline) {
                console.log(`🟢 [UserSchedulesModel] Disciplina customizada encontrada`);
            } else {
                console.log(`🟡 [UserSchedulesModel] Disciplina customizada não encontrada`);
            }
            return discipline;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar disciplina customizada:", error.message);
            throw error;
        }
    }

    /**
     * Lista todas as disciplinas customizadas de um usuário (em todos os seus planos)
     */
    async getCustomDisciplinesByUserId(userId) {
        console.log(`🔵 [UserSchedulesModel] Buscando disciplinas customizadas do usuário ${userId}`);
        const query = `
            SELECT ucd.*, us.name as schedule_name
            FROM user_custom_disciplines ucd
            JOIN user_schedules us ON ucd.schedule_id = us.id
            WHERE us.user_id = ? AND us.is_deleted = 0
            ORDER BY ucd.nome ASC
        `;
        try {
            const disciplines = await allQuery(query, [userId]);
            
            // Para cada disciplina, buscar seus horários
            for (const discipline of disciplines) {
                const schedulesQuery = `
                    SELECT dia, horario_inicio, horario_fim 
                    FROM user_custom_discipline_schedules 
                    WHERE custom_discipline_id = ?
                `;
                discipline.schedules = await allQuery(schedulesQuery, [discipline.id]);
            }
            
            console.log(`🟢 [UserSchedulesModel] Disciplinas customizadas encontradas: ${disciplines.length}`);
            return disciplines;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar disciplinas customizadas do usuário:", error.message);
            throw error;
        }
    }

    /**
     * Adiciona uma disciplina customizada com múltiplos horários
     * @param {number} scheduleId - ID do plano
     * @param {object} data - { nome, codigo, creditos_aula, creditos_trabalho, color, schedules: [{dia, horario_inicio, horario_fim}] }
     */
    async addCustomDiscipline(scheduleId, { nome, codigo, creditos_aula, creditos_trabalho, color = '#14b8a6', schedules = [] }) {
        console.log(`🔵 [UserSchedulesModel] Adicionando disciplina customizada: ${nome}`);
        
        try {
            // 1. Criar entrada na tabela user_custom_disciplines
            const query = `
                INSERT INTO user_custom_disciplines 
                (schedule_id, nome, codigo, creditos_aula, creditos_trabalho, color, created_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;
            const result = await executeQuery(query, [scheduleId, nome, codigo, creditos_aula, creditos_trabalho, color]);
            const customDisciplineId = result.lastID;
            console.log(`🟢 [UserSchedulesModel] Disciplina customizada criada com ID: ${customDisciplineId}`);
            
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
                console.log(`🟢 [UserSchedulesModel] ${schedules.length} horários adicionados`);
            }
            
            // 3. Adicionar à lista de disciplinas do plano (user_schedule_disciplines)
            // Usa ID negativo para diferenciar de disciplinas regulares
            const addToListQuery = `
                INSERT INTO user_schedule_disciplines 
                (schedule_id, discipline_id, selected_class_id, is_visible, is_expanded, color, created_at)
                VALUES (?, ?, NULL, 1, 0, ?, CURRENT_TIMESTAMP)
            `;
            await executeQuery(addToListQuery, [scheduleId, -customDisciplineId, color]);
            console.log(`🟢 [UserSchedulesModel] Disciplina customizada adicionada à lista do plano`);
            
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
            console.error("🔴 [UserSchedulesModel] Erro ao adicionar disciplina customizada:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma disciplina customizada
     * @param {number} id - ID da disciplina customizada
     * @param {object} data - { nome, codigo, creditos_aula, creditos_trabalho, color, is_visible, schedules }
     */
    async updateCustomDiscipline(id, { nome, codigo, creditos_aula, creditos_trabalho, color, is_visible, schedules }) {
        console.log(`🔵 [UserSchedulesModel] Atualizando disciplina customizada ${id}`);
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
                console.log(`🟢 [UserSchedulesModel] Disciplina customizada ${id} atualizada`);
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
                    console.log(`🟢 [UserSchedulesModel] ${schedules.length} horários atualizados`);
                }
            }
            
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao atualizar disciplina customizada:", error.message);
            throw error;
        }
    }

    /**
     * Remove uma disciplina customizada (soft delete via user_schedule_disciplines)
     */
    async deleteCustomDiscipline(id, scheduleId) {
        console.log(`🔵 [UserSchedulesModel] Removendo disciplina customizada ${id} do plano ${scheduleId}`);
        try {
            // Soft delete: marca como invisível em user_schedule_disciplines
            await executeQuery(
                `UPDATE user_schedule_disciplines SET is_visible = 0 WHERE schedule_id = ? AND discipline_id = ?`,
                [scheduleId, -id]
            );
            
            console.log(`🟢 [UserSchedulesModel] Disciplina customizada marcada como invisível`);
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao remover disciplina customizada:", error.message);
            throw error;
        }
    }

    // ===================== SCHEDULE DISCIPLINES (Disciplinas na lista) =====================

    /**
     * Lista todas as disciplinas na lista de um plano
     */
    async getScheduleDisciplines(scheduleId) {
        console.log(`🔵 [UserSchedulesModel] Buscando disciplinas do plano ${scheduleId}`);
        const query = `
            SELECT 
                usd.id,
                usd.schedule_id,
                usd.discipline_id,
                usd.selected_class_id,
                usd.is_visible,
                usd.is_expanded,
                usd.color,
                CASE 
                    WHEN usd.discipline_id < 0 THEN ucd.codigo
                    ELSE d.codigo
                END as discipline_codigo,
                CASE 
                    WHEN usd.discipline_id < 0 THEN ucd.nome
                    ELSE d.nome
                END as discipline_nome,
                COALESCE(d.unidade, '') as unidade,
                COALESCE(d.campus, '') as campus,
                CASE 
                    WHEN usd.discipline_id < 0 THEN ucd.creditos_aula
                    ELSE d.creditos_aula
                END as creditos_aula,
                CASE 
                    WHEN usd.discipline_id < 0 THEN ucd.creditos_trabalho
                    ELSE d.creditos_trabalho
                END as creditos_trabalho
            FROM user_schedule_disciplines usd
            LEFT JOIN disciplines d ON usd.discipline_id = d.id AND usd.discipline_id > 0
            LEFT JOIN user_custom_disciplines ucd ON -usd.discipline_id = ucd.id AND usd.discipline_id < 0
            WHERE usd.schedule_id = ?
            ORDER BY usd.created_at ASC
        `;
        try {
            const disciplines = await allQuery(query, [scheduleId]);
            
            // Para disciplinas customizadas, buscar os horários
            for (const disc of disciplines) {
                if (disc.discipline_id < 0) {
                    const customId = -disc.discipline_id;
                    const schedulesQuery = `
                        SELECT dia, horario_inicio, horario_fim 
                        FROM user_custom_discipline_schedules 
                        WHERE custom_discipline_id = ?
                    `;
                    disc.customSchedules = await allQuery(schedulesQuery, [customId]);
                }
            }
            
            console.log(`🟢 [UserSchedulesModel] Disciplinas encontradas: ${disciplines.length}`);
            return disciplines;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar disciplinas do plano:", error.message);
            throw error;
        }
    }

    /**
     * Adiciona uma disciplina à lista do plano
     */
    async addDisciplineToSchedule(scheduleId, disciplineId, { selectedClassId = null, isVisible = true, isExpanded = false, color = '#14b8a6' } = {}) {
        console.log(`🔵 [UserSchedulesModel] Adicionando disciplina ${disciplineId} ao plano ${scheduleId}`);
        
        // Verifica se já existe
        const existing = await getQuery(
            `SELECT id FROM user_schedule_disciplines WHERE schedule_id = ? AND discipline_id = ?`,
            [scheduleId, disciplineId]
        );
        
        if (existing) {
            console.log(`🟡 [UserSchedulesModel] Disciplina já existe no plano, atualizando...`);
            return this.updateScheduleDiscipline(existing.id, { selectedClassId, isVisible, isExpanded, color });
        }

        const query = `
            INSERT INTO user_schedule_disciplines 
            (schedule_id, discipline_id, selected_class_id, is_visible, is_expanded, color, created_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        try {
            const lastID = await executeQuery(query, [scheduleId, disciplineId, selectedClassId, isVisible ? 1 : 0, isExpanded ? 1 : 0, color]);
            console.log(`🟢 [UserSchedulesModel] Disciplina adicionada com ID: ${lastID}`);
            
            // Atualiza updated_at do plano
            await executeQuery(
                `UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );
            
            // Busca os dados completos da disciplina para retornar
            const disciplineData = await getQuery(
                `SELECT codigo, nome, creditos_aula, creditos_trabalho FROM disciplines WHERE id = ?`,
                [disciplineId]
            );
            
            return { 
                id: lastID, 
                schedule_id: scheduleId, 
                discipline_id: disciplineId,
                discipline_codigo: disciplineData?.codigo,
                discipline_nome: disciplineData?.nome,
                creditos_aula: disciplineData?.creditos_aula,
                creditos_trabalho: disciplineData?.creditos_trabalho,
                selected_class_id: selectedClassId,
                is_visible: isVisible ? 1 : 0,
                is_expanded: isExpanded ? 1 : 0,
                color
            };
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao adicionar disciplina ao plano:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma disciplina na lista do plano
     */
    async updateScheduleDiscipline(id, { selectedClassId, isVisible, isExpanded, color }) {
        console.log(`🔵 [UserSchedulesModel] Atualizando disciplina ${id} no plano`);
        const updates = [];
        const params = [];

        if (selectedClassId !== undefined) { 
            updates.push('selected_class_id = ?'); 
            params.push(selectedClassId); 
        }
        if (isVisible !== undefined) { 
            updates.push('is_visible = ?'); 
            params.push(isVisible ? 1 : 0); 
        }
        if (isExpanded !== undefined) { 
            updates.push('is_expanded = ?'); 
            params.push(isExpanded ? 1 : 0); 
        }
        if (color !== undefined) { 
            updates.push('color = ?'); 
            params.push(color); 
        }

        if (updates.length === 0) {
            return null;
        }

        params.push(id);
        const query = `UPDATE user_schedule_disciplines SET ${updates.join(', ')} WHERE id = ?`;
        try {
            await executeQuery(query, params);
            console.log(`🟢 [UserSchedulesModel] Disciplina ${id} atualizada no plano`);
            return this.getScheduleDisciplineById(id);
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao atualizar disciplina no plano:", error.message);
            throw error;
        }
    }

    /**
     * Busca uma disciplina do plano por ID
     */
    async getScheduleDisciplineById(id) {
        const query = `SELECT * FROM user_schedule_disciplines WHERE id = ?`;
        try {
            return await getQuery(query, [id]);
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar disciplina do plano:", error.message);
            throw error;
        }
    }

    /**
     * Remove uma disciplina da lista do plano
     */
    async removeDisciplineFromSchedule(scheduleId, disciplineId) {
        console.log(`🔵 [UserSchedulesModel] Removendo disciplina ${disciplineId} do plano ${scheduleId}`);
        const query = `DELETE FROM user_schedule_disciplines WHERE schedule_id = ? AND discipline_id = ?`;
        try {
            await executeQuery(query, [scheduleId, disciplineId]);
            console.log(`🟢 [UserSchedulesModel] Disciplina removida do plano`);
            
            // Atualiza updated_at do plano
            await executeQuery(
                `UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );
            
            return true;
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao remover disciplina do plano:", error.message);
            throw error;
        }
    }

    /**
     * Busca um plano completo com todas as turmas, horários, disciplinas da lista e customizadas
     */
    async getFullSchedule(scheduleId) {
        console.log(`🔵 [UserSchedulesModel] Buscando plano completo ${scheduleId}`);
        try {
            const schedule = await this.getScheduleById(scheduleId);
            if (!schedule) {
                return null;
            }

            const classes = await this.getScheduleClasses(scheduleId);
            
            // Busca horários para cada turma
            for (const cls of classes) {
                cls.schedules = await this.getClassSchedules(cls.class_id);
            }

            const customDisciplines = await this.getCustomDisciplines(scheduleId);
            
            // Busca disciplinas da lista (sidebar)
            const scheduleDisciplines = await this.getScheduleDisciplines(scheduleId);

            console.log(`🟢 [UserSchedulesModel] Plano completo carregado`);
            return {
                ...schedule,
                classes,
                customDisciplines,
                scheduleDisciplines
            };
        } catch (error) {
            console.error("🔴 [UserSchedulesModel] Erro ao buscar plano completo:", error.message);
            throw error;
        }
    }
}

module.exports = new UserSchedulesModel();
