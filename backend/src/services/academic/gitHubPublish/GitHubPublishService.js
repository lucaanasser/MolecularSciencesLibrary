/**
 * O que faz: publica perfis no repositorio sandbox via GitHub App e abre PR.
 * Camada: Service (orquestrador; logica extraida para ./modules/*).
 * Entradas/Saidas: cmProfile + userId -> resultado de publicacao.
 * Dependencias criticas: axios, jsonwebtoken, git CLI e credenciais do GitHub App.
 * Efeitos colaterais: cria branch, commit, push e pull request no repo sandbox.
 */
const path = require('path');
const { getLogger } = require('../../../shared/logging/logger');
const { ProfileTransformer } = require('../ProfileTransformer');
const { ensureConfig, createInstallationToken } = require('./modules/githubAppAuth');
const {
    prepareRepo,
    buildBranchName,
    checkoutFreshBranch,
    commitAndPushIfNeeded
} = require('./modules/sandboxGitOps');
const {
    writeJsonFile,
    upsertRoster,
    syncProfilePhotos,
    writeAdvancedPdfs,
    cleanupGeneratedFiles
} = require('./modules/sandboxFileWriter');
const { openPullRequest } = require('./modules/pullRequest');

const log = getLogger(__filename);

class GitHubPublishService {
    // Le config/env e monta o estado (owner/repo/branch/credenciais/tempRoot).
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
    async publishProfile(cmProfile, userId, options = {}) {
        log.start('Iniciando publicacao em sandbox', {
            owner: this.owner,
            repo: this.repo,
            userId
        });

        ensureConfig(this);

        const token = await createInstallationToken(this);
        const repoDir = await prepareRepo(this, token);
        const branchName = buildBranchName(userId);
        const profileFilePath = ProfileTransformer.generateFilePath(cmProfile.nome, cmProfile.turma);
        const rosterFilePath = `estudantes/${cmProfile.turma}/${cmProfile.turma}.json`;
        const advancedPdfEntries = Array.isArray(options?.advancedPdfEntries) ? options.advancedPdfEntries : [];
        let pdfFilePaths = [];

        try {
            checkoutFreshBranch(this, repoDir, branchName);
            writeJsonFile(repoDir, profileFilePath, cmProfile);
            upsertRoster(repoDir, rosterFilePath, cmProfile);
            const photoFilePaths = syncProfilePhotos(repoDir, cmProfile);
            pdfFilePaths = await writeAdvancedPdfs(repoDir, cmProfile, advancedPdfEntries);

            const filesChanged = commitAndPushIfNeeded(
                repoDir,
                branchName,
                [profileFilePath, rosterFilePath, ...photoFilePaths, ...pdfFilePaths],
                cmProfile.nome,
                cmProfile.turma
            );

            if (!filesChanged.length) {
                log.warn('Publicacao sem alteracoes', { userId, turma: cmProfile.turma });
                return {
                    success: true,
                    noChanges: true,
                    branchName,
                    filesChanged: []
                };
            }

            const prUrl = await openPullRequest(this, token, branchName, cmProfile.nome, cmProfile.turma, filesChanged);

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
        } finally {
            cleanupGeneratedFiles(repoDir, pdfFilePaths);
        }
    }
}

module.exports = GitHubPublishService;
