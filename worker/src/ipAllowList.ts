/**
 * Casamento de IP contra lista de permissões, para o travamento do quiosque.
 *
 * Motivação: a checagem original comparava `cf-connecting-ip` com um único IPv4
 * por igualdade de string. Isso quebra de duas formas na Cloudflare — o IP público
 * do quiosque muda (rede da USP não entrega endereço fixo) e, como a zona tem
 * registros AAAA, o navegador pode chegar por IPv6, que jamais será igual a um
 * literal IPv4.
 *
 * Aqui a lista aceita endereços e prefixos CIDR, IPv4 e IPv6, separados por vírgula:
 *   KIOSK_ALLOWED_IP="143.107.90.22, 143.107.79.0/24, 2804:14d:5cd2:8000::/64"
 *
 * Prefixo importa especialmente no IPv6: com privacy extensions o endereço da
 * máquina gira dentro do /64, então travar num endereço exato volta a quebrar.
 */

/** Converte IPv4 pontuado em 4 bytes. Rejeita octeto fora de 0-255 e forma incompleta. */
function ipv4ToBytes(ip: string): Uint8Array | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const bytes = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    if (!/^\d{1,3}$/.test(parts[i])) return null;
    const n = Number(parts[i]);
    if (n > 255) return null;
    bytes[i] = n;
  }
  return bytes;
}

/**
 * Converte IPv6 em 16 bytes, aceitando compressão `::` e cauda IPv4 (`::ffff:1.2.3.4`).
 * Endereço IPv4-mapeado volta como 4 bytes, para que uma regra IPv4 continue valendo
 * — é o mesmo efeito do `.replace('::ffff:', '')` que existia antes.
 */
function ipv6ToBytes(ip: string): Uint8Array | null {
  let text = ip;

  // Identificador de zona (%eth0) não aparece em cf-connecting-ip, mas descartamos.
  const zone = text.indexOf('%');
  if (zone !== -1) text = text.slice(0, zone);

  // Forma híbrida: converte a cauda IPv4 em dois grupos hexadecimais.
  const lastColon = text.lastIndexOf(':');
  if (lastColon === -1) return null;
  const tail = text.slice(lastColon + 1);
  if (tail.includes('.')) {
    const v4 = ipv4ToBytes(tail);
    if (!v4) return null;
    const asHex = `${((v4[0] << 8) | v4[1]).toString(16)}:${((v4[2] << 8) | v4[3]).toString(16)}`;
    text = text.slice(0, lastColon + 1) + asHex;
  }

  const halves = text.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const rear = halves.length === 2 && halves[1] ? halves[1].split(':') : [];

  let groups: string[];
  if (halves.length === 1) {
    if (head.length !== 8) return null;
    groups = head;
  } else {
    const missing = 8 - head.length - rear.length;
    if (missing < 1) return null; // `::` representa ao menos um grupo zerado
    groups = [...head, ...new Array<string>(missing).fill('0'), ...rear];
  }

  const bytes = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    if (!/^[0-9a-f]{1,4}$/.test(groups[i])) return null;
    const n = parseInt(groups[i], 16);
    bytes[i * 2] = n >> 8;
    bytes[i * 2 + 1] = n & 0xff;
  }

  // ::ffff:a.b.c.d — trata como o IPv4 correspondente.
  const isV4Mapped =
    bytes.subarray(0, 10).every((b) => b === 0) && bytes[10] === 0xff && bytes[11] === 0xff;
  return isV4Mapped ? bytes.subarray(12, 16) : bytes;
}

function ipToBytes(ip: string): Uint8Array | null {
  const addr = ip.trim().toLowerCase();
  if (!addr) return null;
  return addr.includes(':') ? ipv6ToBytes(addr) : ipv4ToBytes(addr);
}

/** Compara um IP já convertido contra uma regra única (`endereço` ou `endereço/prefixo`). */
function matchesRule(ipBytes: Uint8Array, rule: string): boolean {
  const slash = rule.indexOf('/');
  const addr = slash === -1 ? rule : rule.slice(0, slash);
  const ruleBytes = ipToBytes(addr);
  if (!ruleBytes) return false;

  // Nunca compara família diferente: uma regra IPv4 não libera um cliente IPv6.
  if (ruleBytes.length !== ipBytes.length) return false;

  const maxBits = ruleBytes.length * 8;
  let bits = maxBits;
  if (slash !== -1) {
    const prefix = rule.slice(slash + 1).trim();
    if (!/^\d{1,3}$/.test(prefix)) return false;
    bits = Number(prefix);
    if (bits > maxBits) return false;
  }

  const wholeBytes = bits >> 3;
  for (let i = 0; i < wholeBytes; i++) {
    if (ipBytes[i] !== ruleBytes[i]) return false;
  }
  const leftoverBits = bits & 7;
  if (leftoverBits !== 0) {
    const mask = (0xff << (8 - leftoverBits)) & 0xff;
    if ((ipBytes[wholeBytes] & mask) !== (ruleBytes[wholeBytes] & mask)) return false;
  }
  return true;
}

/**
 * Diz se `ip` está liberado por alguma entrada de `allowList`.
 * Lista vazia ou IP ilegível negam — a falha aqui é sempre para o lado restritivo.
 */
export function isIpAllowed(ip: string, allowList: string): boolean {
  const ipBytes = ipToBytes(ip);
  if (!ipBytes) return false;
  return allowList
    .split(',')
    .map((rule) => rule.trim())
    .filter(Boolean)
    .some((rule) => matchesRule(ipBytes, rule));
}
