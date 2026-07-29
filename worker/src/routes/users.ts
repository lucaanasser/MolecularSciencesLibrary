/**
 * Porte de /api/users: login, perfil, registro, aprovação e reset de senha.
 * Contrato espelhado de authHandlers/commandHandlers/queryHandlers + authUserService/lifecycleUserService.
 * Senha: apenas PBKDF2 — hash bcrypt legado orienta o usuário ao reset (o portão de entrada
 * dos usuários reais na estreia). E-mails via services/email (Resend), nunca bloqueiam a operação.
 * Fora do porte: import/export CSV (multer) e PUT /me/profile-image (upload — fase R2).
 */
import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Context, Next } from 'hono';
import { all, first, run } from '../db';
import {
  authenticateToken,
  clientIpOf,
  isLegacyBcryptHash,
  kioskAllowedIp,
  pbkdf2Hash,
  pbkdf2Verify,
  secretOf,
  signToken,
  type JwtUser
} from '../auth';
import {
  sendPasswordResetEmail,
  sendRegistrationRequestNotification,
  sendWelcomeEmail
} from '../services/email';
import type { Env } from '../index';

const USER_SELECT_WITH_PASSWORD =
  'id, name, NUSP, email, phone, role, profile_image, class, created_at, password_hash, status';

class AuthError extends Error {}

type Vars = { Bindings: Env; Variables: { user: JwtUser } };

const requireAdmin = async (c: Context<Vars>, next: Next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Acesso restrito a administradores.' }, 403);
  }
  await next();
};

const users = new Hono<Vars>();

const PHONE_RE = /^\+?\d{10,15}$/;

function stripHash(user: Record<string, unknown>) {
  const { password_hash: _ignored, ...userData } = user;
  return userData;
}

users.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const { login, password } = body as { login?: string; password?: string };
  if (!login || !password) {
    return c.json({ error: 'Login e senha são obrigatórios.' }, 400);
  }

  try {
    const byNusp = /^\d+$/.test(String(login));
    const user = await first<Record<string, unknown>>(
      c.env.DB,
      `SELECT ${USER_SELECT_WITH_PASSWORD} FROM users WHERE ${byNusp ? 'NUSP' : 'email'} = ?`,
      [login]
    );

    if (!user) throw new AuthError('Usuário não encontrado');
    if (user.status === 'pending') {
      throw new AuthError('Seu cadastro ainda está aguardando aprovação do administrador.');
    }

    const storedHash = user.password_hash as string | null;
    if (isLegacyBcryptHash(storedHash)) {
      throw new AuthError('Sua senha precisa ser redefinida. Use a opção "Esqueci minha senha".');
    }

    const valid = await pbkdf2Verify(password, storedHash);
    if (!valid) throw new AuthError('Senha incorreta');

    if (user.role === 'proaluno' && c.env.ENVIRONMENT !== 'development') {
      const clientIp = clientIpOf(c).replace('::ffff:', '');
      if (clientIp !== kioskAllowedIp(c.env)) {
        return c.json({ error: 'IP não autorizado para este usuário.' }, 403);
      }
    }

    const payload: JwtUser = {
      id: user.id as number,
      role: user.role as string,
      name: user.name as string,
      email: user.email as string,
      NUSP: user.NUSP as string
    };
    const token = await signToken(payload, secretOf(c.env), user.role === 'proaluno' ? 365 : 7);
    return c.json({ ...stripHash(user), token }, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 401);
  }
});

users.post('/forgot-password', async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const { login } = body as { login?: string };
  if (!login) return c.json({ error: 'Email ou NUSP são obrigatórios.' }, 400);

  try {
    const byNusp = /^\d+$/.test(String(login));
    const user = await first<Record<string, unknown>>(
      c.env.DB,
      `SELECT ${USER_SELECT_WITH_PASSWORD} FROM users WHERE ${byNusp ? 'NUSP' : 'email'} = ?`,
      [login]
    );
    if (!user) throw new Error('Usuário não encontrado');

    const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1h, como no Express
    const resetToken = await sign({ id: user.id, email: user.email, type: 'reset', exp }, secretOf(c.env));
    await sendPasswordResetEmail(c.env, { user_id: user.id, resetToken });

    return c.json({ message: 'Se o usuário existir, um email foi enviado com instruções para redefinir a senha.' }, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

users.post('/reset-password', async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const { token, newPassword } = body as { token?: string; newPassword?: string };
  if (!token || !newPassword) {
    return c.json({ error: 'Token e nova senha são obrigatórios.' }, 400);
  }

  try {
    let payload: Record<string, unknown>;
    try {
      payload = (await verify(token, secretOf(c.env), 'HS256')) as Record<string, unknown>;
    } catch (_error) {
      throw new Error('Token inválido ou expirado');
    }
    if (!payload || (payload.type !== 'reset' && payload.type !== 'first_access') || !payload.id) {
      throw new Error('Token inválido');
    }

    const user = await first<Record<string, unknown>>(c.env.DB, 'SELECT id FROM users WHERE id = ?', [payload.id]);
    if (!user) throw new Error('Usuário não encontrado');

    await run(c.env.DB, 'UPDATE users SET password_hash = ? WHERE id = ?', [
      await pbkdf2Hash(newPassword),
      user.id
    ]);
    return c.json({ message: 'Senha redefinida com sucesso.' }, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

users.post('/register', async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const { name, email, phone, NUSP, class: userClass } = body as Record<string, string | undefined>;
  if (!name || !email || !phone || !NUSP || !userClass) {
    return c.json({ error: 'Todos os campos são obrigatórios.' }, 400);
  }
  if (!PHONE_RE.test(phone)) {
    return c.json({ error: 'Telefone inválido. Informe DDD e número.' }, 400);
  }

  try {
    if (await first(c.env.DB, 'SELECT id FROM users WHERE email = ?', [email])) {
      throw new Error('Este email já está cadastrado no sistema.');
    }
    if (await first(c.env.DB, 'SELECT id FROM users WHERE NUSP = ?', [NUSP])) {
      throw new Error('Este NUSP já está cadastrado no sistema.');
    }
    if (await first(c.env.DB, 'SELECT id FROM users WHERE phone = ?', [phone])) {
      throw new Error('Este telefone já está cadastrado no sistema.');
    }

    const result = await run(
      c.env.DB,
      'INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image, class, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, NUSP, email, phone, null, 'aluno', null, userClass, 'pending']
    );
    const created = await first<Record<string, unknown>>(
      c.env.DB,
      `SELECT ${USER_SELECT_WITH_PASSWORD} FROM users WHERE id = ?`,
      [result.meta.last_row_id]
    );

    c.executionCtx.waitUntil(sendRegistrationRequestNotification(c.env, { user: created }));
    return c.json(stripHash(created ?? {}), 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

users.get('/me', authenticateToken(), async (c) => {
  try {
    const jwtUser = c.get('user');
    let user = jwtUser.id
      ? await first(c.env.DB, `SELECT ${USER_SELECT_WITH_PASSWORD} FROM users WHERE id = ?`, [jwtUser.id])
      : null;
    if (!user && jwtUser.NUSP) {
      user = await first(c.env.DB, `SELECT ${USER_SELECT_WITH_PASSWORD} FROM users WHERE NUSP = ?`, [jwtUser.NUSP]);
    }
    if (!user) throw new Error('Usuário não encontrado');
    return c.json(stripHash(user), 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 404);
  }
});

users.get('/search', authenticateToken(), async (c) => {
  try {
    const q = c.req.query('q') || '';
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit') as string, 10) : 1000;
    const whereConditions = ["status != 'pending'"];
    const params: unknown[] = [];
    if (q.length > 0) {
      whereConditions.unshift(
        '(name LIKE ? COLLATE NOCASE OR NUSP LIKE ? COLLATE NOCASE OR email LIKE ? COLLATE NOCASE)'
      );
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const results = await all(
      c.env.DB,
      `SELECT id, name, NUSP, email, phone, class, profile_image, role FROM users WHERE ${whereConditions.join(' AND ')} LIMIT ?`,
      [...params, limit]
    );
    return c.json(results);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar usuários' }, 500);
  }
});

users.get('/pending', authenticateToken(), requireAdmin, async (c) => {
  try {
    const rows = await all(
      c.env.DB,
      "SELECT id, name, NUSP, email, phone, class, created_at FROM users WHERE status = 'pending' ORDER BY created_at ASC"
    );
    return c.json(rows);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

users.get('/', authenticateToken(), requireAdmin, async (c) => {
  try {
    const rows = await all(
      c.env.DB,
      "SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at FROM users WHERE status != 'pending'"
    );
    return c.json(rows);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

users.post('/', authenticateToken(), requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const { name, email, phone, NUSP, class: userClass } = body as Record<string, string | undefined>;
  if (!name || !email || !phone || !NUSP || !userClass) {
    return c.json({ error: 'Todos os campos são obrigatórios.' }, 400);
  }
  if (!PHONE_RE.test(phone)) {
    return c.json({ error: 'Telefone inválido. Informe DDD e número.' }, 400);
  }

  try {
    if (await first(c.env.DB, 'SELECT id FROM users WHERE email = ?', [email])) {
      throw new Error('Usuário já existe com este email');
    }
    const result = await run(
      c.env.DB,
      'INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image, class, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, NUSP, email, phone, null, 'aluno', null, userClass, 'active']
    );
    const userId = result.meta.last_row_id;

    try {
      await run(c.env.DB, 'INSERT INTO public_profiles (user_id, banner_choice) VALUES (?, ?)', [userId, 'purple']);
    } catch (error) {
      console.log('🔴 Falha ao criar perfil publico apos criacao de usuario', (error as Error).message);
    }

    c.executionCtx.waitUntil(sendWelcomeEmail(c.env, { user_id: userId, sendResetLink: true }));

    const created = await first<Record<string, unknown>>(
      c.env.DB,
      `SELECT ${USER_SELECT_WITH_PASSWORD} FROM users WHERE id = ?`,
      [userId]
    );
    return c.json(stripHash(created ?? {}), 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

users.patch('/:id/approve', authenticateToken(), requireAdmin, async (c) => {
  const id = c.req.param('id');
  try {
    const user = await first<Record<string, unknown>>(c.env.DB, 'SELECT id, status FROM users WHERE id = ?', [id]);
    if (!user) throw new Error('Usuário não encontrado.');
    if (user.status !== 'pending') throw new Error('Usuário não está com cadastro pendente.');

    await run(c.env.DB, "UPDATE users SET status = 'active' WHERE id = ?", [id]);
    try {
      await run(c.env.DB, 'INSERT INTO public_profiles (user_id, banner_choice) VALUES (?, ?)', [id, 'purple']);
    } catch (error) {
      console.log('🔴 Falha ao criar perfil publico apos aprovacao', (error as Error).message);
    }
    c.executionCtx.waitUntil(sendWelcomeEmail(c.env, { user_id: Number(id) }));

    return c.json({ success: true, id }, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

users.delete('/:id/reject', authenticateToken(), requireAdmin, async (c) => {
  const id = c.req.param('id');
  try {
    const user = await first<Record<string, unknown>>(c.env.DB, 'SELECT id, status FROM users WHERE id = ?', [id]);
    if (!user) throw new Error('Usuário não encontrado.');
    if (user.status !== 'pending') throw new Error('Usuário não está com cadastro pendente.');
    await run(c.env.DB, 'DELETE FROM users WHERE id = ?', [id]);
    return c.json({ success: true, id }, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

users.delete('/:id', authenticateToken(), requireAdmin, async (c) => {
  const id = c.req.param('id');
  try {
    await run(c.env.DB, 'DELETE FROM users WHERE id = ?', [id]);
    return c.json({ success: true, id }, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

users.get('/:id', async (c) => {
  try {
    const user = await first(c.env.DB, `SELECT ${USER_SELECT_WITH_PASSWORD} FROM users WHERE id = ?`, [
      c.req.param('id')
    ]);
    if (!user) throw new Error('Usuário não encontrado');
    return c.json(stripHash(user), 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 404);
  }
});

export default users;
