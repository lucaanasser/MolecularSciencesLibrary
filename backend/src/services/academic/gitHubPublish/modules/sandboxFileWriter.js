/**
 * O que faz: escrita/atualizacao de arquivos do perfil no clone do repo sandbox.
 * Camada: Service (funcoes extraidas de GitHubPublishService; recebem repoDir/dados por parametro).
 * Entradas/Saidas: repoDir + cmProfile -> arquivos JSON/foto/PDF e roster.
 * Dependencias criticas: fs, ProfileTransformer, AdvancedPdfService.
 * Observacao: SERVICE_DIR reconstroi o diretorio original (academic) para manter a
 * resolucao das fotos identica apos mover o arquivo para modules/.
 */
const path = require('path');
const fs = require('fs');
const { getLogger } = require('../../../../shared/logging/logger');
const { ProfileTransformer } = require('../../profileTransformer/ProfileTransformer');
const AdvancedPdfService = require('../../advancedPdf/AdvancedPdfService');

const log = getLogger(__filename);

// Diretorio original do service (academic), preservado para resolucao identica de paths.
const SERVICE_DIR = path.resolve(__dirname, '../..');

// Escreve um objeto como JSON formatado no caminho relativo do repo.
function writeJsonFile(repoDir, relativePath, data) {
    const filePath = path.join(repoDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    log.success('Arquivo de perfil atualizado', { relativePath });
}

// Le/gera o roster da turma e insere/atualiza a entrada do aluno.
function upsertRoster(repoDir, relativePath, cmProfile) {
    const filePath = path.join(repoDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const roster = readJsonOrFallback(filePath, { turma: cmProfile.turma, students: [] });
    const updated = upsertRosterEntry(roster, cmProfile.nome);

    fs.writeFileSync(filePath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
    log.success('Roster atualizado', { relativePath });
}

// Insere/atualiza a entrada do aluno no roster (array direto ou objeto com lista).
function upsertRosterEntry(roster, nome) {
    if (Array.isArray(roster)) {
        const idx = roster.findIndex((item) => normalizeName(item.nome || item.name) === normalizeName(nome));
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

    const idx = roster[listKey].findIndex((item) => normalizeName(item.nome || item.name) === normalizeName(nome));
    const base = { nome, hasPage: true };

    if (idx >= 0) {
        roster[listKey][idx] = { ...roster[listKey][idx], ...base };
    } else {
        roster[listKey].push(base);
    }

    if (!roster.turma) roster.turma = String(roster.turma || '').trim() || undefined;
    return roster;
}

// Copia as fotos (jpg/@2x) do perfil para a pasta da turma no repo.
function syncProfilePhotos(repoDir, cmProfile) {
    if (!cmProfile || !cmProfile.hasPhoto) {
        return [];
    }

    const turma = String(cmProfile.turma || '').trim();
    const slug = ProfileTransformer.generateSlug(cmProfile.nome);
    const sourceDir = path.resolve(SERVICE_DIR, '../../../public/images/user-images');
    const variants = [`${slug}.jpg`, `${slug}@2x.jpg`];
    const copiedFiles = [];

    for (const filename of variants) {
        const sourcePath = path.join(sourceDir, filename);
        if (!fs.existsSync(sourcePath)) {
            continue;
        }

        const relativeTargetPath = path.posix.join('estudantes', turma, filename);
        const targetPath = path.join(repoDir, relativeTargetPath);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.copyFileSync(sourcePath, targetPath);
        copiedFiles.push(relativeTargetPath);
        log.success('Foto sincronizada para sandbox', { relativeTargetPath });
    }

    if (!copiedFiles.length) {
        log.warn('Perfil indica hasPhoto=true, mas nenhum arquivo de foto foi encontrado em user-images', {
            slug,
            turma,
            sourceDir
        });
    }

    return copiedFiles;
}

// Gera e grava os PDFs de ciclo avancado, retornando seus caminhos relativos.
async function writeAdvancedPdfs(repoDir, cmProfile, entries) {
    if (!Array.isArray(entries) || !entries.length) {
        return [];
    }

    const turma = String(cmProfile.turma || '').trim();
    const studentName = cmProfile.nome;
    const pdfPaths = [];

    for (const entry of entries) {
        const relativeTargetPath = path.posix.join('estudantes', turma, entry.fileName);
        const targetPath = path.join(repoDir, relativeTargetPath);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        const pdfBuffer = await AdvancedPdfService.generateAdvancedPdf({
            studentName,
            turma,
            cycle: entry.cycle,
            disciplines: entry.disciplines,
            experiences: entry.experiences
        });

        fs.writeFileSync(targetPath, pdfBuffer);
        pdfPaths.push(relativeTargetPath);
        log.success('PDF de ciclo avancado salvo', { relativeTargetPath });
    }

    return pdfPaths;
}

// Remove os arquivos gerados localmente (PDFs) apos a publicacao.
function cleanupGeneratedFiles(repoDir, relativePaths) {
    if (!Array.isArray(relativePaths) || !relativePaths.length) {
        return;
    }

    relativePaths.forEach((relativePath) => {
        const absolutePath = path.join(repoDir, relativePath);
        try {
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        } catch (error) {
            log.warn('Falha ao remover PDF gerado localmente', {
                relativePath,
                error: error.message
            });
        }
    });
}

// Le JSON existente ou retorna o fallback quando ausente/invalido.
function readJsonOrFallback(filePath, fallback) {
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

// Normaliza nome para comparacao (lower, sem acentos, trim).
function normalizeName(name) {
    return String(name || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

module.exports = {
    writeJsonFile,
    upsertRoster,
    upsertRosterEntry,
    syncProfilePhotos,
    writeAdvancedPdfs,
    cleanupGeneratedFiles,
    readJsonOrFallback,
    normalizeName
};
