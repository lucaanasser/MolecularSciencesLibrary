const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getLogger } = require('../../shared/logging/logger');
const { ProfileTransformer } = require('./ProfileTransformer');

const log = getLogger(__filename);

/**
 * O que faz: publica perfis no repositorio sandbox via GitHub App e abre PR.
 * Camada: Service.
 * Entradas/Saidas: cmProfile + userId -> resultado de publicacao.
 * Dependencias criticas: axios, jsonwebtoken, git CLI e credenciais do GitHub App.
 * Efeitos colaterais: cria branch, commit, push e pull request no repo sandbox.
 */
class GitHubPublishService {
    constructor(config = {}) {
        this.owner = config.owner || process.env.GITHUB_SANDBOX_OWNER || 'ccm-usp';
        this.repo = config.repo || process.env.GITHUB_SANDBOX_REPO || 'ccm-website-public-sandbox';
        this.defaultBranch = config.defaultBranch || process.env.GITHUB_SANDBOX_BASE_BRANCH || 'main';
        this.installationId = config.installationId || process.env.GITHUB_INSTALLATION_ID || process.env.GH_APP_INSTALLATION_ID;
        this.appId = config.appId || process.env.GH_APP_ID;
        this.privateKey = config.privateKey || process.env.GH_APP_PRIVATE_KEY;
        this.tempRoot = config.tempRoot || path.join(process.cwd(), '.tmp', 'sandbox-publish');
    }

    /**
     * Publica um perfil transformado para o sandbox.
     * @param {Object} cmProfile payload no formato CM
     * @param {number|string} userId id do usuario dono do perfil
     * @returns {Promise<{success:boolean, noChanges?:boolean, prUrl?:string, branchName?:string, filesChanged?:string[], error?:string}>}
     */
    async publishProfile(cmProfile, userId) {
        log.start('Iniciando publicacao em sandbox', {
            owner: this.owner,
            repo: this.repo,
            userId
        });

        this.#ensureConfig();

        const token = await this.#createInstallationToken();
        const repoDir = await this.#prepareRepo(token);
        const branchName = this.#buildBranchName(userId);
        const profileFilePath = ProfileTransformer.generateFilePath(cmProfile.nome, cmProfile.turma);
        const rosterFilePath = `estudantes/${cmProfile.turma}/${cmProfile.turma}.json`;

        this.#checkoutFreshBranch(repoDir, branchName);
        this.#writeJsonFile(repoDir, profileFilePath, cmProfile);
        this.#upsertRoster(repoDir, rosterFilePath, cmProfile);

        const filesChanged = this.#commitAndPushIfNeeded(repoDir, branchName, [profileFilePath, rosterFilePath], cmProfile.nome, cmProfile.turma);

        if (!filesChanged.length) {
            log.warn('Publicacao sem alteracoes', { userId, turma: cmProfile.turma });
            return {
                success: true,
                noChanges: true,
                branchName,
                filesChanged: []
            };
        }

        const prUrl = await this.#openPullRequest(token, branchName, cmProfile.nome, cmProfile.turma, filesChanged);

        log.success('Publicacao em sandbox concluida', {
            branchName,
            filesChanged: filesChanged.length
        });

        return {
            success: true,
            branchName,
            prUrl,
            filesChanged
        };
    }

    #ensureConfig() {
        if (!this.appId || !this.privateKey) {
            throw new Error('Credenciais GitHub App ausentes: GH_APP_ID, GH_APP_PRIVATE_KEY');
        }
    }

    async #createInstallationToken() {
        log.start('Gerando token de instalacao do GitHub App');
        const appJwt = this.#buildAppJwt();
        const installationId = this.installationId || await this.#resolveInstallationId(appJwt);

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

    async #resolveInstallationId(appJwt) {
        log.start('Resolvendo installation id do GitHub App automaticamente', {
            owner: this.owner,
            repo: this.repo
        });

        try {
            const response = await axios.get(
                `https://api.github.com/repos/${this.owner}/${this.repo}/installation`,
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

            this.installationId = installationId;
            log.success('Installation id resolvido automaticamente', { installationId });
            return installationId;
        } catch (error) {
            const message = error?.response?.data?.message || error.message;
            throw new Error(
                `Nao foi possivel resolver GITHUB_INSTALLATION_ID automaticamente para ${this.owner}/${this.repo}: ${message}`
            );
        }
    }

    #buildAppJwt() {
        const now = Math.floor(Date.now() / 1000);
        const keyObject = this.#buildPrivateKeyObject(this.privateKey);

        return jwt.sign(
            {
                iat: now - 60,
                exp: now + 9 * 60,
                iss: this.appId
            },
            keyObject,
            { algorithm: 'RS256' }
        );
    }

    #buildPrivateKeyObject(rawKey) {
        const normalizedPem = this.#normalizePrivateKey(rawKey);
        const pemType = this.#detectPemType(normalizedPem);

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

    #detectPemType(pem) {
        const content = String(pem || '');
        if (content.includes('BEGIN RSA PRIVATE KEY')) {
            return 'pkcs1';
        }
        if (content.includes('BEGIN PRIVATE KEY')) {
            return 'pkcs8';
        }
        return '';
    }

    #normalizePrivateKey(rawKey) {
        let key = String(rawKey || '').trim();

        if (!key) {
            throw new Error('GH_APP_PRIVATE_KEY ausente');
        }

        // Allow pointing GH_APP_PRIVATE_KEY to a PEM file path to avoid multiline .env issues.
        const resolvedKeyPath = this.#resolveExistingKeyPath(key);
        if (resolvedKeyPath) {
            key = fs.readFileSync(resolvedKeyPath, 'utf8').trim();
        }

        if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
            key = key.slice(1, -1);
        }

        const maybeBase64 = this.#decodeBase64Safely(key);
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

    #looksLikeFilePath(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed) return false;
        if (trimmed.startsWith('/')) return true;
        if (trimmed.startsWith('./') || trimmed.startsWith('../')) return true;
        return trimmed.endsWith('.pem') || trimmed.endsWith('.key');
    }

    #resolveExistingKeyPath(value) {
        const trimmed = String(value || '').trim();
        if (!this.#looksLikeFilePath(trimmed)) {
            return '';
        }

        const candidates = [
            trimmed,
            path.resolve(process.cwd(), trimmed),
            path.resolve(__dirname, '../../..', trimmed),
            path.resolve(__dirname, '../../../..', trimmed)
        ];

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }

        return '';
    }

    #decodeBase64Safely(value) {
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

    async #prepareRepo(token) {
        const repoDir = path.join(this.tempRoot, `${this.owner}-${this.repo}`);
        const remoteUrl = `https://x-access-token:${token}@github.com/${this.owner}/${this.repo}.git`;

        fs.mkdirSync(this.tempRoot, { recursive: true });

        if (!fs.existsSync(repoDir)) {
            log.start('Clonando repositorio sandbox', { repoDir });
            execSync(`git clone --depth 20 ${remoteUrl} ${repoDir}`, { stdio: 'pipe' });
        } else {
            log.start('Atualizando clone local do sandbox', { repoDir });
            execSync(`git -C ${this.#q(repoDir)} remote set-url origin ${this.#q(remoteUrl)}`, { stdio: 'pipe' });
            execSync(`git -C ${this.#q(repoDir)} fetch origin ${this.defaultBranch} --prune`, { stdio: 'pipe' });
            execSync(`git -C ${this.#q(repoDir)} checkout ${this.defaultBranch}`, { stdio: 'pipe' });
            execSync(`git -C ${this.#q(repoDir)} reset --hard origin/${this.defaultBranch}`, { stdio: 'pipe' });
        }

        return repoDir;
    }

    #checkoutFreshBranch(repoDir, branchName) {
        log.start('Criando branch de publicacao', { branchName });
        execSync(`git -C ${this.#q(repoDir)} checkout -B ${this.#q(branchName)} origin/${this.defaultBranch}`, { stdio: 'pipe' });
    }

    #writeJsonFile(repoDir, relativePath, data) {
        const filePath = path.join(repoDir, relativePath);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
        log.success('Arquivo de perfil atualizado', { relativePath });
    }

    #upsertRoster(repoDir, relativePath, cmProfile) {
        const filePath = path.join(repoDir, relativePath);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        const roster = this.#readJsonOrFallback(filePath, { turma: cmProfile.turma, students: [] });
        const updated = this.#upsertRosterEntry(roster, cmProfile.nome);

        fs.writeFileSync(filePath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
        log.success('Roster atualizado', { relativePath });
    }

    #upsertRosterEntry(roster, nome) {
        if (Array.isArray(roster)) {
            const idx = roster.findIndex((item) => this.#normalizeName(item.nome || item.name) === this.#normalizeName(nome));
            const base = { nome, hasPage: true };
            if (idx >= 0) roster[idx] = { ...roster[idx], ...base };
            else roster.push(base);
            return roster;
        }

        const listKey = Array.isArray(roster.students)
            ? 'students'
            : Array.isArray(roster.alunos)
                ? 'alunos'
                : 'students';

        if (!Array.isArray(roster[listKey])) roster[listKey] = [];

        const idx = roster[listKey].findIndex((item) => this.#normalizeName(item.nome || item.name) === this.#normalizeName(nome));
        const base = { nome, hasPage: true };

        if (idx >= 0) {
            roster[listKey][idx] = { ...roster[listKey][idx], ...base };
        } else {
            roster[listKey].push(base);
        }

        if (!roster.turma) roster.turma = String(roster.turma || '').trim() || undefined;
        return roster;
    }

    #commitAndPushIfNeeded(repoDir, branchName, candidateFiles, nome, turma) {
        execSync(`git -C ${this.#q(repoDir)} add .`, { stdio: 'pipe' });

        const changedLines = execSync(`git -C ${this.#q(repoDir)} status --porcelain`, { stdio: 'pipe' })
            .toString()
            .trim();

        if (!changedLines) {
            return [];
        }

        const filesChanged = changedLines
            .split('\n')
            .map((line) => line.slice(3).trim())
            .filter(Boolean)
            .filter((file) => candidateFiles.includes(file));

        execSync(`git -C ${this.#q(repoDir)} config user.email "biblioteca-cm-bot@users.noreply.github.com"`, { stdio: 'pipe' });
        execSync(`git -C ${this.#q(repoDir)} config user.name "Biblioteca CM Bot"`, { stdio: 'pipe' });
        execSync(
            `git -C ${this.#q(repoDir)} commit -m ${this.#q(`feat(profile): publica ${nome} (${turma}) no sandbox`)}`,
            { stdio: 'pipe' }
        );
        execSync(`git -C ${this.#q(repoDir)} push origin ${this.#q(branchName)} --force-with-lease`, { stdio: 'pipe' });

        log.success('Commit e push realizados', { branchName, filesChanged: filesChanged.length });
        return filesChanged;
    }

    async #openPullRequest(token, branchName, nome, turma, filesChanged) {
        log.start('Abrindo pull request no sandbox', { branchName });

        const response = await axios.post(
            `https://api.github.com/repos/${this.owner}/${this.repo}/pulls`,
            {
                title: `feat(profile): ${nome} (${turma})`,
                head: branchName,
                base: this.defaultBranch,
                body: [
                    'Publicacao automatica iniciada pela BibliotecaCM.',
                    '',
                    `- Turma: ${turma}`,
                    `- Arquivos alterados: ${filesChanged.join(', ')}`
                ].join('\n')
            },
            {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        );

        const prUrl = response.data && response.data.html_url;
        log.success('Pull request aberta', { prUrl });
        return prUrl;
    }

    #readJsonOrFallback(filePath, fallback) {
        if (!fs.existsSync(filePath)) return fallback;

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            log.warn('Nao foi possivel parsear JSON existente, usando fallback', {
                filePath,
                error: error.message
            });
            return fallback;
        }
    }

    #normalizeName(name) {
        return String(name || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    #buildBranchName(userId) {
        const seed = crypto.randomBytes(3).toString('hex');
        return `feature/profile-${userId}-${Date.now()}-${seed}`;
    }

    #q(value) {
        return `'${String(value).replace(/'/g, `'"'"'`)}'`;
    }
}

module.exports = GitHubPublishService;