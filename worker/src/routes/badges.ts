/**
 * Porte de /api/badges do Express (BadgesRoutes → BadgesController → BadgesService → BadgesModel).
 * Contrato espelhado: mesmos paths, status codes e shapes de resposta.
 * Peculiaridade preservada: no Express, BadgesModel.createBadge devolve o resultado bruto de
 * executeQuery ({ lastID, changes }), então POST / responde { id: { lastID, changes } }.
 * Sem autenticação — o Express também não aplica middleware nessas rotas.
 */
import { Hono } from 'hono';
import { all, first, run } from '../db';
import type { Env } from '../index';

const badges = new Hono<{ Bindings: Env }>();

badges.get('/', async (c) => {
  try {
    return c.json(await all(c.env.DB, 'SELECT * FROM badges'));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

badges.get('/:id', async (c) => {
  try {
    const badge = await first(c.env.DB, 'SELECT * FROM badges WHERE id = ?', [c.req.param('id')]);
    if (!badge) return c.json({ error: 'Badge não encontrado' }, 404);
    return c.json(badge);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

badges.post('/', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
    const { name, description, image_locked, image_unlocked } = body as Record<string, unknown>;
    if (!name || !image_locked || !image_unlocked) {
      return c.json({ error: 'Campos obrigatórios ausentes' }, 400);
    }
    const result = await run(
      c.env.DB,
      'INSERT INTO badges (name, description, image_locked, image_unlocked) VALUES (?, ?, ?, ?)',
      [name, description ?? null, image_locked, image_unlocked]
    );
    // Espelha o retorno de executeQuery do Express ({ lastID, changes }).
    return c.json({ id: { lastID: result.meta.last_row_id, changes: result.meta.changes } }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export default badges;
