/**
 * Responsabilidade: hash e verificação de senha com transição bcrypt → PBKDF2.
 * Camada: shared.
 * Entradas/Saidas: hashPassword gera hash PBKDF2; verifyPassword aceita PBKDF2 e bcrypt legado.
 * Dependencias criticas: crypto nativo; bcrypt carregado sob demanda apenas para hashes legados.
 *
 * Formato do hash: pbkdf2$<iteracoes>$<salt base64>$<derivada base64>
 * O mesmo formato é verificado pelo Worker (Cloudflare) via WebCrypto — não alterar
 * iterações/digest sem atualizar worker/src/auth.ts junto.
 */

const crypto = require('crypto');

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const PREFIX = 'pbkdf2';

function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const derived = crypto.pbkdf2Sync(String(password), salt, ITERATIONS, KEY_LENGTH, DIGEST);
    return `${PREFIX}$${ITERATIONS}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

/**
 * Retorna { valid, needsRehash }. needsRehash=true quando a senha conferiu
 * contra um hash bcrypt legado — o caller deve regravar com hashPassword().
 */
async function verifyPassword(password, storedHash) {
    if (!storedHash) return { valid: false, needsRehash: false };

    if (storedHash.startsWith(`${PREFIX}$`)) {
        const [, iterations, saltB64, hashB64] = storedHash.split('$');
        const expected = Buffer.from(hashB64, 'base64');
        const derived = crypto.pbkdf2Sync(
            String(password),
            Buffer.from(saltB64, 'base64'),
            Number(iterations),
            expected.length,
            DIGEST
        );
        const valid = derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
        return { valid, needsRehash: false };
    }

    const bcrypt = require('bcrypt');
    const valid = await bcrypt.compare(password, storedHash);
    return { valid, needsRehash: valid };
}

module.exports = { hashPassword, verifyPassword, PBKDF2_ITERATIONS: ITERATIONS };
