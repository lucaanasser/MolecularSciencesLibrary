/**
 * O que faz: autenticacao GitHub App (JWT/PEM) e emissao de token de instalacao.
 * Camada: Service (funcoes extraidas de GitHubPublishService; recebem cfg por parametro).
 * Entradas/Saidas: cfg (appId/privateKey/installationId/owner/repo) -> token e JWT.
 * Dependencias criticas: axios, jsonwebtoken, crypto e credenciais do GitHub App.
 * Observacao: SERVICE_DIR reconstroi o diretorio original (academic) para manter a
 * resolucao dos caminhos de PEM identica apos mover o arquivo para modules/.
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

// Diretorio original do service (academic), preservado para resolucao identica de paths.
const SERVICE_DIR = path.resolve(__dirname, '../..');

// Garante presenca das credenciais minimas do GitHub App (appId + privateKey).
function ensureConfig(cfg) {
    if (!cfg.appId || !cfg.privateKey) {
        throw new Error('Credenciais GitHub App ausentes: GH_APP_ID, GH_APP_PRIVATE_KEY');
    }
}

// Gera o token de instalacao do GitHub App a partir do JWT do App.
async function createInstallationToken(cfg) {
    log.start('Gerando token de instalacao do GitHub App');
    const appJwt = buildAppJwt(cfg);
    const installationId = cfg.installationId || await resolveInstallationId(appJwt, cfg);
    const response = await axios.post(
        `https://api.github.com/app/installations/${installationId}/access_tokens`,
        {},
        {
            headers: {
                Authorization: `Bearer ${appJwt}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }
    );
    const token = response.data && response.data.token;
    if (!token) {
        throw new Error('Nao foi possivel obter token de instalacao do GitHub App');
    }
    log.success('Token de instalacao gerado');
    return token;
}

// Resolve o installation id automaticamente via API e o memoriza em cfg.
async function resolveInstallationId(appJwt, cfg) {
    log.start('Resolvendo installation id do GitHub App automaticamente', {
        owner: cfg.owner,
        repo: cfg.repo
    });
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/installation`,
            {
                headers: {
                    Authorization: `Bearer ${appJwt}`,
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        );
        const installationId = response.data && response.data.id;
        if (!installationId) {
            throw new Error('Resposta da API sem id de instalacao');
        }
        cfg.installationId = installationId;
        log.success('Installation id resolvido automaticamente', { installationId });
        return installationId;
    } catch (error) {
        const message = error?.response?.data?.message || error.message;
        throw new Error(
            `Nao foi possivel resolver GITHUB_INSTALLATION_ID automaticamente para ${cfg.owner}/${cfg.repo}: ${message}`
        );
    }
}

// Monta o JWT assinado (RS256) exigido pela API do GitHub App.
function buildAppJwt(cfg) {
    const now = Math.floor(Date.now() / 1000);
    const keyObject = buildPrivateKeyObject(cfg.privateKey);
    return jwt.sign(
        {
            iat: now - 60,
            exp: now + 9 * 60,
            iss: cfg.appId
        },
        keyObject,
        { algorithm: 'RS256' }
    );
}

// Converte o PEM (normalizado) em objeto de chave privada do crypto.
function buildPrivateKeyObject(rawKey) {
    const normalizedPem = normalizePrivateKey(rawKey);
    const pemType = detectPemType(normalizedPem);
    try {
        return crypto.createPrivateKey(
            pemType
                ? {
                    key: normalizedPem,
                    format: 'pem',
                    type: pemType
                }
                : {
                    key: normalizedPem,
                    format: 'pem'
                }
        );
    } catch (error) {
        throw new Error(`GH_APP_PRIVATE_KEY invalida para RS256: ${error.message}`);
    }
}

// Detecta o tipo do PEM (pkcs1/pkcs8) a partir do cabecalho.
function detectPemType(pem) {
    const content = String(pem || '');
    if (content.includes('BEGIN RSA PRIVATE KEY')) {
        return 'pkcs1';
    }
    if (content.includes('BEGIN PRIVATE KEY')) {
        return 'pkcs8';
    }
    return '';
}

// Normaliza a chave privada aceitando path de arquivo, base64 e \n escapado.
function normalizePrivateKey(rawKey) {
    let key = String(rawKey || '').trim();
    if (!key) {
        throw new Error('GH_APP_PRIVATE_KEY ausente');
    }
    // Allow pointing GH_APP_PRIVATE_KEY to a PEM file path to avoid multiline .env issues.
    const resolvedKeyPath = resolveExistingKeyPath(key);
    if (resolvedKeyPath) {
        key = fs.readFileSync(resolvedKeyPath, 'utf8').trim();
    }
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1);
    }
    const maybeBase64 = decodeBase64Safely(key);
    if (maybeBase64 && maybeBase64.includes('BEGIN') && maybeBase64.includes('PRIVATE KEY')) {
        key = maybeBase64;
    }
    key = key
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .trim();
    if (!key.includes('-----BEGIN') || !key.includes('PRIVATE KEY-----')) {
        throw new Error('formato esperado: chave PEM (BEGIN/END PRIVATE KEY), com quebras reais ou \\n escapado');
    }
    return key;
}

// Heuristica: o valor aparenta ser um caminho de arquivo (.pem/.key ou path).
function looksLikeFilePath(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('/')) return true;
    if (trimmed.startsWith('./') || trimmed.startsWith('../')) return true;
    return trimmed.endsWith('.pem') || trimmed.endsWith('.key');
}

// Resolve um caminho de PEM existente entre candidatos (cwd e SERVICE_DIR).
function resolveExistingKeyPath(value) {
    const trimmed = String(value || '').trim();
    if (!looksLikeFilePath(trimmed)) {
        return '';
    }
    const candidates = [
        trimmed,
        path.resolve(process.cwd(), trimmed),
        path.resolve(SERVICE_DIR, '../../..', trimmed),
        path.resolve(SERVICE_DIR, '../../../..', trimmed)
    ];
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return '';
}

// Decodifica base64 de forma segura, retornando '' quando invalido.
function decodeBase64Safely(value) {
    const compact = String(value || '').replace(/\s+/g, '');
    if (!compact || compact.length % 4 !== 0) {
        return '';
    }
    if (!/^[A-Za-z0-9+/=]+$/.test(compact)) {
        return '';
    }
    try {
        return Buffer.from(compact, 'base64').toString('utf8');
    } catch {
        return '';
    }
}

module.exports = {
    ensureConfig,
    createInstallationToken,
    resolveInstallationId,
    buildAppJwt,
    buildPrivateKeyObject,
    detectPemType,
    normalizePrivateKey,
    looksLikeFilePath,
    resolveExistingKeyPath,
    decodeBase64Safely
};
