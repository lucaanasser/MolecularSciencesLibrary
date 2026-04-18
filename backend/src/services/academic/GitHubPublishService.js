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
        if (!this.appId || !this.privateKey || !this.installationId) {
            throw new Error('Credenciais GitHub App ausentes: GH_APP_ID, GH_APP_PRIVATE_KEY, GITHUB_INSTALLATION_ID');
        }
    }

    async #createInstallationToken() {
        log.start('Gerando token de instalacao do GitHub App');
        const appJwt = this.#buildAppJwt();

        const response = await axios.post(
            `https://api.github.com/app/installations/${this.installationId}/access_tokens`,
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

    #buildAppJwt() {
        const now = Math.floor(Date.now() / 1000);
        const key = String(this.privateKey).replace(/\\n/g, '\n');

        return jwt.sign(
            {
                iat: now - 60,
                exp: now + 9 * 60,
                iss: this.appId
            },
            key,
            { algorithm: 'RS256' }
        );
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