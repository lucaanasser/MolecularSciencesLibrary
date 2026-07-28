/**
 * O que faz: abre o pull request de publicacao no repo sandbox.
 * Camada: Service (funcao extraida de GitHubPublishService; recebe cfg por parametro).
 * Entradas/Saidas: cfg + branch/arquivos -> URL do PR criado.
 * Dependencias criticas: axios e token de instalacao do GitHub App.
 */
const axios = require('axios');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

// Abre o PR da branch de publicacao contra a branch base do sandbox.
async function openPullRequest(cfg, token, branchName, nome, turma, filesChanged) {
    log.start('Abrindo pull request no sandbox', { branchName });

    const response = await axios.post(
        `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/pulls`,
        {
            title: `feat(profile): ${nome} (${turma})`,
            head: branchName,
            base: cfg.defaultBranch,
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

module.exports = { openPullRequest };
