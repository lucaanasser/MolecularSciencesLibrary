/**
 * Porte de /api/user-schedules do Express (routes/academic/UserSchedulesRoutes.js).
 * Contrato espelhado da cadeia UserSchedulesController (5 handlers) ->
 * UserSchedulesService (5 módulos) -> UserSchedulesModel (5 módulos).
 * Todas as rotas exigem autenticação (authenticateToken).
 *
 * Notas de porte:
 * - As mensagens de erro/status espelham o Express, inclusive os casos em que
 *   falha de ownership vira 500 genérico (disciplines/color) em vez de 404.
 * - PUT/DELETE /custom-disciplines/:disciplineId: o controller Express lê
 *   req.params.customId (parâmetro inexistente na rota, que declara :disciplineId),
 *   virando NaN — bug no Express. Aqui usamos :disciplineId (intenção evidente).
 */
import { Hono } from 'hono';
import { all, batch, first, run } from '../db';
import { authenticateToken, type JwtUser } from '../auth';
import type { Env } from '../index';

// Paleta de cores padrão para disciplinas (espelho de schedulesService.js).
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

const getNextColor = (currentCount: number): string => DEFAULT_COLORS[currentCount % DEFAULT_COLORS.length];

// ---------------------------------------------------------------------------
// Camada de dados (espelho dos módulos de UserSchedulesModel)
// ---------------------------------------------------------------------------

/** Guarda de ownership: plano existe (não deletado) e pertence ao usuário. */
async function getScheduleOwned(db: D1Database, scheduleId: number, userId: number): Promise<any | null> {
  const schedule = await first<any>(db, 'SELECT * FROM user_schedules WHERE id = ? AND is_deleted = 0', [scheduleId]);
  if (!schedule) return null;
  if (schedule.user_id !== userId) return null;
  return schedule;
}

async function getScheduleClasses(db: D1Database, scheduleId: number): Promise<any[]> {
  return all<any>(
    db,
    `SELECT
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
     ORDER BY d.codigo ASC`,
    [scheduleId]
  );
}

async function getClassSchedules(db: D1Database, classId: number): Promise<any[]> {
  return all<any>(
    db,
    `SELECT cs.*, cp.nome as professor_nome
     FROM class_schedules cs
     LEFT JOIN class_professors cp ON cs.id = cp.schedule_id
     WHERE cs.class_id = ?`,
    [classId]
  );
}

async function getCustomDisciplines(db: D1Database, scheduleId: number): Promise<any[]> {
  const disciplines = await all<any>(
    db,
    'SELECT * FROM user_custom_disciplines WHERE schedule_id = ? ORDER BY nome ASC',
    [scheduleId]
  );

  for (const discipline of disciplines) {
    discipline.schedules = await all<any>(
      db,
      `SELECT dia, horario_inicio, horario_fim
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
          END`,
      [discipline.id]
    );
  }

  return disciplines;
}

async function getScheduleDisciplines(db: D1Database, scheduleId: number): Promise<any[]> {
  const disciplines = await all<any>(
    db,
    `SELECT
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
     ORDER BY usd.created_at ASC`,
    [scheduleId]
  );

  for (const disc of disciplines) {
    if (disc.discipline_id < 0) {
      disc.customSchedules = await all<any>(
        db,
        `SELECT dia, horario_inicio, horario_fim
         FROM user_custom_discipline_schedules
         WHERE custom_discipline_id = ?`,
        [-disc.discipline_id]
      );
    }
  }

  return disciplines;
}

async function getFullSchedule(db: D1Database, scheduleId: number): Promise<any | null> {
  const schedule = await first<any>(db, 'SELECT * FROM user_schedules WHERE id = ? AND is_deleted = 0', [scheduleId]);
  if (!schedule) return null;

  const classes = await getScheduleClasses(db, scheduleId);
  for (const cls of classes) {
    cls.schedules = await getClassSchedules(db, cls.class_id);
  }

  const customDisciplines = await getCustomDisciplines(db, scheduleId);
  const scheduleDisciplines = await getScheduleDisciplines(db, scheduleId);

  return { ...schedule, classes, customDisciplines, scheduleDisciplines };
}

const TOUCH_SCHEDULE_SQL = 'UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?';

// Espelho de conflictsCreditsService.hasTimeOverlap.
function hasTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  return s1 < e2 && s2 < e1;
}

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------
const userSchedules = new Hono<{ Bindings: Env; Variables: { user: JwtUser } }>();

// Todas as rotas requerem autenticação (espelho do router.use(authenticateToken)).
userSchedules.use('*', authenticateToken());

// ==================== PLANOS/GRADES ====================

// Lista todas as grades do usuário autenticado.
userSchedules.get('/', async (c) => {
  try {
    const userId = c.get('user').id;
    const schedules = await all<any>(
      c.env.DB,
      'SELECT * FROM user_schedules WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at ASC',
      [userId]
    );
    return c.json(schedules);
  } catch (_error) {
    return c.json({ error: 'Erro ao listar planos' }, 500);
  }
});

// ==================== DISCIPLINAS CUSTOMIZADAS ====================
// (registradas antes das rotas com :scheduleId para precedência estática)

// Lista disciplinas customizadas do usuário (todos os planos ativos).
userSchedules.get('/custom-disciplines', async (c) => {
  try {
    const userId = c.get('user').id;
    const disciplines = await all<any>(
      c.env.DB,
      `SELECT ucd.*, us.name as schedule_name
       FROM user_custom_disciplines ucd
       JOIN user_schedules us ON ucd.schedule_id = us.id
       WHERE us.user_id = ? AND us.is_deleted = 0
       ORDER BY ucd.nome ASC`,
      [userId]
    );

    for (const discipline of disciplines) {
      discipline.schedules = await all<any>(
        c.env.DB,
        `SELECT dia, horario_inicio, horario_fim
         FROM user_custom_discipline_schedules
         WHERE custom_discipline_id = ?`,
        [discipline.id]
      );
    }

    return c.json(disciplines);
  } catch (_error) {
    return c.json({ error: 'Erro ao listar disciplinas customizadas' }, 500);
  }
});

// Cria uma disciplina customizada (schedule_id vem do body).
userSchedules.post('/custom-disciplines', async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  const { nome, codigo, creditos_aula, creditos_trabalho, color, schedule_id, schedules } = body as any;

  if (!nome) {
    return c.json({ error: 'nome é obrigatório' }, 400);
  }
  if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
    return c.json({ error: 'schedules deve ser um array com pelo menos um horário' }, 400);
  }
  for (const schedule of schedules) {
    if (!schedule.dia || !schedule.horario_inicio || !schedule.horario_fim) {
      return c.json({ error: 'Cada schedule deve ter dia, horario_inicio e horario_fim' }, 400);
    }
  }

  try {
    const userId = c.get('user').id;
    const schedule = await getScheduleOwned(c.env.DB, schedule_id, userId);
    if (!schedule) {
      // No Express, o result nulo estoura TypeError no controller e vira 500 genérico.
      return c.json({ error: 'Erro ao criar disciplina customizada' }, 500);
    }

    // Conta itens para determinar cor (espelho do customDisciplinesService).
    const existingClasses = await getScheduleClasses(c.env.DB, schedule_id);
    const customDisciplines = await getCustomDisciplines(c.env.DB, schedule_id);
    const totalCount = existingClasses.length + customDisciplines.length;
    const finalColor = color || getNextColor(totalCount);

    const result = await run(
      c.env.DB,
      `INSERT INTO user_custom_disciplines
       (schedule_id, nome, codigo, creditos_aula, creditos_trabalho, color, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [schedule_id, nome, codigo ?? null, creditos_aula ?? null, creditos_trabalho ?? null, finalColor]
    );
    const customDisciplineId = result.meta.last_row_id;

    const statements: { sql: string; params?: unknown[] }[] = [];
    for (const s of schedules) {
      statements.push({
        sql: `INSERT INTO user_custom_discipline_schedules
              (custom_discipline_id, dia, horario_inicio, horario_fim, created_at)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        params: [customDisciplineId, s.dia, s.horario_inicio, s.horario_fim]
      });
    }
    // Adiciona à lista do plano com ID negativo (diferencia de disciplinas regulares).
    statements.push({
      sql: `INSERT INTO user_schedule_disciplines
            (schedule_id, discipline_id, selected_class_id, is_visible, is_expanded, color, created_at)
            VALUES (?, ?, NULL, 1, 0, ?, CURRENT_TIMESTAMP)`,
      params: [schedule_id, -customDisciplineId, finalColor]
    });
    statements.push({ sql: TOUCH_SCHEDULE_SQL, params: [schedule_id] });
    await batch(c.env.DB, statements);

    return c.json(
      {
        id: customDisciplineId,
        schedule_id,
        nome,
        codigo,
        creditos_aula,
        creditos_trabalho,
        color: finalColor,
        schedules
      },
      201
    );
  } catch (_error) {
    return c.json({ error: 'Erro ao criar disciplina customizada' }, 500);
  }
});

// Atualiza uma disciplina customizada.
userSchedules.put('/custom-disciplines/:disciplineId', async (c) => {
  try {
    const customId = parseInt(c.req.param('disciplineId'));
    const body = await c.req.json().catch(() => ({} as any));
    const { nome, codigo, creditos_aula, creditos_trabalho, color, is_visible, schedules } = body as any;

    const updates: string[] = [];
    const params: unknown[] = [];

    if (nome !== undefined) { updates.push('nome = ?'); params.push(nome); }
    if (codigo !== undefined) { updates.push('codigo = ?'); params.push(codigo); }
    if (creditos_aula !== undefined) { updates.push('creditos_aula = ?'); params.push(creditos_aula); }
    if (creditos_trabalho !== undefined) { updates.push('creditos_trabalho = ?'); params.push(creditos_trabalho); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }
    if (is_visible !== undefined) { updates.push('is_visible = ?'); params.push(is_visible ? 1 : 0); }

    if (updates.length > 0) {
      params.push(customId);
      await run(c.env.DB, `UPDATE user_custom_disciplines SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    if (schedules !== undefined) {
      const statements: { sql: string; params?: unknown[] }[] = [
        {
          sql: 'DELETE FROM user_custom_discipline_schedules WHERE custom_discipline_id = ?',
          params: [customId]
        }
      ];
      if (Array.isArray(schedules)) {
        for (const s of schedules) {
          statements.push({
            sql: `INSERT INTO user_custom_discipline_schedules
                  (custom_discipline_id, dia, horario_inicio, horario_fim, created_at)
                  VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            params: [customId, s.dia, s.horario_inicio, s.horario_fim]
          });
        }
      }
      await batch(c.env.DB, statements);
    }

    return c.json({ success: true });
  } catch (_error) {
    return c.json({ error: 'Erro ao atualizar disciplina customizada' }, 500);
  }
});

// Remove uma disciplina customizada (hard delete em todas as tabelas).
userSchedules.delete('/custom-disciplines/:disciplineId', async (c) => {
  try {
    const userId = c.get('user').id;
    const customId = parseInt(c.req.param('disciplineId'));

    const custom = await first<any>(c.env.DB, 'SELECT * FROM user_custom_disciplines WHERE id = ?', [customId]);
    if (!custom) {
      throw new Error('Disciplina customizada não encontrada');
    }

    const schedule = await first<any>(
      c.env.DB,
      'SELECT * FROM user_schedules WHERE id = ? AND is_deleted = 0',
      [custom.schedule_id]
    );
    if (!schedule || schedule.user_id !== userId) {
      throw new Error('Acesso negado');
    }

    await batch(c.env.DB, [
      { sql: 'DELETE FROM user_custom_discipline_schedules WHERE custom_discipline_id = ?', params: [customId] },
      { sql: 'DELETE FROM user_schedule_disciplines WHERE discipline_id = ?', params: [-customId] },
      { sql: 'DELETE FROM user_custom_disciplines WHERE id = ?', params: [customId] }
    ]);

    return c.json({ success: true });
  } catch (_error) {
    // Espelha o Express: qualquer falha (inclusive não encontrado/ownership) vira 500 genérico.
    return c.json({ error: 'Erro ao remover disciplina customizada' }, 500);
  }
});

// ==================== PLANOS/GRADES (continuação) ====================

// Busca uma grade completa (com turmas e disciplinas customizadas).
userSchedules.get('/:scheduleId/full', async (c) => {
  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      return c.json({ error: 'Plano não encontrado' }, 404);
    }

    const schedule = await getFullSchedule(c.env.DB, scheduleId);
    if (!schedule) {
      return c.json({ error: 'Plano não encontrado' }, 404);
    }

    return c.json(schedule);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar plano' }, 500);
  }
});

// Cria uma nova grade.
userSchedules.post('/', async (c) => {
  try {
    const userId = c.get('user').id;
    const body = await c.req.json().catch(() => ({} as any));
    const { name } = body as { name?: string };

    const existingSchedules = await all<any>(
      c.env.DB,
      'SELECT * FROM user_schedules WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at ASC',
      [userId]
    );
    const scheduleName = name || `Plano ${existingSchedules.length + 1}`;

    const result = await run(
      c.env.DB,
      `INSERT INTO user_schedules (user_id, name, is_active, is_deleted, created_at, updated_at)
       VALUES (?, ?, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, scheduleName]
    );

    return c.json(
      { id: result.meta.last_row_id, user_id: userId, name: scheduleName, is_active: 1, is_deleted: 0 },
      201
    );
  } catch (_error) {
    return c.json({ error: 'Erro ao criar plano' }, 500);
  }
});

// Atualiza uma grade (nome, is_active).
userSchedules.put('/:scheduleId', async (c) => {
  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));
    const body = await c.req.json().catch(() => ({} as any));
    const { name, is_active } = body as any;

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      return c.json({ error: 'Plano não encontrado' }, 404);
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(scheduleId);

    await run(c.env.DB, `UPDATE user_schedules SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await first<any>(c.env.DB, 'SELECT * FROM user_schedules WHERE id = ? AND is_deleted = 0', [scheduleId]);
    if (!updated) {
      return c.json({ error: 'Plano não encontrado' }, 404);
    }
    return c.json(updated);
  } catch (_error) {
    return c.json({ error: 'Erro ao atualizar plano' }, 500);
  }
});

// Remove uma grade (soft delete; apaga a lista de disciplinas do plano).
userSchedules.delete('/:scheduleId', async (c) => {
  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      return c.json({ error: 'Plano não encontrado' }, 404);
    }

    await batch(c.env.DB, [
      { sql: 'DELETE FROM user_schedule_disciplines WHERE schedule_id = ?', params: [scheduleId] },
      { sql: 'UPDATE user_schedules SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', params: [scheduleId] }
    ]);

    return c.json({ success: true });
  } catch (_error) {
    return c.json({ error: 'Erro ao deletar plano' }, 500);
  }
});

// ==================== TURMAS NA GRADE ====================

// Adiciona uma turma à grade (idempotente por schedule_id + class_id).
userSchedules.post('/:scheduleId/classes', async (c) => {
  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));
    const body = await c.req.json().catch(() => ({} as any));
    const { classId } = body as any;

    if (!classId) {
      return c.json({ error: 'classId é obrigatório' }, 400);
    }

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      return c.json({ error: 'Plano não encontrado' }, 404);
    }

    // Conta disciplinas para determinar cor.
    const existingClasses = await getScheduleClasses(c.env.DB, scheduleId);
    const customDisciplines = await getCustomDisciplines(c.env.DB, scheduleId);
    const color = getNextColor(existingClasses.length + customDisciplines.length);

    const existing = await first<any>(
      c.env.DB,
      'SELECT id FROM user_schedule_classes WHERE schedule_id = ? AND class_id = ?',
      [scheduleId, classId]
    );
    if (existing) {
      return c.json(existing, 201);
    }

    const result = await run(
      c.env.DB,
      `INSERT INTO user_schedule_classes (schedule_id, class_id, color, is_visible, created_at)
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [scheduleId, classId, color]
    );
    await run(c.env.DB, TOUCH_SCHEDULE_SQL, [scheduleId]);

    return c.json(
      { id: result.meta.last_row_id, schedule_id: scheduleId, class_id: classId, color, is_visible: 1 },
      201
    );
  } catch (_error) {
    return c.json({ error: 'Erro ao adicionar turma' }, 500);
  }
});

// Remove uma turma da grade.
userSchedules.delete('/:scheduleId/classes/:classId', async (c) => {
  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));
    const classId = parseInt(c.req.param('classId'));

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      return c.json({ error: 'Plano não encontrado' }, 404);
    }

    await run(c.env.DB, 'DELETE FROM user_schedule_classes WHERE schedule_id = ? AND class_id = ?', [scheduleId, classId]);
    await run(c.env.DB, TOUCH_SCHEDULE_SQL, [scheduleId]);

    return c.json({ success: true });
  } catch (_error) {
    return c.json({ error: 'Erro ao remover turma' }, 500);
  }
});

// Atualiza a cor de uma turma na grade.
userSchedules.patch('/:scheduleId/classes/:classId/color', async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  const { color } = body as any;

  if (!color) {
    return c.json({ error: 'color é obrigatório' }, 400);
  }

  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));
    const classId = parseInt(c.req.param('classId'));

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      // Espelha o Express: o service lança 'Plano não encontrado' e o controller devolve 500 genérico.
      throw new Error('Plano não encontrado');
    }

    await run(
      c.env.DB,
      'UPDATE user_schedule_classes SET color = ? WHERE schedule_id = ? AND class_id = ?',
      [color, scheduleId, classId]
    );

    return c.json({ success: true });
  } catch (_error) {
    return c.json({ error: 'Erro ao atualizar cor da turma' }, 500);
  }
});

// ==================== CONFLITOS ====================

// Verifica conflitos ao adicionar uma turma.
userSchedules.post('/:scheduleId/check-conflicts', async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  const { classId } = body as any;

  if (!classId) {
    return c.json({ error: 'classId é obrigatório' }, 400);
  }

  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));

    const conflicts: any[] = [];

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    const fullSchedule = owned ? await getFullSchedule(c.env.DB, scheduleId) : null;

    if (fullSchedule) {
      const newClassSchedules = await getClassSchedules(c.env.DB, classId);

      if (newClassSchedules && newClassSchedules.length > 0) {
        const existingSlots: any[] = [];

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

        for (const custom of fullSchedule.customDisciplines) {
          if (!custom.is_visible) continue;
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

        for (const newSlot of newClassSchedules) {
          for (const existingSlot of existingSlots) {
            if (newSlot.dia === existingSlot.dia) {
              if (
                hasTimeOverlap(
                  newSlot.horario_inicio,
                  newSlot.horario_fim,
                  existingSlot.horario_inicio,
                  existingSlot.horario_fim
                )
              ) {
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
      }
    }

    return c.json({ hasConflicts: conflicts.length > 0, conflicts });
  } catch (_error) {
    return c.json({ error: 'Erro ao verificar conflitos' }, 500);
  }
});

// ==================== DISCIPLINAS NA LISTA (SIDEBAR) ====================

// Lista disciplinas da lista do plano.
userSchedules.get('/:scheduleId/disciplines', async (c) => {
  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      // Espelha o Express: service lança 'Plano não encontrado' -> controller devolve 500 genérico.
      throw new Error('Plano não encontrado');
    }

    return c.json(await getScheduleDisciplines(c.env.DB, scheduleId));
  } catch (_error) {
    return c.json({ error: 'Erro ao listar disciplinas' }, 500);
  }
});

// Adiciona uma disciplina à lista do plano (atualiza se já existir).
userSchedules.post('/:scheduleId/disciplines', async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  const { disciplineId, selectedClassId, isVisible, isExpanded, color } = body as any;

  if (!disciplineId) {
    return c.json({ error: 'disciplineId é obrigatório' }, 400);
  }

  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      throw new Error('Plano não encontrado');
    }

    const existingDisciplines = await getScheduleDisciplines(c.env.DB, scheduleId);
    const finalColor = color || getNextColor(existingDisciplines.length);

    // Defaults do model (addDisciplineToSchedule).
    const boundSelectedClassId = selectedClassId === undefined ? null : selectedClassId;
    const boundIsVisible = isVisible === undefined ? true : isVisible;
    const boundIsExpanded = isExpanded === undefined ? false : isExpanded;

    const existing = await first<any>(
      c.env.DB,
      'SELECT id FROM user_schedule_disciplines WHERE schedule_id = ? AND discipline_id = ?',
      [scheduleId, disciplineId]
    );

    if (existing) {
      // Já existe: atualiza e devolve o registro atualizado.
      const updates: string[] = [];
      const params: unknown[] = [];
      if (selectedClassId !== undefined) { updates.push('selected_class_id = ?'); params.push(selectedClassId); }
      if (isVisible !== undefined) { updates.push('is_visible = ?'); params.push(isVisible ? 1 : 0); }
      if (isExpanded !== undefined) { updates.push('is_expanded = ?'); params.push(isExpanded ? 1 : 0); }
      updates.push('color = ?'); params.push(finalColor);
      params.push(existing.id);

      await run(c.env.DB, `UPDATE user_schedule_disciplines SET ${updates.join(', ')} WHERE id = ?`, params);
      const updated = await first<any>(c.env.DB, 'SELECT * FROM user_schedule_disciplines WHERE id = ?', [existing.id]);
      return c.json(updated, 201);
    }

    const result = await run(
      c.env.DB,
      `INSERT INTO user_schedule_disciplines
       (schedule_id, discipline_id, selected_class_id, is_visible, is_expanded, color, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [scheduleId, disciplineId, boundSelectedClassId, boundIsVisible ? 1 : 0, boundIsExpanded ? 1 : 0, finalColor]
    );
    await run(c.env.DB, TOUCH_SCHEDULE_SQL, [scheduleId]);

    const disciplineData = await first<any>(
      c.env.DB,
      'SELECT codigo, nome, creditos_aula, creditos_trabalho FROM disciplines WHERE id = ?',
      [disciplineId]
    );

    // Espelho fiel do Express: o model faz `const lastID = await executeQuery(...)` e
    // devolve o OBJETO {lastID, changes} no campo id — mantido para não quebrar contrato.
    return c.json(
      {
        id: { lastID: result.meta.last_row_id, changes: result.meta.changes },
        schedule_id: scheduleId,
        discipline_id: disciplineId,
        discipline_codigo: disciplineData?.codigo,
        discipline_nome: disciplineData?.nome,
        creditos_aula: disciplineData?.creditos_aula,
        creditos_trabalho: disciplineData?.creditos_trabalho,
        selected_class_id: boundSelectedClassId,
        is_visible: boundIsVisible ? 1 : 0,
        is_expanded: boundIsExpanded ? 1 : 0,
        color: finalColor
      },
      201
    );
  } catch (_error) {
    return c.json({ error: 'Erro ao adicionar disciplina à lista' }, 500);
  }
});

// Atualiza uma disciplina na lista do plano.
userSchedules.put('/:scheduleId/disciplines/:disciplineId', async (c) => {
  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));
    const disciplineId = parseInt(c.req.param('disciplineId'));
    const body = await c.req.json().catch(() => ({} as any));
    const { selectedClassId, isVisible, isExpanded, color } = body as any;

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      throw new Error('Plano não encontrado');
    }

    const disciplines = await getScheduleDisciplines(c.env.DB, scheduleId);
    const discipline = disciplines.find((d) => d.discipline_id === disciplineId);
    if (!discipline) {
      throw new Error('Disciplina não encontrada no plano');
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    if (selectedClassId !== undefined) { updates.push('selected_class_id = ?'); params.push(selectedClassId); }
    if (isVisible !== undefined) { updates.push('is_visible = ?'); params.push(isVisible ? 1 : 0); }
    if (isExpanded !== undefined) { updates.push('is_expanded = ?'); params.push(isExpanded ? 1 : 0); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }

    if (updates.length > 0) {
      params.push(discipline.id);
      await run(c.env.DB, `UPDATE user_schedule_disciplines SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return c.json({ success: true });
  } catch (_error) {
    return c.json({ error: 'Erro ao atualizar disciplina na lista' }, 500);
  }
});

// Remove uma disciplina da lista do plano.
userSchedules.delete('/:scheduleId/disciplines/:disciplineId', async (c) => {
  try {
    const userId = c.get('user').id;
    const scheduleId = parseInt(c.req.param('scheduleId'));
    const disciplineId = parseInt(c.req.param('disciplineId'));

    const owned = await getScheduleOwned(c.env.DB, scheduleId, userId);
    if (!owned) {
      throw new Error('Plano não encontrado');
    }

    await run(
      c.env.DB,
      'DELETE FROM user_schedule_disciplines WHERE schedule_id = ? AND discipline_id = ?',
      [scheduleId, disciplineId]
    );
    await run(c.env.DB, TOUCH_SCHEDULE_SQL, [scheduleId]);

    return c.json({ success: true });
  } catch (_error) {
    return c.json({ error: 'Erro ao remover disciplina da lista' }, 500);
  }
});

export default userSchedules;
