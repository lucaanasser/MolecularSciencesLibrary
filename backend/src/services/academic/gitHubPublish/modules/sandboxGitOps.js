/**
 * O que faz: operacoes de git CLI sobre o clone local do repo sandbox.
 * Camada: Service (funcoes extraidas de GitHubPublishService; recebem cfg/repoDir por parametro).
 * Entradas/Saidas: cfg + repoDir/branch -> efeitos em disco/remote (clone/commit/push).
 * Dependencias criticas: git CLI (execSync), fs, crypto.
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

// Clona (ou atualiza) o repo sandbox e retorna o diretorio local.
async function prepareRepo(cfg, token) {
    const repoDir = path.join(cfg.tempRoot, `${cfg.owner}-${cfg.repo}`);
    const remoteUrl = `https://x-access-token:${token}@github.com/${cfg.owner}/${cfg.repo}.git`;

    fs.mkdirSync(cfg.tempRoot, { recursive: true });

    if (!fs.existsSync(repoDir)) {
        log.start('Clonando repositorio sandbox', { repoDir });
        execSync(`git clone --depth 20 ${remoteUrl} ${repoDir}`, { stdio: 'pipe' });
    } else {
        log.start('Atualizando clone local do sandbox', { repoDir });
        execSync(`git -C ${q(repoDir)} remote set-url origin ${q(remoteUrl)}`, { stdio: 'pipe' });
        execSync(`git -C ${q(repoDir)} fetch origin ${cfg.defaultBranch} --prune`, { stdio: 'pipe' });
        execSync(`git -C ${q(repoDir)} checkout ${cfg.defaultBranch}`, { stdio: 'pipe' });
        execSync(`git -C ${q(repoDir)} reset --hard origin/${cfg.defaultBranch}`, { stdio: 'pipe' });
    }

    return repoDir;
}

// Cria/reposiciona a branch de publicacao a partir da base remota.
function checkoutFreshBranch(cfg, repoDir, branchName) {
    log.start('Criando branch de publicacao', { branchName });
    execSync(`git -C ${q(repoDir)} checkout -B ${q(branchName)} origin/${cfg.defaultBranch}`, { stdio: 'pipe' });
}

// Faz add/commit/push apenas quando houver alteracoes; retorna arquivos alterados.
function commitAndPushIfNeeded(repoDir, branchName, candidateFiles, nome, turma) {
    execSync(`git -C ${q(repoDir)} add .`, { stdio: 'pipe' });

    const changedLines = execSync(`git -C ${q(repoDir)} status --porcelain`, { stdio: 'pipe' })
        .toString()
        .trim();

    if (!changedLines) {
        return [];
    }

    const filesChanged = changedLines
        .split('\n')
        .map((line) => line.slice(3).trim())
        .filter(Boolean);

    execSync(`git -C ${q(repoDir)} config user.email "biblioteca-cm-bot@users.noreply.github.com"`, { stdio: 'pipe' });
    execSync(`git -C ${q(repoDir)} config user.name "Biblioteca CM Bot"`, { stdio: 'pipe' });
    execSync(
        `git -C ${q(repoDir)} commit -m ${q(`feat(profile): publica ${nome} (${turma}) no sandbox`)}`,
        { stdio: 'pipe' }
    );
    execSync(`git -C ${q(repoDir)} push origin ${q(branchName)} --force-with-lease`, { stdio: 'pipe' });

    log.success('Commit e push realizados', { branchName, filesChanged: filesChanged.length });
    return filesChanged;
}

// Gera nome de branch unico para a publicacao do perfil.
function buildBranchName(userId) {
    const seed = crypto.randomBytes(3).toString('hex');
    return `feature/profile-${userId}-${Date.now()}-${seed}`;
}

// Escapa um valor para uso seguro em shell (aspas simples).
function q(value) {
    return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

module.exports = {
    prepareRepo,
    checkoutFreshBranch,
    commitAndPushIfNeeded,
    buildBranchName,
    q
};
