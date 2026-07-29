/**
 * Porte de /api/rules do Express (RulesRoutes → RulesController → RulesService → RulesModel).
 * Contrato espelhado: mesmos paths, validações, shapes de resposta e mensagens de erro.
 * Sem autenticação — o Express também não aplica middleware nessas rotas.
 */
import { Hono } from 'hono';
import { first, run } from '../db';
import type { Env } from '../index';

// Espelho de backend/src/domain-config/library/loanRules.js (LOAN_RULES, mesma ordem).
const LOAN_RULES = [
  'max_days',
  'max_books_per_user',
  'overdue_reminder_days',
  'max_renewals',
  'renewal_days',
  'nudge_cooldown_hours'
] as const;

// Espelho do SELECT de RulesModel.getRules.
const GET_RULES_SQL =
  'SELECT max_days, overdue_reminder_days, max_books_per_user, max_renewals, renewal_days, extension_window_days, extension_block_multiplier, shortened_due_days_after_nudge, nudge_cooldown_hours, pending_nudge_extension_days FROM rules WHERE id = 1';

const rules = new Hono<{ Bindings: Env }>();

rules.get('/', async (c) => {
  try {
    const row = await first(c.env.DB, GET_RULES_SQL);
    return c.json(row);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar regras', details: (error as Error).message }, 500);
  }
});

rules.put('/', async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));

  // Monta e valida os campos dinamicamente (espelho do RulesController).
  const updateData: Record<string, number> = {};
  for (const field of LOAN_RULES) {
    const value = (body as Record<string, unknown>)[field];
    if (typeof value !== 'number') {
      return c.json({ error: `Campo inválido: ${field}` }, 400);
    }
    updateData[field] = value;
  }

  try {
    const setClause = LOAN_RULES.map((field) => `${field} = ?`).join(', ');
    const params = LOAN_RULES.map((field) => updateData[field]);
    await run(c.env.DB, `UPDATE rules SET ${setClause} WHERE id = 1`, params);

    const updated = await first(c.env.DB, GET_RULES_SQL);
    return c.json(updated);
  } catch (error) {
    return c.json({ error: 'Erro ao atualizar regras', details: (error as Error).message }, 500);
  }
});

export default rules;
