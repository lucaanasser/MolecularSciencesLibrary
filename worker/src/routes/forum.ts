/**
 * Porte da família /api/forum (32 rotas) do Express para o Worker.
 * Fonte da verdade: ForumRoutes.js → ForumController.js → ForumService.js → ForumModel.js.
 * Contrato espelhado: mesmos paths, métodos, status codes, shapes de JSON e mensagens.
 * Notificações in-app são INSERTs diretos na tabela notifications (igual ao Express,
 * que usa NotificationsModel — sem e-mail nesta família; nada a stubar de EmailService).
 * Escritas múltiplas que precisam ser atômicas usam batch() (sem BEGIN/COMMIT no D1).
 */
import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import type { Context, Next } from 'hono';
import { all, batch, first, run } from '../db';
import { authenticateToken, secretOf, type JwtUser } from '../auth';
import type { Env } from '../index';

type Row = Record<string, any>;
type Ctx = { Bindings: Env; Variables: { user: any } };

const forum = new Hono<Ctx>();

// Espelho do optionalAuth do Express: sem token ou token inválido => req.user = null.
const optionalAuth = async (c: Context<Ctx>, next: Next) => {
  const authHeader = c.req.header('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    c.set('user', null);
    return next();
  }
  try {
    c.set('user', (await verify(token, secretOf(c.env), 'HS256')) as unknown as JwtUser);
  } catch (_error) {
    c.set('user', null);
  }
  await next();
};

const isAdminUser = (user: any) => Boolean(user && user.role === 'admin');

const readBody = (c: Context<Ctx>): Promise<Row> => c.req.json().catch(() => ({} as Row));

// =====================================================
// Helpers de "model" (porte 1:1 do ForumModel)
// =====================================================

async function getQuestionTags(db: D1Database, questionId: number): Promise<string[]> {
  try {
    const tags = await all<Row>(
      db,
      `SELECT t.* FROM forum_tags t
       JOIN forum_question_tags qt ON t.id = qt.tag_id
       WHERE qt.question_id = ?`,
      [questionId]
    );
    return tags.map((t) => t.nome);
  } catch (_error) {
    return [];
  }
}

async function getQuestionById(db: D1Database, id: number): Promise<Row | null> {
  const question = await first<Row>(
    db,
    `SELECT
        q.*,
        u.name as autor_nome,
        u.profile_image as autor_imagem,
        d.nome as disciplina_nome,
        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) as tem_resposta_aceita
     FROM forum_questions q
     JOIN users u ON q.autor_id = u.id
     LEFT JOIN disciplines d ON q.disciplina_codigo = d.codigo
     WHERE q.id = ?`,
    [id]
  );
  if (question) question.tags = await getQuestionTags(db, id);
  return question;
}

async function getAnswerById(db: D1Database, id: number): Promise<Row | null> {
  return first<Row>(
    db,
    `SELECT a.*, u.name as autor_nome, u.profile_image as autor_imagem
     FROM forum_answers a
     JOIN users u ON a.autor_id = u.id
     WHERE a.id = ?`,
    [id]
  );
}

async function getAnswersByQuestion(db: D1Database, questionId: number): Promise<Row[]> {
  // sortBy padrão 'votos' do Express (único usado pelas rotas)
  return all<Row>(
    db,
    `SELECT a.*, u.name as autor_nome, u.profile_image as autor_imagem, a.is_anonymous
     FROM forum_answers a
     JOIN users u ON a.autor_id = u.id
     WHERE a.question_id = ?
     ORDER BY a.is_accepted DESC, a.votos DESC, a.created_at ASC`,
    [questionId]
  );
}

async function getUserVote(db: D1Database, userId: number, votableType: string, votableId: number): Promise<number> {
  try {
    const vote = await first<Row>(
      db,
      'SELECT vote_type FROM forum_votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
      [userId, votableType, votableId]
    );
    return vote ? vote.vote_type : 0;
  } catch (_error) {
    return 0;
  }
}

async function getUserVotes(
  db: D1Database,
  userId: number,
  votableType: string,
  votableIds: number[]
): Promise<Record<number, number>> {
  if (!votableIds || votableIds.length === 0) return {};
  try {
    const placeholders = votableIds.map(() => '?').join(',');
    const votes = await all<Row>(
      db,
      `SELECT votable_id, vote_type FROM forum_votes
       WHERE user_id = ? AND votable_type = ? AND votable_id IN (${placeholders})`,
      [userId, votableType, ...votableIds]
    );
    const voteMap: Record<number, number> = {};
    votes.forEach((v) => {
      voteMap[v.votable_id] = v.vote_type;
    });
    return voteMap;
  } catch (_error) {
    return {};
  }
}

async function isSubscribed(db: D1Database, userId: number, questionId: number): Promise<boolean> {
  const row = await first<Row>(db, 'SELECT 1 FROM forum_subscriptions WHERE user_id = ? AND question_id = ?', [
    userId,
    questionId
  ]);
  return !!row;
}

async function isBookmarked(db: D1Database, userId: number, questionId: number): Promise<boolean> {
  const row = await first<Row>(db, 'SELECT 1 FROM forum_bookmarks WHERE user_id = ? AND question_id = ?', [
    userId,
    questionId
  ]);
  return !!row;
}

async function subscribe(db: D1Database, userId: number, questionId: number) {
  await run(db, 'INSERT OR IGNORE INTO forum_subscriptions (user_id, question_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)', [
    userId,
    questionId
  ]);
}

async function getOrCreateTag(db: D1Database, nome: string): Promise<Row> {
  // Defaults do ForumModel.getOrCreateTag: topico 'geral', descricao null, userId null => approved 1.
  const normalizedName = nome.toLowerCase().trim();
  let tag = await first<Row>(db, 'SELECT * FROM forum_tags WHERE nome = ?', [normalizedName]);
  if (!tag) {
    const result = await run(
      db,
      'INSERT INTO forum_tags (nome, topico, descricao, created_by_user, approved, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [normalizedName, 'geral', null, null, 1]
    );
    tag = { id: result.meta.last_row_id, nome: normalizedName, topico: 'geral', descricao: null, created_by_user: null, approved: 1 };
  }
  return tag;
}

async function addTagsToQuestion(db: D1Database, questionId: number, tagNames: string[]) {
  for (const tagName of tagNames) {
    const tag = await getOrCreateTag(db, tagName);
    await run(db, 'INSERT OR IGNORE INTO forum_question_tags (question_id, tag_id) VALUES (?, ?)', [questionId, tag.id]);
  }
}

async function updateQuestionFields(db: D1Database, id: number, fields: Row) {
  // Atualização parcial: só altera colunas efetivamente informadas (espelho do ForumModel.updateQuestion).
  const allowedColumns = ['titulo', 'conteudo', 'is_closed', 'is_pinned', 'disciplina_codigo'];
  const setClauses: string[] = [];
  const params: unknown[] = [];

  for (const column of allowedColumns) {
    if (fields[column] !== undefined) {
      setClauses.push(`${column} = ?`);
      params.push(fields[column]);
    }
  }

  if (setClauses.length > 0) {
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    await run(db, `UPDATE forum_questions SET ${setClauses.join(', ')} WHERE id = ?`, params);
  }

  if (fields.tags !== undefined) {
    await run(db, 'DELETE FROM forum_question_tags WHERE question_id = ?', [id]);
    if (fields.tags.length > 0) {
      await addTagsToQuestion(db, id, fields.tags);
    }
  }
}

/**
 * Registra/alterna/atualiza voto e ajusta o contador — escritas atômicas via batch().
 * Retorna o voteDiff (mesma semântica do ForumModel.vote).
 */
async function registerVote(
  db: D1Database,
  userId: number,
  votableType: 'question' | 'answer',
  votableId: number,
  voteType: number
): Promise<number> {
  const existingVote = await first<Row>(
    db,
    'SELECT * FROM forum_votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
    [userId, votableType, votableId]
  );

  let voteDiff = 0;
  const statements: { sql: string; params?: unknown[] }[] = [];

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Mesmo voto - remover (toggle)
      statements.push({ sql: 'DELETE FROM forum_votes WHERE id = ?', params: [existingVote.id] });
      voteDiff = -voteType;
    } else {
      // Voto diferente - atualizar
      statements.push({ sql: 'UPDATE forum_votes SET vote_type = ? WHERE id = ?', params: [voteType, existingVote.id] });
      voteDiff = voteType * 2;
    }
  } else {
    statements.push({
      sql: 'INSERT INTO forum_votes (user_id, votable_type, votable_id, vote_type, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      params: [userId, votableType, votableId, voteType]
    });
    voteDiff = voteType;
  }

  const table = votableType === 'question' ? 'forum_questions' : 'forum_answers';
  statements.push({ sql: `UPDATE ${table} SET votos = votos + ? WHERE id = ?`, params: [voteDiff, votableId] });

  await batch(db, statements);
  return voteDiff;
}

// Notificação in-app (mesmo INSERT do NotificationsModel.createNotification).
const notificationStmt = (user_id: number, type: string, message: string, metadata: Row | null) => ({
  sql: `INSERT INTO notifications (user_id, type, message, metadata, loan_id, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
  params: [user_id, type, message, metadata ? JSON.stringify(metadata) : null, null, 'unread']
});

/** Notifica seguidores da pergunta sobre nova resposta (falha não derruba a operação principal). */
async function notifyNewAnswer(db: D1Database, questionAutorId: number, questionId: number, answerAutorId: number) {
  try {
    const question = await first<Row>(
      db,
      'SELECT q.titulo FROM forum_questions q JOIN users u ON q.autor_id = u.id WHERE q.id = ?',
      [questionId]
    );
    const answerAutor = await first<Row>(db, 'SELECT name FROM users WHERE id = ?', [answerAutorId]);
    if (!question || !answerAutor) return;

    const truncatedTitle = question.titulo.length > 50 ? question.titulo.substring(0, 50) + '...' : question.titulo;

    const rows = await all<Row>(db, 'SELECT user_id FROM forum_subscriptions WHERE question_id = ?', [questionId]);
    const recipients = new Set<number>([questionAutorId, ...rows.map((r) => r.user_id)]);
    recipients.delete(answerAutorId);
    if (recipients.size === 0) return;

    await batch(
      db,
      [...recipients].map((userId) =>
        notificationStmt(userId, 'forum_answer', `${answerAutor.name} respondeu a pergunta: "${truncatedTitle}"`, {
          questionId,
          answerAutorId,
          answerAutorName: answerAutor.name
        })
      )
    );
  } catch (error) {
    console.error('🔴 [forum-worker] Erro ao criar notificação de nova resposta:', (error as Error).message);
  }
}

/** Notifica o autor da resposta aceita (falha não derruba a operação principal). */
async function notifyAnswerAccepted(db: D1Database, answerAutorId: number, questionId: number, answerId: number) {
  try {
    const question = await first<Row>(db, 'SELECT titulo, autor_id FROM forum_questions WHERE id = ?', [questionId]);
    if (!question) return;
    const truncatedTitle = question.titulo.length > 50 ? question.titulo.substring(0, 50) + '...' : question.titulo;
    const stmt = notificationStmt(answerAutorId, 'forum_accepted', `Sua resposta foi aceita em: "${truncatedTitle}"`, {
      questionId,
      answerId,
      questionAutorId: question.autor_id
    });
    await run(db, stmt.sql, stmt.params);
  } catch (error) {
    console.error('🔴 [forum-worker] Erro ao criar notificação de resposta aceita:', (error as Error).message);
  }
}

/** Formata uma linha de pergunta para listagens (espelho do ForumController.formatQuestionRow). */
function formatQuestionRow(q: Row, userVotes: Record<number, number> = {}, isAdmin = false) {
  return {
    id: q.id,
    title: q.titulo,
    content: q.conteudo,
    user_id: q.autor_id,
    user_name: q.is_anonymous && !isAdmin ? 'Anônimo' : q.autor_nome,
    user_image: q.is_anonymous && !isAdmin ? null : q.autor_imagem,
    is_anonymous: q.is_anonymous,
    view_count: q.views,
    answer_count: q.respostas_count,
    vote_count: q.votos,
    tags: q.tags,
    has_accepted_answer: q.tem_resposta_aceita === 1 || q.tem_resposta_aceita === true,
    is_closed: q.is_closed === 1,
    is_pinned: q.is_pinned === 1,
    disciplina_codigo: q.disciplina_codigo || null,
    disciplina_nome: q.disciplina_nome || null,
    created_at: q.created_at,
    user_vote: userVotes[q.id] || 0
  };
}

const LIST_SELECT_BASE = `
    SELECT
        q.*,
        u.name as autor_nome,
        u.profile_image as autor_imagem,
        q.is_anonymous,
        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
    FROM forum_questions q
    JOIN users u ON q.autor_id = u.id
`;

const LIST_SELECT_BY_TAG_ID = `
    SELECT
        q.*,
        u.name as autor_nome,
        u.profile_image as autor_imagem,
        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
    FROM forum_questions q
    JOIN users u ON q.autor_id = u.id
    JOIN forum_question_tags qt ON q.id = qt.question_id
    WHERE qt.tag_id = ?
`;

const LIST_SELECT_BY_TAG_NAME = `
    SELECT
        q.*,
        u.name as autor_nome,
        u.profile_image as autor_imagem,
        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
    FROM forum_questions q
    JOIN users u ON q.autor_id = u.id
    JOIN forum_question_tags qt ON q.id = qt.question_id
    JOIN forum_tags t ON qt.tag_id = t.id
    WHERE t.nome = ?
`;

type QuestionFilters = {
  sortBy: string;
  search: string;
  tagId: number | null;
  tagName: string | null;
  disciplina: string | null;
  autorId: number | null;
};

function appendFilters(query: string, params: unknown[], f: QuestionFilters): string {
  const { search, tagId, tagName, disciplina, autorId, sortBy } = f;

  if (search && search.trim()) {
    const searchCondition = tagId || tagName ? 'AND' : 'WHERE';
    query += ` ${searchCondition} (q.titulo LIKE ? OR q.conteudo LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (disciplina) {
    const discCondition = tagId || tagName || search ? 'AND' : 'WHERE';
    query += ` ${discCondition} q.disciplina_codigo = ?`;
    params.push(disciplina);
  }

  if (autorId) {
    const autorCondition = tagId || tagName || search || disciplina ? 'AND' : 'WHERE';
    query += ` ${autorCondition} q.autor_id = ?`;
    params.push(autorId);
  }

  if (sortBy === 'sem-resposta') {
    const noAnswerCondition = tagId || tagName || search || disciplina || autorId ? 'AND' : 'WHERE';
    query += ` ${noAnswerCondition} (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) = 0`;
  }

  return query;
}

// =====================================================
// QUESTIONS - Perguntas
// =====================================================

// Lista perguntas (público, mas com info de votos se logado)
forum.get('/questions', optionalAuth, async (c) => {
  try {
    const db = c.env.DB;
    const qp = c.req.query();
    const filters: QuestionFilters = {
      sortBy: qp.sortBy ?? 'recente',
      search: qp.search ?? '',
      tagId: qp.tagId ? Number(qp.tagId) : null,
      tagName: qp.tag || null,
      disciplina: qp.disciplina || null,
      autorId: qp.autor ? Number(qp.autor) : null
    };
    const page = Number(qp.page ?? 1);
    const limit = Number(qp.limit ?? 20);

    // Monta a query de listagem (espelho do ForumModel.getQuestions)
    let query: string;
    const params: unknown[] = [];
    if (filters.tagId) {
      query = LIST_SELECT_BY_TAG_ID;
      params.push(filters.tagId);
    } else if (filters.tagName) {
      query = LIST_SELECT_BY_TAG_NAME;
      params.push(filters.tagName);
    } else {
      query = LIST_SELECT_BASE;
    }
    query = appendFilters(query, params, filters);

    switch (filters.sortBy) {
      case 'votos':
        query += ' ORDER BY q.is_pinned DESC, q.votos DESC, q.created_at DESC';
        break;
      case 'atividade':
        query += ' ORDER BY q.is_pinned DESC, q.updated_at DESC, q.created_at DESC';
        break;
      case 'views':
        query += ' ORDER BY q.is_pinned DESC, q.views DESC, q.created_at DESC';
        break;
      case 'sem-resposta':
      case 'recente':
      default:
        query += ' ORDER BY q.is_pinned DESC, q.created_at DESC';
        break;
    }

    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const questions = await all<Row>(db, query, params);

    for (const question of questions) {
      question.tags = await getQuestionTags(db, question.id);
      if (question.disciplina_codigo) {
        const disc = await first<Row>(db, 'SELECT nome FROM disciplines WHERE codigo = ?', [question.disciplina_codigo]);
        question.disciplina_nome = disc ? disc.nome : null;
      }
    }

    // Contagem (espelho do ForumModel.countQuestions)
    let countQuery = 'SELECT COUNT(*) as total FROM forum_questions q';
    const countParams: unknown[] = [];
    if (filters.tagId) {
      countQuery += ' JOIN forum_question_tags qt ON q.id = qt.question_id WHERE qt.tag_id = ?';
      countParams.push(filters.tagId);
    } else if (filters.tagName) {
      countQuery += ' JOIN forum_question_tags qt ON q.id = qt.question_id JOIN forum_tags t ON qt.tag_id = t.id WHERE t.nome = ?';
      countParams.push(filters.tagName);
    }
    countQuery = appendFilters(countQuery, countParams, filters);
    const countRow = await first<Row>(db, countQuery, countParams);
    const total = countRow?.total ?? 0;

    const user = c.get('user');
    let userVotes: Record<number, number> = {};
    if (user) {
      userVotes = await getUserVotes(db, user.id, 'question', questions.map((q) => q.id));
    }
    const isAdmin = isAdminUser(user);

    return c.json({
      questions: questions.map((q) => formatQuestionRow(q, userVotes, isAdmin)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return c.json({ error: 'Erro ao buscar perguntas', details: (error as Error).message }, 500);
  }
});

// Detalhes de uma pergunta (público, mas com info de votos se logado)
forum.get('/questions/:id', optionalAuth, async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    const question = await getQuestionById(db, id);
    if (!question) {
      return c.json({ error: 'Pergunta não encontrada' }, 404);
    }

    await run(db, 'UPDATE forum_questions SET views = views + 1 WHERE id = ?', [id]);

    const answers = await getAnswersByQuestion(db, id);

    let userQuestionVote = 0;
    let userAnswerVotes: Record<number, number> = {};
    if (user) {
      userQuestionVote = await getUserVote(db, user.id, 'question', id);
      userAnswerVotes = await getUserVotes(db, user.id, 'answer', answers.map((a) => a.id));
    }

    const isAdmin = isAdminUser(user);

    const allComments = await all<Row>(
      db,
      `SELECT c.*, u.name as autor_nome
       FROM forum_comments c
       JOIN users u ON c.autor_id = u.id
       WHERE (c.target_type = 'question' AND c.target_id = ?)
          OR (c.target_type = 'answer' AND c.target_id IN (SELECT id FROM forum_answers WHERE question_id = ?))
       ORDER BY c.created_at ASC`,
      [id, id]
    );
    const formatComment = (cm: Row) => ({
      id: cm.id,
      content: cm.conteudo,
      user_id: cm.autor_id,
      user_name: cm.autor_nome,
      created_at: cm.created_at
    });
    const questionComments = allComments
      .filter((cm) => cm.target_type === 'question' && cm.target_id === id)
      .map(formatComment);
    const commentsByAnswer: Record<number, any[]> = {};
    for (const cm of allComments) {
      if (cm.target_type === 'answer') {
        (commentsByAnswer[cm.target_id] = commentsByAnswer[cm.target_id] || []).push(formatComment(cm));
      }
    }

    const subscribed = user ? await isSubscribed(db, user.id, id) : false;
    const bookmarked = user ? await isBookmarked(db, user.id, id) : false;

    return c.json({
      id: question.id,
      title: question.titulo,
      content: question.conteudo,
      user_id: question.autor_id,
      user_name: question.is_anonymous && !isAdmin ? 'Anônimo' : question.autor_nome,
      user_image: question.is_anonymous && !isAdmin ? null : question.autor_imagem,
      is_anonymous: question.is_anonymous,
      view_count: question.views + 1, // +1 pelo incremento
      vote_count: question.votos,
      tags: question.tags,
      has_accepted_answer: question.tem_resposta_aceita > 0,
      created_at: question.created_at,
      updated_at: question.updated_at,
      is_closed: question.is_closed === 1,
      is_pinned: question.is_pinned === 1,
      disciplina_codigo: question.disciplina_codigo || null,
      disciplina_nome: question.disciplina_nome || null,
      is_subscribed: subscribed,
      is_bookmarked: bookmarked,
      comments: questionComments,
      user_vote: userQuestionVote,
      answers: answers.map((a) => ({
        id: a.id,
        content: a.conteudo,
        user_id: a.autor_id,
        user_name: a.is_anonymous && !isAdmin ? 'Anônimo' : a.autor_nome,
        user_image: a.is_anonymous && !isAdmin ? null : a.autor_imagem,
        is_anonymous: a.is_anonymous,
        vote_count: a.votos,
        is_accepted: a.is_accepted === 1,
        created_at: a.created_at,
        updated_at: a.updated_at,
        user_vote: userAnswerVotes[a.id] || 0,
        comments: commentsByAnswer[a.id] || []
      }))
    });
  } catch (error) {
    return c.json({ error: 'Erro ao buscar pergunta', details: (error as Error).message }, 500);
  }
});

// Criar pergunta (autenticado)
forum.post('/questions', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const body = await readBody(c);
    const { titulo, conteudo, tags = [], is_anonymous = false, disciplina_codigo = null } = body;
    const autor_id = c.get('user').id;

    if (!titulo || titulo.trim().length < 10) {
      return c.json({ error: 'Título deve ter pelo menos 10 caracteres' }, 400);
    }
    if (!conteudo || conteudo.trim().length < 20) {
      return c.json({ error: 'Conteúdo deve ter pelo menos 20 caracteres' }, 400);
    }
    if (titulo.length > 255) {
      return c.json({ error: 'Título deve ter no máximo 255 caracteres' }, 400);
    }

    const result = await run(
      db,
      `INSERT INTO forum_questions (titulo, conteudo, autor_id, votos, views, is_anonymous, disciplina_codigo, created_at, updated_at)
       VALUES (?, ?, ?, 0, 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [titulo.trim(), conteudo.trim(), autor_id, is_anonymous ? 1 : 0, disciplina_codigo || null]
    );
    const questionId = result.meta.last_row_id;

    if (Array.isArray(tags) && tags.length > 0) {
      await addTagsToQuestion(db, questionId, tags);
    }

    // Autor passa a seguir a própria pergunta (recebe notificação de novas respostas)
    await subscribe(db, autor_id, questionId);

    return c.json({ success: true, id: questionId, message: 'Pergunta criada com sucesso' }, 201);
  } catch (error) {
    return c.json({ error: 'Erro ao criar pergunta', details: (error as Error).message }, 500);
  }
});

// Editar pergunta (autenticado - autor ou admin)
forum.put('/questions/:id', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    const question = await getQuestionById(db, id);
    if (!question) {
      return c.json({ error: 'Pergunta não encontrada' }, 404);
    }

    const isAdmin = user.role === 'admin';
    const isAuthor = question.autor_id === user.id;
    if (!isAdmin && !isAuthor) {
      return c.json({ error: 'Você não tem permissão para editar esta pergunta' }, 403);
    }

    const body = await readBody(c);
    const { titulo, conteudo, tags, disciplina_codigo } = body;

    if (titulo && titulo.trim().length < 10) {
      return c.json({ error: 'Título deve ter pelo menos 10 caracteres' }, 400);
    }
    if (conteudo && conteudo.trim().length < 20) {
      return c.json({ error: 'Conteúdo deve ter pelo menos 20 caracteres' }, 400);
    }

    const updateFields: Row = {
      titulo: titulo?.trim() || question.titulo,
      conteudo: conteudo?.trim() || question.conteudo,
      tags
    };
    // Só altera o vínculo de disciplina se o cliente enviar o campo
    if ('disciplina_codigo' in body) {
      updateFields.disciplina_codigo = disciplina_codigo || null;
    }

    await updateQuestionFields(db, id, updateFields);

    return c.json({ success: true, message: 'Pergunta atualizada com sucesso' });
  } catch (error) {
    return c.json({ error: 'Erro ao atualizar pergunta', details: (error as Error).message }, 500);
  }
});

// Deletar pergunta (autenticado - autor ou admin)
forum.delete('/questions/:id', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    const question = await getQuestionById(db, id);
    if (!question) {
      return c.json({ error: 'Pergunta não encontrada' }, 404);
    }

    const isAdmin = user.role === 'admin';
    const isAuthor = question.autor_id === user.id;
    if (!isAdmin && !isAuthor) {
      return c.json({ error: 'Você não tem permissão para deletar esta pergunta' }, 403);
    }

    // Limpeza manual de tudo relacionado (como no Express) — atômica via batch.
    // Ordem importa: subqueries sobre forum_answers antes de deletar as respostas.
    await batch(db, [
      {
        sql: `DELETE FROM forum_comments
              WHERE (target_type = 'question' AND target_id = ?)
                 OR (target_type = 'answer' AND target_id IN (SELECT id FROM forum_answers WHERE question_id = ?))`,
        params: [id, id]
      },
      { sql: "DELETE FROM forum_votes WHERE votable_type = 'question' AND votable_id = ?", params: [id] },
      {
        sql: "DELETE FROM forum_votes WHERE votable_type = 'answer' AND votable_id IN (SELECT id FROM forum_answers WHERE question_id = ?)",
        params: [id]
      },
      { sql: 'DELETE FROM forum_subscriptions WHERE question_id = ?', params: [id] },
      { sql: 'DELETE FROM forum_bookmarks WHERE question_id = ?', params: [id] },
      { sql: 'DELETE FROM forum_question_tags WHERE question_id = ?', params: [id] },
      { sql: 'DELETE FROM forum_answers WHERE question_id = ?', params: [id] },
      { sql: 'DELETE FROM forum_questions WHERE id = ?', params: [id] }
    ]);

    return c.json({ success: true, message: 'Pergunta deletada com sucesso' });
  } catch (error) {
    return c.json({ error: 'Erro ao deletar pergunta', details: (error as Error).message }, 500);
  }
});

// Votar em pergunta (autenticado)
forum.post('/questions/:id/vote', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const { voteType } = await readBody(c);

    if (voteType !== 1 && voteType !== -1) {
      return c.json({ error: 'Tipo de voto inválido. Use 1 ou -1' }, 400);
    }

    const question = await getQuestionById(db, id);
    if (!question) {
      return c.json({ error: 'Pergunta não encontrada' }, 404);
    }

    if (question.autor_id === user.id) {
      return c.json({ error: 'Você não pode votar na própria pergunta' }, 403);
    }

    const voteDiff = await registerVote(db, user.id, 'question', id, voteType);
    const newVoteCount = question.votos + voteDiff;

    return c.json({
      success: true,
      votos: newVoteCount,
      userVote: voteDiff === 0 ? 0 : voteDiff > 0 ? voteType : 0
    });
  } catch (error) {
    return c.json({ error: 'Erro ao registrar voto', details: (error as Error).message }, 500);
  }
});

// Fechar/reabrir pergunta (admin)
forum.post('/questions/:id/close', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Apenas administradores podem fechar perguntas' }, 403);
    }

    const question = await getQuestionById(db, id);
    if (!question) {
      return c.json({ error: 'Pergunta não encontrada' }, 404);
    }

    const newStatus = question.is_closed === 1 ? 0 : 1;
    await updateQuestionFields(db, id, { is_closed: newStatus });

    return c.json({
      success: true,
      isClosed: newStatus === 1,
      message: newStatus ? 'Pergunta fechada' : 'Pergunta reaberta'
    });
  } catch (error) {
    return c.json({ error: 'Erro ao fechar pergunta', details: (error as Error).message }, 500);
  }
});

// Fixar/desafixar pergunta (admin)
forum.post('/questions/:id/pin', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Apenas administradores podem fixar perguntas' }, 403);
    }

    const question = await getQuestionById(db, id);
    if (!question) {
      return c.json({ error: 'Pergunta não encontrada' }, 404);
    }

    const newStatus = question.is_pinned === 1 ? 0 : 1;
    await updateQuestionFields(db, id, { is_pinned: newStatus });

    return c.json({
      success: true,
      isPinned: newStatus === 1,
      message: newStatus ? 'Pergunta fixada' : 'Pergunta desfixada'
    });
  } catch (error) {
    return c.json({ error: 'Erro ao fixar pergunta', details: (error as Error).message }, 500);
  }
});

// Seguir/deixar de seguir pergunta (autenticado)
forum.post('/questions/:id/subscribe', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    const question = await getQuestionById(db, id);
    if (!question) {
      return c.json({ error: 'Pergunta não encontrada' }, 404);
    }

    const already = await isSubscribed(db, user.id, id);
    if (already) {
      await run(db, 'DELETE FROM forum_subscriptions WHERE user_id = ? AND question_id = ?', [user.id, id]);
    } else {
      await subscribe(db, user.id, id);
    }

    return c.json({
      success: true,
      is_subscribed: !already,
      message: already ? 'Você deixou de seguir esta pergunta' : 'Você está seguindo esta pergunta'
    });
  } catch (error) {
    return c.json({ error: 'Erro ao seguir pergunta', details: (error as Error).message }, 500);
  }
});

// Salvar/remover pergunta dos favoritos (autenticado)
forum.post('/questions/:id/bookmark', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    const question = await getQuestionById(db, id);
    if (!question) {
      return c.json({ error: 'Pergunta não encontrada' }, 404);
    }

    const already = await isBookmarked(db, user.id, id);
    if (already) {
      await run(db, 'DELETE FROM forum_bookmarks WHERE user_id = ? AND question_id = ?', [user.id, id]);
    } else {
      await run(db, 'INSERT OR IGNORE INTO forum_bookmarks (user_id, question_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)', [
        user.id,
        id
      ]);
    }

    return c.json({
      success: true,
      is_bookmarked: !already,
      message: already ? 'Removido dos salvos' : 'Pergunta salva!'
    });
  } catch (error) {
    return c.json({ error: 'Erro ao favoritar pergunta', details: (error as Error).message }, 500);
  }
});

// Listar perguntas salvas do usuário logado (autenticado)
forum.get('/bookmarks', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get('user');

    const questions = await all<Row>(
      db,
      `SELECT q.*, u.name as autor_nome, u.profile_image as autor_imagem, d.nome as disciplina_nome,
          (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
          (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
       FROM forum_questions q
       JOIN users u ON q.autor_id = u.id
       LEFT JOIN disciplines d ON q.disciplina_codigo = d.codigo
       JOIN forum_bookmarks b ON b.question_id = q.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [user.id]
    );
    for (const question of questions) {
      question.tags = await getQuestionTags(db, question.id);
    }

    const userVotes = questions.length
      ? await getUserVotes(db, user.id, 'question', questions.map((q) => q.id))
      : {};
    const isAdmin = user.role === 'admin';

    return c.json(questions.map((q) => formatQuestionRow(q, userVotes, isAdmin)));
  } catch (error) {
    return c.json({ error: 'Erro ao buscar favoritos', details: (error as Error).message }, 500);
  }
});

// =====================================================
// ANSWERS - Respostas
// =====================================================

// Criar resposta (autenticado)
forum.post('/questions/:id/answers', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const questionId = Number(c.req.param('id'));
    const user = c.get('user');
    const body = await readBody(c);
    const { conteudo, is_anonymous = false } = body;

    if (!conteudo || conteudo.trim().length < 10) {
      return c.json({ error: 'Resposta deve ter pelo menos 10 caracteres' }, 400);
    }

    const question = await getQuestionById(db, questionId);
    if (!question) {
      return c.json({ error: 'Pergunta não encontrada' }, 404);
    }

    if (question.is_closed === 1) {
      return c.json({ error: 'Esta pergunta está fechada para novas respostas' }, 403);
    }

    // INSERT da resposta + touch no updated_at da pergunta, atômico via batch.
    const results = await batch(db, [
      {
        sql: `INSERT INTO forum_answers (question_id, conteudo, autor_id, votos, is_accepted, is_anonymous, created_at, updated_at)
              VALUES (?, ?, ?, 0, 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        params: [questionId, conteudo.trim(), user.id, is_anonymous ? 1 : 0]
      },
      { sql: 'UPDATE forum_questions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', params: [questionId] }
    ]);
    const answerId = (results[0] as any).meta.last_row_id;

    // Notifica seguidores da pergunta (inclui o autor); quem respondeu passa a seguir
    await notifyNewAnswer(db, question.autor_id, questionId, user.id);
    await subscribe(db, user.id, questionId);

    return c.json({ success: true, id: answerId, message: 'Resposta criada com sucesso' }, 201);
  } catch (error) {
    return c.json({ error: 'Erro ao criar resposta', details: (error as Error).message }, 500);
  }
});

// Editar resposta (autenticado - autor ou admin)
forum.put('/answers/:id', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    const answer = await getAnswerById(db, id);
    if (!answer) {
      return c.json({ error: 'Resposta não encontrada' }, 404);
    }

    const isAdmin = user.role === 'admin';
    const isAuthor = answer.autor_id === user.id;
    if (!isAdmin && !isAuthor) {
      return c.json({ error: 'Você não tem permissão para editar esta resposta' }, 403);
    }

    const { conteudo } = await readBody(c);
    if (!conteudo || conteudo.trim().length < 10) {
      return c.json({ error: 'Resposta deve ter pelo menos 10 caracteres' }, 400);
    }

    await run(db, 'UPDATE forum_answers SET conteudo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      conteudo.trim(),
      id
    ]);

    return c.json({ success: true, message: 'Resposta atualizada com sucesso' });
  } catch (error) {
    return c.json({ error: 'Erro ao atualizar resposta', details: (error as Error).message }, 500);
  }
});

// Deletar resposta (autenticado - autor ou admin)
forum.delete('/answers/:id', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    const answer = await getAnswerById(db, id);
    if (!answer) {
      return c.json({ error: 'Resposta não encontrada' }, 404);
    }

    const isAdmin = user.role === 'admin';
    const isAuthor = answer.autor_id === user.id;
    if (!isAdmin && !isAuthor) {
      return c.json({ error: 'Você não tem permissão para deletar esta resposta' }, 403);
    }

    await batch(db, [
      { sql: "DELETE FROM forum_comments WHERE target_type = 'answer' AND target_id = ?", params: [id] },
      { sql: "DELETE FROM forum_votes WHERE votable_type = 'answer' AND votable_id = ?", params: [id] },
      { sql: 'DELETE FROM forum_answers WHERE id = ?', params: [id] }
    ]);

    return c.json({ success: true, message: 'Resposta deletada com sucesso' });
  } catch (error) {
    return c.json({ error: 'Erro ao deletar resposta', details: (error as Error).message }, 500);
  }
});

// Aceitar resposta (autenticado - autor da pergunta ou admin)
forum.post('/answers/:id/accept', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    const answer = await getAnswerById(db, id);
    if (!answer) {
      return c.json({ error: 'Resposta não encontrada' }, 404);
    }

    const question = await getQuestionById(db, answer.question_id);

    const isAdmin = user.role === 'admin';
    const isQuestionAuthor = (question as Row).autor_id === user.id;
    if (!isAdmin && !isQuestionAuthor) {
      return c.json({ error: 'Apenas o autor da pergunta ou admin pode aceitar respostas' }, 403);
    }

    // Toggle aceitar: desmarca todas e, se não estava aceita, marca esta (atômico via batch).
    const current = await first<Row>(db, 'SELECT is_accepted FROM forum_answers WHERE id = ?', [id]);
    const isCurrentlyAccepted = current?.is_accepted === 1;
    const statements: { sql: string; params?: unknown[] }[] = [
      { sql: 'UPDATE forum_answers SET is_accepted = 0 WHERE question_id = ?', params: [answer.question_id] }
    ];
    if (!isCurrentlyAccepted) {
      statements.push({ sql: 'UPDATE forum_answers SET is_accepted = 1 WHERE id = ?', params: [id] });
    }
    await batch(db, statements);
    const isNowAccepted = !isCurrentlyAccepted;

    if (isNowAccepted) {
      await notifyAnswerAccepted(db, answer.autor_id, answer.question_id, id);
    }

    return c.json({
      success: true,
      isAccepted: isNowAccepted,
      message: isNowAccepted ? 'Resposta aceita' : 'Resposta desaceita'
    });
  } catch (error) {
    return c.json({ error: 'Erro ao aceitar resposta', details: (error as Error).message }, 500);
  }
});

// Votar em resposta (autenticado)
forum.post('/answers/:id/vote', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const { voteType } = await readBody(c);

    if (voteType !== 1 && voteType !== -1) {
      return c.json({ error: 'Tipo de voto inválido. Use 1 ou -1' }, 400);
    }

    const answer = await getAnswerById(db, id);
    if (!answer) {
      return c.json({ error: 'Resposta não encontrada' }, 404);
    }

    if (answer.autor_id === user.id) {
      return c.json({ error: 'Você não pode votar na própria resposta' }, 403);
    }

    const voteDiff = await registerVote(db, user.id, 'answer', id, voteType);
    const newVoteCount = answer.votos + voteDiff;

    return c.json({
      success: true,
      votos: newVoteCount,
      userVote: voteDiff === 0 ? 0 : voteDiff > 0 ? voteType : 0
    });
  } catch (error) {
    return c.json({ error: 'Erro ao registrar voto', details: (error as Error).message }, 500);
  }
});

// =====================================================
// TAGS - Tags
// =====================================================

// Listar todas as tags (público)
forum.get('/tags', async (c) => {
  try {
    const tags = await all<Row>(
      c.env.DB,
      `SELECT
          t.id,
          t.nome,
          t.topico,
          t.descricao,
          t.approved,
          t.created_by_user,
          COUNT(qt.question_id) as count
       FROM forum_tags t
       LEFT JOIN forum_question_tags qt ON t.id = qt.tag_id
       GROUP BY t.id
       ORDER BY t.topico ASC, t.nome ASC`
    );
    return c.json(tags);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar tags', details: (error as Error).message }, 500);
  }
});

// Tags populares (público)
forum.get('/tags/popular', async (c) => {
  try {
    const limit = Number(c.req.query('limit') ?? 10);
    const tags = await all<Row>(
      c.env.DB,
      `SELECT
          t.id,
          t.nome,
          t.descricao,
          COUNT(qt.question_id) as count
       FROM forum_tags t
       LEFT JOIN forum_question_tags qt ON t.id = qt.tag_id
       GROUP BY t.id
       ORDER BY count DESC
       LIMIT ?`,
      [limit]
    );
    return c.json(tags);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar tags', details: (error as Error).message }, 500);
  }
});

// Criar nova tag (autenticado)
forum.post('/tags', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get('user');
    const { nome, topico, descricao } = await readBody(c);

    if (!nome || nome.trim().length < 2) {
      return c.json({ error: 'Nome da tag deve ter pelo menos 2 caracteres' }, 400);
    }
    if (!topico) {
      return c.json({ error: 'Tópico é obrigatório' }, 400);
    }

    const normalizedName = nome.toLowerCase().trim();
    const existing = await first<Row>(db, 'SELECT * FROM forum_tags WHERE nome = ?', [normalizedName]);
    if (existing) {
      return c.json({ error: 'Tag já existe' }, 409);
    }

    const result = await run(
      db,
      'INSERT INTO forum_tags (nome, topico, descricao, created_by_user, approved, created_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)',
      [normalizedName, topico, descricao ?? null, user.id]
    );
    const tagId = result.meta.last_row_id;

    // Notificar admins sobre nova tag criada (in-app, direto na tabela notifications)
    const admins = await all<Row>(db, 'SELECT * FROM users WHERE role = ?', ['admin']);
    if (admins.length > 0) {
      await batch(
        db,
        admins.map((admin) =>
          notificationStmt(
            admin.id,
            'forum_new_tag',
            `O usuário ${user.name} criou a tag "${nome}" no tópico "${topico}". Valide ou remova se necessário.`,
            { tag_id: tagId, tag_nome: nome, topico }
          )
        )
      );
    }

    return c.json({ id: tagId, message: 'Tag criada com sucesso! Já está disponível para uso.' }, 201);
  } catch (error) {
    if ((error as Error).message === 'Tag já existe') {
      return c.json({ error: (error as Error).message }, 409);
    }
    return c.json({ error: 'Erro ao criar tag', details: (error as Error).message }, 500);
  }
});

// Listar tags pendentes (admin)
forum.get('/tags/pending', authenticateToken(), async (c) => {
  try {
    if (!isAdminUser(c.get('user'))) {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    const tags = await all<Row>(
      c.env.DB,
      `SELECT t.*, u.name as created_by_name
       FROM forum_tags t
       LEFT JOIN users u ON t.created_by_user = u.id
       WHERE t.created_by_user IS NOT NULL
       ORDER BY t.approved ASC, t.created_at DESC`
    );
    return c.json(tags);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar tags pendentes', details: (error as Error).message }, 500);
  }
});

// Aprovar tag (admin)
forum.post('/tags/:id/approve', authenticateToken(), async (c) => {
  try {
    if (!isAdminUser(c.get('user'))) {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    await run(c.env.DB, 'UPDATE forum_tags SET approved = 1 WHERE id = ?', [c.req.param('id')]);
    return c.json({ message: 'Tag aprovada com sucesso' });
  } catch (error) {
    return c.json({ error: 'Erro ao aprovar tag', details: (error as Error).message }, 500);
  }
});

// Deletar tag (admin)
forum.delete('/tags/:id', authenticateToken(), async (c) => {
  try {
    if (!isAdminUser(c.get('user'))) {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    const id = c.req.param('id');
    await batch(c.env.DB, [
      { sql: 'DELETE FROM forum_question_tags WHERE tag_id = ?', params: [id] },
      { sql: 'DELETE FROM forum_tags WHERE id = ?', params: [id] }
    ]);
    return c.json({ message: 'Tag deletada com sucesso' });
  } catch (error) {
    return c.json({ error: 'Erro ao deletar tag', details: (error as Error).message }, 500);
  }
});

// Listar tópicos disponíveis (público)
forum.get('/topics', (c) => {
  try {
    return c.json(['academico', 'administrativo', 'tecnico', 'eventos', 'carreira', 'biblioteca', 'geral']);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar tópicos', details: (error as Error).message }, 500);
  }
});

// =====================================================
// COMMENTS - Comentários
// =====================================================

// Criar comentário (autenticado)
forum.post('/comments', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get('user');
    const { target_type, target_id, conteudo } = await readBody(c);

    if (!['question', 'answer'].includes(target_type)) {
      return c.json({ error: 'Tipo de alvo inválido' }, 400);
    }
    if (!target_id) {
      return c.json({ error: 'Alvo não informado' }, 400);
    }
    if (!conteudo || conteudo.trim().length < 2) {
      return c.json({ error: 'Comentário muito curto (mínimo 2 caracteres)' }, 400);
    }

    const result = await run(
      db,
      `INSERT INTO forum_comments (target_type, target_id, autor_id, conteudo, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [target_type, Number(target_id), user.id, conteudo.trim()]
    );

    const author = await first<Row>(db, 'SELECT name FROM users WHERE id = ?', [user.id]);

    return c.json(
      {
        id: result.meta.last_row_id,
        content: conteudo.trim(),
        user_id: user.id,
        user_name: author ? author.name : 'Usuário',
        created_at: new Date().toISOString()
      },
      201
    );
  } catch (error) {
    return c.json({ error: 'Erro ao criar comentário', details: (error as Error).message }, 500);
  }
});

// Remover comentário (autor ou admin)
forum.delete('/comments/:id', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const user = c.get('user');

    const comment = await first<Row>(db, 'SELECT * FROM forum_comments WHERE id = ?', [id]);
    if (!comment) {
      return c.json({ error: 'Comentário não encontrado' }, 404);
    }

    const isAdmin = user.role === 'admin';
    const isAuthor = comment.autor_id === user.id;
    if (!isAdmin && !isAuthor) {
      return c.json({ error: 'Você não tem permissão para remover este comentário' }, 403);
    }

    await run(db, 'DELETE FROM forum_comments WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Comentário removido' });
  } catch (error) {
    return c.json({ error: 'Erro ao remover comentário', details: (error as Error).message }, 500);
  }
});

// =====================================================
// REPORTS - Denúncias de conteúdo
// =====================================================

// Registrar denúncia (autenticado)
forum.post('/reports', authenticateToken(), async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get('user');
    const { target_type, target_id, motivo } = await readBody(c);

    if (!['question', 'answer'].includes(target_type)) {
      return c.json({ error: 'Tipo de conteúdo inválido' }, 400);
    }
    if (!target_id) {
      return c.json({ error: 'Conteúdo denunciado não informado' }, 400);
    }
    if (!motivo || motivo.trim().length < 5) {
      return c.json({ error: 'Descreva o motivo (mínimo 5 caracteres)' }, 400);
    }

    const result = await run(
      db,
      `INSERT INTO forum_reports (reporter_id, target_type, target_id, motivo, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      [user.id, target_type, Number(target_id), motivo.trim()]
    );

    return c.json({ success: true, id: result.meta.last_row_id, message: 'Denúncia registrada. Obrigado!' }, 201);
  } catch (error) {
    return c.json({ error: 'Erro ao registrar denúncia', details: (error as Error).message }, 500);
  }
});

// Listar denúncias (admin) — ?status=pending|resolved|dismissed|all
forum.get('/reports', authenticateToken(), async (c) => {
  try {
    if (!isAdminUser(c.get('user'))) {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    const status = c.req.query('status') ?? 'pending';
    const effectiveStatus = status === 'all' ? null : status;

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
    const params: unknown[] = [];
    if (effectiveStatus) {
      query += ' WHERE r.status = ?';
      params.push(effectiveStatus);
    }
    query += ' ORDER BY r.created_at DESC';

    return c.json(await all<Row>(c.env.DB, query, params));
  } catch (error) {
    return c.json({ error: 'Erro ao listar denúncias', details: (error as Error).message }, 500);
  }
});

// Resolver/descartar denúncia (admin)
forum.post('/reports/:id/resolve', authenticateToken(), async (c) => {
  try {
    if (!isAdminUser(c.get('user'))) {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    const { status } = await readBody(c);
    if (!['resolved', 'dismissed'].includes(status)) {
      return c.json({ error: 'Status inválido' }, 400);
    }

    await run(c.env.DB, 'UPDATE forum_reports SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?', [
      status,
      Number(c.req.param('id'))
    ]);

    return c.json({ success: true, message: 'Denúncia atualizada' });
  } catch (error) {
    return c.json({ error: 'Erro ao resolver denúncia', details: (error as Error).message }, 500);
  }
});

// =====================================================
// STATISTICS - Estatísticas
// =====================================================

// Estatísticas globais (público)
forum.get('/stats', async (c) => {
  try {
    const stats = await first<Row>(
      c.env.DB,
      `SELECT
          (SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0) as total_questions,
          (SELECT COUNT(*) FROM forum_answers WHERE is_anonymous = 0) as total_answers,
          (SELECT COUNT(DISTINCT autor_id) FROM forum_questions WHERE is_anonymous = 0) +
          (SELECT COUNT(DISTINCT autor_id) FROM forum_answers WHERE is_anonymous = 0) as active_users,
          CASE
              WHEN (SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0) = 0 THEN 0
              ELSE ROUND(
                  CAST((SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0 AND id IN (SELECT DISTINCT question_id FROM forum_answers WHERE is_anonymous = 0)) AS FLOAT) /
                  CAST((SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0) AS FLOAT) * 100
              )
          END as response_rate`
    );

    return c.json({
      total_questions: stats?.total_questions || 0,
      total_answers: stats?.total_answers || 0,
      active_users: stats?.active_users || 0,
      response_rate: stats?.response_rate || 0
    });
  } catch (error) {
    return c.json({ error: 'Erro ao buscar estatísticas', details: (error as Error).message }, 500);
  }
});

// Top contributors (público)
forum.get('/top-contributors', async (c) => {
  try {
    const limit = Number(c.req.query('limit') ?? 5);
    const contributors = await all<Row>(
      c.env.DB,
      `SELECT
          u.id,
          u.name,
          u.profile_image,
          COALESCE(
              (SELECT SUM(q.votos) * 5 FROM forum_questions q WHERE q.autor_id = u.id AND q.is_anonymous = 0), 0
          ) + COALESCE(
              (SELECT SUM(a.votos) * 10 FROM forum_answers a WHERE a.autor_id = u.id AND a.is_anonymous = 0), 0
          ) + COALESCE(
              (SELECT COUNT(*) * 15 FROM forum_answers WHERE autor_id = u.id AND is_accepted = 1 AND is_anonymous = 0), 0
          ) as pontos,
          (SELECT COUNT(*) FROM forum_questions WHERE autor_id = u.id AND is_anonymous = 0) as questions,
          (SELECT COUNT(*) FROM forum_answers WHERE autor_id = u.id AND is_anonymous = 0) as answers,
          (SELECT COUNT(*) FROM forum_answers WHERE autor_id = u.id AND is_accepted = 1 AND is_anonymous = 0) as accepted_answers
       FROM users u
       WHERE (
           SELECT COUNT(*) FROM forum_questions WHERE autor_id = u.id AND is_anonymous = 0
       ) + (
           SELECT COUNT(*) FROM forum_answers WHERE autor_id = u.id AND is_anonymous = 0
       ) > 0
       ORDER BY pontos DESC
       LIMIT ?`,
      [limit]
    );
    return c.json(contributors);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar top contributors', details: (error as Error).message }, 500);
  }
});

// Estatísticas do usuário (público)
forum.get('/users/:id/stats', async (c) => {
  try {
    const db = c.env.DB;
    const userId = Number(c.req.param('id'));

    const stats = await first<Row>(
      db,
      `SELECT
          (SELECT COUNT(*) FROM forum_questions WHERE autor_id = ? AND is_anonymous = 0) as questions_asked,
          (SELECT COUNT(*) FROM forum_answers WHERE autor_id = ? AND is_anonymous = 0) as answers_given,
          (SELECT COUNT(*) FROM forum_answers WHERE autor_id = ? AND is_accepted = 1 AND is_anonymous = 0) as accepted_answers`,
      [userId, userId, userId]
    );

    // Reputação: (votos em perguntas * 5) + (votos em respostas * 10) + (respostas aceitas * 15)
    const questionVotes = await first<Row>(
      db,
      'SELECT COALESCE(SUM(q.votos), 0) as total FROM forum_questions q WHERE q.autor_id = ? AND q.is_anonymous = 0',
      [userId]
    );
    const answerVotes = await first<Row>(
      db,
      'SELECT COALESCE(SUM(a.votos), 0) as total FROM forum_answers a WHERE a.autor_id = ? AND a.is_anonymous = 0',
      [userId]
    );
    const acceptedAnswers = await first<Row>(
      db,
      'SELECT COUNT(*) as total FROM forum_answers WHERE autor_id = ? AND is_accepted = 1 AND is_anonymous = 0',
      [userId]
    );

    const reputation =
      (questionVotes?.total ?? 0) * 5 + (answerVotes?.total ?? 0) * 10 + (acceptedAnswers?.total ?? 0) * 15;

    return c.json({ ...stats, reputation });
  } catch (error) {
    return c.json({ error: 'Erro ao buscar estatísticas', details: (error as Error).message }, 500);
  }
});

// Respostas de um usuário (público)
forum.get('/users/:id/answers', async (c) => {
  try {
    const answers = await all<Row>(
      c.env.DB,
      `SELECT a.*, q.titulo as question_titulo
       FROM forum_answers a
       JOIN forum_questions q ON a.question_id = q.id
       WHERE a.autor_id = ?
       ORDER BY a.created_at DESC`,
      [Number(c.req.param('id'))]
    );

    return c.json(
      answers.map((a) => ({
        id: a.id,
        question_id: a.question_id,
        question_title: a.question_titulo,
        content: a.conteudo,
        vote_count: a.votos,
        is_accepted: a.is_accepted === 1,
        is_anonymous: a.is_anonymous,
        created_at: a.created_at
      }))
    );
  } catch (error) {
    return c.json({ error: 'Erro ao buscar respostas', details: (error as Error).message }, 500);
  }
});

export default forum;
