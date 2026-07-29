/**
 * Autenticação no Worker: JWT (hono/jwt, HS256 — mesmo contrato do Express) e
 * verificação de senha PBKDF2 via WebCrypto.
 * Formato do hash (idêntico a backend/src/shared/security/passwordHash.js):
 *   pbkdf2$<iteracoes>$<salt base64>$<derivada base64>
 * Hashes bcrypt legados NÃO são verificados aqui (CPU do plano gratuito não permite);
 * usuários legados transicionam no VPS ou via "esqueci minha senha".
 */
import { sign, verify } from 'hono/jwt';
import type { Context, Next } from 'hono';
import type { Env } from './index';

const ITERATIONS = 100000;
const KEY_LENGTH = 32;

const encoder = new TextEncoder();

function b64encode(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function b64decode(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array, iterations: number, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as unknown as BufferSource, iterations },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

export async function pbkdf2Hash(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await derive(password, salt, ITERATIONS, KEY_LENGTH);
  return `pbkdf2$${ITERATIONS}$${b64encode(salt)}$${b64encode(derived)}`;
}

export async function pbkdf2Verify(password: string, storedHash: string | null | undefined): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith('pbkdf2$')) return false;
  const [, iterations, saltB64, hashB64] = storedHash.split('$');
  const expected = b64decode(hashB64);
  const derived = await derive(password, b64decode(saltB64), Number(iterations), expected.length);
  if (derived.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ expected[i];
  return diff === 0;
}

export const isLegacyBcryptHash = (hash: string | null | undefined): boolean => /^\$2[aby]\$/.test(hash ?? '');

export const secretOf = (env: Env): string => env.JWT_SECRET || 'sua_chave_secreta';

export const clientIpOf = (c: Context): string => c.req.header('cf-connecting-ip') ?? '';

export const kioskAllowedIp = (env: Env): string => env.KIOSK_ALLOWED_IP || '143.107.90.22';

export type JwtUser = { id: number; role: string; name: string; email: string; NUSP: string | number };

export async function signToken(payload: JwtUser, secret: string, days: number): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
  return sign({ ...payload, exp }, secret);
}

/** Espelho do middleware Express authenticateToken (mesmos status e mensagens). */
export function authenticateToken() {
  return async (c: Context<{ Bindings: Env; Variables: { user: JwtUser } }>, next: Next) => {
    const authHeader = c.req.header('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return c.json({ error: 'Token não fornecido' }, 401);

    let user: JwtUser;
    try {
      user = (await verify(token, secretOf(c.env), 'HS256')) as unknown as JwtUser;
    } catch (_error) {
      return c.json({ error: 'Token inválido' }, 403);
    }

    if (user.role === 'proaluno' && c.env.ENVIRONMENT !== 'development') {
      const reqIp = clientIpOf(c).replace('::ffff:', '');
      if (reqIp !== kioskAllowedIp(c.env)) {
        return c.json({ error: 'Acesso não permitido para proaluno' }, 403);
      }
    }

    c.set('user', user);
    await next();
  };
}
