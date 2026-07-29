/**
 * Implementação compartilhada das famílias /api/disciplines, /api/evaluations e
 * /api/academic/disciplines. No Express as três famílias delegam para o mesmo
 * AcademicDisciplinesController (backend/src/controllers/academic/disciplines/),
 * então aqui os handlers vivem num módulo único e os arquivos de rota apenas os montam.
 * Contrato espelhado de: handlers (disciplines/catalog/evaluations) + AcademicDisciplinesService
 * + AcademicDisciplinesModel (SQL real em models/academic/disciplines/modules/).
 * Rotas de scraping/importação (saveDiscipline, clearAllData) NÃO existem como HTTP no Express
 * e não foram portadas.
 */
import type { Context } from 'hono';
import { verify } from 'hono/jwt';
import { all, batch, first, run } from '../db';
import { secretOf, type JwtUser } from '../auth';
import type { Env } from '../index';

type Ctx = Context<{ Bindings: Env; Variables: { user: JwtUser } }>;

/** Params de rota sempre existem nas rotas que os declaram; o Context genérico não sabe disso. */
const paramOf = (c: Ctx, name: string): string => c.req.param(name) as string;

/* ------------------------------------------------------------------ */
/* Helpers de modelo (SQL espelhado dos módulos do model)              */
/* ------------------------------------------------------------------ */

async function findDisciplineByCodigo(db: D1Database, codigo: string) {
  return first<Record<string, unknown>>(db, 'SELECT * FROM disciplines WHERE codigo = ?', [codigo]);
}

type DisciplineFilters = {
  campus?: string | null;
  unidade?: string | null;
  searchTerm?: string | null;
  hasValidClasses?: boolean | null;
  isPostgrad?: boolean | null;
};

function buildDisciplineConditions(filters: DisciplineFilters) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.campus) {
    conditions.push('campus = ?');
    params.push(filters.campus);
  }
  if (filters.unidade) {
    conditions.push('unidade = ?');
    params.push(filters.unidade);
  }
  if (filters.searchTerm) {
    conditions.push('(codigo LIKE ? COLLATE NOCASE OR nome LIKE ? COLLATE NOCASE)');
    params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
  }
  if (filters.hasValidClasses !== undefined && filters.hasValidClasses !== null) {
    conditions.push('has_valid_classes = ?');
    params.push(filters.hasValidClasses ? 1 : 0);
  }
  if (filters.isPostgrad !== undefined && filters.isPostgrad !== null) {
    conditions.push('is_postgrad = ?');
    params.push(filters.isPostgrad ? 1 : 0);
  }

  return { where: conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '', params };
}

async function queryDisciplines(
  db: D1Database,
  filters: DisciplineFilters & { limit?: number | null; offset?: number | null } = {}
) {
  const { where, params } = buildDisciplineConditions(filters);
  let sql = `SELECT * FROM disciplines${where} ORDER BY codigo ASC`;

  // Mesma semântica do model: LIMIT só quando truthy; OFFSET só junto com LIMIT.
  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }
  }

  return all<Record<string, unknown>>(db, sql, params);
}

async function queryCountDisciplines(db: D1Database, filters: DisciplineFilters = {}) {
  const { where, params } = buildDisciplineConditions(filters);
  const row = await first<{ total: number }>(db, `SELECT COUNT(*) as total FROM disciplines${where}`, params);
  return row?.total || 0;
}

async function queryCampi(db: D1Database): Promise<unknown[]> {
  const rows = await all<{ campus: unknown }>(
    db,
    'SELECT DISTINCT campus FROM disciplines WHERE campus IS NOT NULL ORDER BY campus'
  );
  return rows.map((item) => item.campus);
}

async function queryUnidades(db: D1Database, campus: string | null = null): Promise<unknown[]> {
  let sql = 'SELECT DISTINCT unidade FROM disciplines WHERE unidade IS NOT NULL';
  const params: unknown[] = [];
  if (campus) {
    sql += ' AND campus = ?';
    params.push(campus);
  }
  sql += ' ORDER BY unidade';
  const rows = await all<{ unidade: unknown }>(db, sql, params);
  return rows.map((item) => item.unidade);
}

/** IN (...) em blocos de 90 ids para respeitar o limite de parâmetros do D1. */
async function allByClassIds(db: D1Database, sqlOf: (placeholders: string) => string, ids: unknown[]) {
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < ids.length; i += 90) {
    const chunk = ids.slice(i, i + 90);
    const placeholders = chunk.map(() => '?').join(',');
    out.push(...(await all<Record<string, unknown>>(db, sqlOf(placeholders), chunk)));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Validações (espelho de validationsService.js)                       */
/* ------------------------------------------------------------------ */

function validateRating(rating: unknown): boolean {
  if (rating === null || rating === undefined) return true;
  const parsed = parseFloat(rating as string);
  if (Number.isNaN(parsed)) return false;
  if (parsed < 0.5 || parsed > 5.0) return false;
  return (parsed * 2) % 1 === 0;
}

const RATING_KEYS = [
  'ratingGeral',
  'ratingDificuldade',
  'ratingCargaTrabalho',
  'ratingProfessores',
  'ratingClareza',
  'ratingUtilidade',
  'ratingOrganizacao'
] as const;

function validateEvaluationPayload(payload: Record<string, unknown> = {}): { ok: boolean; error?: string } {
  const hasRating = RATING_KEYS.some((key) => payload[key] !== null && payload[key] !== undefined);
  const hasComment = Boolean(payload.comentario && String(payload.comentario).trim().length > 0);

  if (!hasRating && !hasComment) {
    return { ok: false, error: 'Forneça pelo menos um rating ou um comentário' };
  }

  for (const key of RATING_KEYS) {
    if (!validateRating(payload[key])) {
      return { ok: false, error: `Rating ${key} deve ser entre 0.5 e 5.0, em incrementos de 0.5` };
    }
  }

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Handlers de disciplinas                                             */
/* ------------------------------------------------------------------ */

export async function createDiscipline(c: Ctx) {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  try {
    const {
      codigo,
      nome,
      unidade,
      campus,
      creditos_aula,
      creditos_trabalho,
      is_postgrad,
      ementa,
      objetivos,
      conteudo_programatico
    } = body;

    if (!codigo || !codigo.trim()) {
      return c.json({ error: 'O código da disciplina é obrigatório' }, 400);
    }
    if (!nome || !nome.trim()) {
      return c.json({ error: 'O nome da disciplina é obrigatório' }, 400);
    }

    const normalizedCode = codigo.trim().toUpperCase();
    const existing = await findDisciplineByCodigo(c.env.DB, normalizedCode);
    if (existing) {
      return c.json({ error: 'Disciplina já existe', codigo: normalizedCode, nome: existing.nome }, 409);
    }

    // Espelho de model.upsertDiscipline + releitura (createManualDiscipline).
    await run(
      c.env.DB,
      `
        INSERT INTO disciplines (
            codigo, nome, unidade, campus,
            creditos_aula, creditos_trabalho,
            has_valid_classes, is_postgrad, ementa, objetivos, conteudo_programatico, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(codigo) DO UPDATE SET
            nome = excluded.nome,
            unidade = excluded.unidade,
            campus = excluded.campus,
            creditos_aula = excluded.creditos_aula,
            creditos_trabalho = excluded.creditos_trabalho,
            has_valid_classes = excluded.has_valid_classes,
            is_postgrad = excluded.is_postgrad,
            ementa = excluded.ementa,
            objetivos = excluded.objetivos,
            conteudo_programatico = excluded.conteudo_programatico,
            updated_at = CURRENT_TIMESTAMP
      `,
      [
        normalizedCode,
        nome.trim(),
        unidade?.trim() || null,
        campus?.trim() || null,
        parseInt(creditos_aula, 10) || 0,
        parseInt(creditos_trabalho, 10) || 0,
        0, // has_valid_classes: false na criação manual
        is_postgrad ? 1 : 0,
        ementa?.trim() || null,
        objetivos?.trim() || null,
        conteudo_programatico?.trim() || null
      ]
    );

    const created = await findDisciplineByCodigo(c.env.DB, normalizedCode);
    return c.json(created, 201);
  } catch (_error) {
    return c.json({ error: 'Erro ao criar disciplina' }, 500);
  }
}

export async function getDisciplines(c: Ctx) {
  try {
    const { campus, unidade, search, limit, offset } = c.req.query();
    const rows = await queryDisciplines(c.env.DB, {
      campus: campus || null,
      unidade: unidade || null,
      searchTerm: search || null,
      limit: limit ? parseInt(limit, 10) : null,
      offset: offset ? parseInt(offset, 10) : null
    });
    return c.json(rows);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar disciplinas' }, 500);
  }
}

export async function getDisciplineByCodigo(c: Ctx) {
  try {
    const row = await findDisciplineByCodigo(c.env.DB, paramOf(c, 'codigo'));
    if (!row) {
      return c.json({ error: 'Disciplina não encontrada' }, 404);
    }
    return c.json(row);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar disciplina' }, 500);
  }
}

export async function getFullDiscipline(c: Ctx) {
  try {
    const discipline = (await findDisciplineByCodigo(c.env.DB, paramOf(c, 'codigo'))) as
      | Record<string, any>
      | null;
    if (!discipline) {
      return c.json({ error: 'Disciplina não encontrada' }, 404);
    }

    const allClasses = (await all(
      c.env.DB,
      'SELECT * FROM discipline_classes WHERE discipline_id = ? ORDER BY codigo_turma',
      [discipline.id]
    )) as Record<string, any>[];

    if (allClasses.length) {
      const ids = allClasses.map((cls) => cls.id);
      const schedules = await allByClassIds(
        c.env.DB,
        (ph) => `SELECT * FROM class_schedules WHERE class_id IN (${ph}) ORDER BY dia, horario_inicio`,
        ids
      );
      const professors = await allByClassIds(
        c.env.DB,
        (ph) => `SELECT * FROM class_professors WHERE class_id IN (${ph}) ORDER BY nome`,
        ids
      );
      for (const cls of allClasses) {
        cls.schedules = schedules.filter((s) => s.class_id === cls.id);
        cls.professors = professors.filter((p) => p.class_id === cls.id);
      }
    }

    // Agrupamento teórica/prática espelhado de disciplinesWorkflowModel.getFullDiscipline.
    const teoricas = allClasses.filter((cls) => !cls.codigo_turma_teorica);
    const praticas = allClasses.filter((cls) => cls.codigo_turma_teorica);

    const grouped = teoricas.map((teorica) => {
      const linkedPractices = praticas.filter(
        (pratica) => pratica.codigo_turma_teorica === teorica.codigo_turma
      );

      if (!linkedPractices.length) {
        return teorica;
      }

      const mergedSchedules = [...teorica.schedules];
      const mergedProfessors = [...teorica.professors];

      linkedPractices.forEach((pratica) => {
        mergedSchedules.push(...pratica.schedules);
        mergedProfessors.push(...pratica.professors);
      });

      return {
        ...teorica,
        schedules: mergedSchedules,
        professors: mergedProfessors,
        has_pratica: true,
        praticas_vinculadas: linkedPractices.map((item) => item.codigo_turma)
      };
    });

    discipline.turmas = grouped;
    return c.json(discipline);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar disciplina' }, 500);
  }
}

export async function getCampi(c: Ctx) {
  try {
    return c.json(await queryCampi(c.env.DB));
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar campi' }, 500);
  }
}

export async function getUnidades(c: Ctx) {
  try {
    const campus = c.req.query('campus');
    return c.json(await queryUnidades(c.env.DB, campus || null));
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar unidades' }, 500);
  }
}

/* ------------------------------------------------------------------ */
/* Handlers de catálogo (search/stats/count/check-exact)               */
/* ------------------------------------------------------------------ */

export async function searchDisciplines(c: Ctx) {
  try {
    const q = c.req.query('q');
    const limit = c.req.query('limit');
    if (!q || q.length < 2) {
      return c.json([]);
    }

    const rows = await queryDisciplines(c.env.DB, {
      searchTerm: q,
      limit: limit ? parseInt(limit, 10) : 10
    });
    return c.json(
      rows.map((row) => ({
        codigo: row.codigo,
        nome: row.nome,
        unidade: row.unidade,
        campus: row.campus
      }))
    );
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar disciplinas' }, 500);
  }
}

export async function getStats(c: Ctx) {
  try {
    const [total, campi, unidades] = await Promise.all([
      queryCountDisciplines(c.env.DB),
      queryCampi(c.env.DB),
      queryUnidades(c.env.DB)
    ]);

    return c.json({
      total_disciplinas: total,
      total_campi: campi.length,
      total_unidades: unidades.length,
      campi,
      unidades_count: unidades.length
    });
  } catch (_error) {
    return c.json({ error: 'Erro ao obter estatísticas' }, 500);
  }
}

export async function countDisciplines(c: Ctx) {
  try {
    const { campus, unidade, search, hasValidClasses, isPostgrad } = c.req.query();
    const total = await queryCountDisciplines(c.env.DB, {
      campus: campus || null,
      unidade: unidade || null,
      searchTerm: search || null,
      hasValidClasses: hasValidClasses === 'true' ? true : null,
      isPostgrad: isPostgrad === 'true' ? true : null
    });
    return c.json({ total });
  } catch (_error) {
    return c.json({ error: 'Erro ao contar disciplinas' }, 500);
  }
}

export async function checkExactMatch(c: Ctx) {
  try {
    const row = await findDisciplineByCodigo(c.env.DB, paramOf(c, 'codigo').toUpperCase());
    if (!row) {
      return c.json({ exists: false });
    }
    return c.json({ exists: true, codigo: row.codigo });
  } catch (_error) {
    return c.json({ error: 'Erro ao verificar disciplina' }, 500);
  }
}

/* ------------------------------------------------------------------ */
/* Handlers de avaliações                                              */
/* ------------------------------------------------------------------ */

export async function createEvaluation(c: Ctx, codigoFromParam = false) {
  try {
    const userId = c.get('user').id;
    const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
    if (codigoFromParam) {
      // Rota v2 injeta o código do path no body, igual ao Express.
      body.disciplineCodigo = paramOf(c, 'codigo');
    }

    const validation = validateEvaluationPayload(body);
    if (!validation.ok) {
      return c.json({ error: validation.error }, 400);
    }

    if (!body.disciplineCodigo) {
      return c.json({ error: 'Código da disciplina é obrigatório' }, 400);
    }

    const discipline = await findDisciplineByCodigo(c.env.DB, body.disciplineCodigo);
    if (!discipline) {
      return c.json({ error: 'Disciplina não encontrada' }, 404);
    }

    try {
      const result = await run(
        c.env.DB,
        `
          INSERT INTO discipline_evaluations (
              discipline_id, user_id, turma_codigo, semestre,
              rating_geral, rating_dificuldade, rating_carga_trabalho,
              rating_professores, rating_clareza, rating_utilidade, rating_organizacao,
              comentario, is_anonymous
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          discipline.id,
          userId,
          body.turmaCodigo ?? null,
          body.semestre ?? null,
          body.ratingGeral || null,
          body.ratingDificuldade || null,
          body.ratingCargaTrabalho || null,
          body.ratingProfessores || null,
          body.ratingClareza || null,
          body.ratingUtilidade || null,
          body.ratingOrganizacao || null,
          body.comentario?.trim() || null,
          body.isAnonymous ? 1 : 0
        ]
      );
      return c.json({ id: result.meta.last_row_id }, 201);
    } catch (error) {
      if ((error as Error).message.includes('UNIQUE constraint failed')) {
        return c.json({ error: 'Você já avaliou esta disciplina. Use a opção de editar.' }, 409);
      }
      throw error;
    }
  } catch (_error) {
    return c.json({ error: 'Erro ao criar avaliação' }, 500);
  }
}

export async function updateEvaluation(c: Ctx) {
  try {
    const userId = c.get('user').id;
    const evaluationId = parseInt(paramOf(c, 'id'), 10);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;

    const validation = validateEvaluationPayload(body);
    if (!validation.ok) {
      return c.json({ error: validation.error }, 400);
    }

    const result = await run(
      c.env.DB,
      `
        UPDATE discipline_evaluations SET
            turma_codigo = COALESCE(?, turma_codigo),
            semestre = COALESCE(?, semestre),
            rating_geral = ?,
            rating_dificuldade = ?,
            rating_carga_trabalho = ?,
            rating_professores = ?,
            rating_clareza = ?,
            rating_utilidade = ?,
            rating_organizacao = ?,
            comentario = ?,
            is_anonymous = COALESCE(?, is_anonymous),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `,
      [
        body.turmaCodigo ?? null,
        body.semestre ?? null,
        // No Express, campos ausentes viram NULL na bind (sqlite3); `|| null` reproduz isso.
        body.ratingGeral || null,
        body.ratingDificuldade || null,
        body.ratingCargaTrabalho || null,
        body.ratingProfessores || null,
        body.ratingClareza || null,
        body.ratingUtilidade || null,
        body.ratingOrganizacao || null,
        body.comentario?.trim() || null,
        body.isAnonymous !== undefined ? (body.isAnonymous ? 1 : 0) : null,
        evaluationId,
        userId
      ]
    );

    if (result.meta.changes === 0) {
      return c.json({ error: 'Avaliação não encontrada ou você não tem permissão para editá-la' }, 404);
    }
    return c.json({ id: evaluationId, updated: true }, 200);
  } catch (_error) {
    return c.json({ error: 'Erro ao atualizar avaliação' }, 500);
  }
}

export async function deleteEvaluation(c: Ctx) {
  try {
    const userId = c.get('user').id;
    const evaluationId = parseInt(paramOf(c, 'id'), 10);

    const result = await run(c.env.DB, 'DELETE FROM discipline_evaluations WHERE id = ? AND user_id = ?', [
      evaluationId,
      userId
    ]);

    if (result.meta.changes === 0) {
      return c.json({ error: 'Avaliação não encontrada ou você não tem permissão para excluí-la' }, 404);
    }
    return c.json({ message: 'Avaliação excluída com sucesso' }, 200);
  } catch (_error) {
    return c.json({ error: 'Erro ao deletar avaliação' }, 500);
  }
}

export async function getEvaluationsByDiscipline(c: Ctx) {
  // optionalAuth: token inválido/ausente não bloqueia, só zera o usuário atual.
  let currentUserId: number | null = null;
  const authHeader = c.req.header('authorization');
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const payload = await verify(token, secretOf(c.env), 'HS256');
        currentUserId = ((payload as { id?: number }).id as number) || null;
      } catch (_error) {
        // Sem hard-fail, igual ao Express.
      }
    }
  }

  try {
    const rows = await all(
      c.env.DB,
      `
        SELECT
            e.id,
            e.discipline_id,
            e.user_id,
            e.turma_codigo,
            e.semestre,
            e.rating_geral,
            e.rating_dificuldade,
            e.rating_carga_trabalho,
            e.rating_professores,
            e.rating_clareza,
            e.rating_utilidade,
            e.rating_organizacao,
            e.comentario,
            e.is_anonymous,
            e.helpful_count,
            e.created_at,
            e.updated_at,
            CASE WHEN e.is_anonymous = 1 THEN 'Anônimo' ELSE u.name END as user_name,
            CASE WHEN e.user_id = ? THEN 1 ELSE 0 END as is_own_evaluation,
            (SELECT COUNT(*) FROM evaluation_votes v WHERE v.evaluation_id = e.id AND v.user_id = ?) as user_has_voted
        FROM discipline_evaluations e
        INNER JOIN disciplines d ON e.discipline_id = d.id
        INNER JOIN users u ON e.user_id = u.id
        WHERE d.codigo = ?
        ORDER BY e.helpful_count DESC, e.created_at DESC
      `,
      [currentUserId, currentUserId, paramOf(c, 'codigo')]
    );
    return c.json(rows);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar avaliações' }, 500);
  }
}

export async function getAggregatedRatings(c: Ctx) {
  try {
    const stats = await first(
      c.env.DB,
      `
        SELECT
            COUNT(*) as total_avaliacoes,
            ROUND(AVG(rating_geral), 1) as media_geral,
            ROUND(AVG(rating_dificuldade), 1) as media_dificuldade,
            ROUND(AVG(rating_carga_trabalho), 1) as media_carga_trabalho,
            ROUND(AVG(rating_professores), 1) as media_professores,
            ROUND(AVG(rating_clareza), 1) as media_clareza,
            ROUND(AVG(rating_utilidade), 1) as media_utilidade,
            ROUND(AVG(rating_organizacao), 1) as media_organizacao,
            COUNT(CASE WHEN comentario IS NOT NULL AND comentario != '' THEN 1 END) as total_comentarios
        FROM discipline_evaluations e
        INNER JOIN disciplines d ON e.discipline_id = d.id
        WHERE d.codigo = ?
      `,
      [paramOf(c, 'codigo')]
    );
    return c.json(stats);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar ratings' }, 500);
  }
}

export async function getUserEvaluationForDiscipline(c: Ctx) {
  try {
    const row = await first(
      c.env.DB,
      `
        SELECT e.*
        FROM discipline_evaluations e
        INNER JOIN disciplines d ON e.discipline_id = d.id
        WHERE e.user_id = ? AND d.codigo = ?
      `,
      [c.get('user').id, paramOf(c, 'codigo')]
    );
    if (!row) {
      return c.json({ error: 'Você ainda não avaliou esta disciplina' }, 404);
    }
    return c.json(row);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar sua avaliação' }, 500);
  }
}

export async function getUserEvaluations(c: Ctx) {
  try {
    const rows = await all(
      c.env.DB,
      `
        SELECT
            e.*,
            d.codigo as discipline_codigo,
            d.nome as discipline_nome
        FROM discipline_evaluations e
        INNER JOIN disciplines d ON e.discipline_id = d.id
        WHERE e.user_id = ?
        ORDER BY e.updated_at DESC
      `,
      [c.get('user').id]
    );
    return c.json(rows);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar suas avaliações' }, 500);
  }
}

export async function toggleLike(c: Ctx) {
  try {
    const userId = c.get('user').id;
    const evaluationId = parseInt(paramOf(c, 'id'), 10);

    const evaluation = await first<Record<string, unknown>>(
      c.env.DB,
      'SELECT * FROM discipline_evaluations WHERE id = ?',
      [evaluationId]
    );
    if (!evaluation) {
      return c.json({ error: 'Avaliação não encontrada' }, 404);
    }
    if (evaluation.user_id === userId) {
      return c.json({ error: 'Você não pode dar like na própria avaliação' }, 400);
    }

    const existingVote = await first(
      c.env.DB,
      'SELECT id FROM evaluation_votes WHERE evaluation_id = ? AND user_id = ?',
      [evaluationId, userId]
    );

    if (existingVote) {
      await batch(c.env.DB, [
        {
          sql: 'DELETE FROM evaluation_votes WHERE evaluation_id = ? AND user_id = ?',
          params: [evaluationId, userId]
        },
        {
          sql: 'UPDATE discipline_evaluations SET helpful_count = helpful_count - 1 WHERE id = ?',
          params: [evaluationId]
        }
      ]);
      return c.json({ liked: false }, 200);
    }

    await batch(c.env.DB, [
      {
        sql: 'INSERT INTO evaluation_votes (evaluation_id, user_id) VALUES (?, ?)',
        params: [evaluationId, userId]
      },
      {
        sql: 'UPDATE discipline_evaluations SET helpful_count = helpful_count + 1 WHERE id = ?',
        params: [evaluationId]
      }
    ]);
    return c.json({ liked: true }, 200);
  } catch (_error) {
    return c.json({ error: 'Erro ao processar like' }, 500);
  }
}
