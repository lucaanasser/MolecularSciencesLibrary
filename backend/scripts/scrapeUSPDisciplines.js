#!/usr/bin/env node
/**
 * Script de Scraping de Disciplinas da USP (JupiterWeb)
 * 
 * Baseado no script Python do MatrUSP, adaptado para Node.js
 * e salvando diretamente no banco SQLite da BibliotecaCM.
 * 
 * Uso:
 *   node scrapeUSPDisciplines.js [opções]
 * 
 * Opções:
 *   -u, --unidades <codigos>   Códigos de unidades específicas (separados por vírgula)
 *   -s, --simultaneidade <n>   Número de requisições simultâneas (padrão: 20)
 *   -t, --timeout <ms>         Timeout das requisições em ms (padrão: 60000)
 *   -v, --verbose              Modo verboso
 *   --dry-run                  Não salva no banco, apenas mostra o que seria salvo
 *   --clear                    Limpa dados existentes antes de iniciar
 * 
 * Exemplo:
 *   node scrapeUSPDisciplines.js -u 45,3 -v
 *   node scrapeUSPDisciplines.js --clear -s 10
 */

// Corrige ReferenceError: File is not defined para undici/fetch
const { File, FormData, Blob } = require('formdata-node');
global.File = File;
global.FormData = FormData;
global.Blob = Blob;

const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Importar o service para salvar no banco
const DisciplinesService = require('../src/services/DisciplinesService');

// ===================== CONFIGURAÇÃO =====================

const CONFIG = {
    baseUrl: 'https://uspdigital.usp.br/jupiterweb',
    userAgent: 'BibliotecaCM-Scraper/1.0 (+https://github.com/lucaanasser/MolecularSciencesLibrary)',
    simultaneidade: 3,   // Reduzido para evitar bloqueio do JupiterWeb (3-5 é seguro)
    timeout: 30000,      // 30 segundos é suficiente
    retryAttempts: 3,    // 3 tentativas
    retryDelay: 2000,    // 2 segundos entre tentativas
    delayEntreRequisicoes: 200, // 200ms entre cada requisição para evitar rate limit
};

// Mapeamento de códigos de unidade para campus
const CAMPUS_POR_UNIDADE = {
    // São Paulo
    86: "São Paulo", 27: "São Paulo", 39: "São Paulo", 7: "São Paulo",
    22: "São Paulo", 3: "São Paulo", 16: "São Paulo", 9: "São Paulo",
    2: "São Paulo", 12: "São Paulo", 48: "São Paulo", 8: "São Paulo",
    5: "São Paulo", 10: "São Paulo", 67: "São Paulo", 23: "São Paulo",
    6: "São Paulo", 66: "São Paulo", 14: "São Paulo", 26: "São Paulo",
    93: "São Paulo", 41: "São Paulo", 92: "São Paulo", 42: "São Paulo",
    4: "São Paulo", 37: "São Paulo", 43: "São Paulo", 44: "São Paulo",
    45: "São Paulo", 83: "São Paulo", 47: "São Paulo", 46: "São Paulo",
    87: "São Paulo", 21: "São Paulo", 31: "São Paulo", 85: "São Paulo",
    71: "São Paulo", 32: "São Paulo", 38: "São Paulo", 33: "São Paulo",
    // Ribeirão Preto
    98: "Ribeirão Preto", 94: "Ribeirão Preto", 60: "Ribeirão Preto",
    89: "Ribeirão Preto", 81: "Ribeirão Preto", 59: "Ribeirão Preto",
    96: "Ribeirão Preto", 91: "Ribeirão Preto", 17: "Ribeirão Preto",
    58: "Ribeirão Preto", 95: "Ribeirão Preto",
    // Lorena
    88: "Lorena",
    // São Carlos
    18: "São Carlos", 97: "São Carlos", 99: "São Carlos", 55: "São Carlos",
    76: "São Carlos", 75: "São Carlos", 90: "São Carlos",
    // Piracicaba
    11: "Piracicaba", 64: "Piracicaba",
    // Bauru
    25: "Bauru", 61: "Bauru",
    // Pirassununga
    74: "Pirassununga",
    // São Sebastião
    30: "São Sebastião"
};

// Dicionário global de unidades (nome -> código)
let codigosUnidades = {};
// Dicionário reverso (código -> nome)
let nomesUnidades = {};

// ===================== LOGGING =====================

class Logger {
    constructor(verbose = false) {
        this.verbose = verbose;
        this.startTime = Date.now();
    }

    info(msg) {
        console.log(`🔵 ${msg}`);
    }

    success(msg) {
        console.log(`🟢 ${msg}`);
    }

    warn(msg) {
        console.log(`🟡 ${msg}`);
    }

    error(msg) {
        console.error(`🔴 ${msg}`);
    }

    debug(msg) {
        if (this.verbose) {
            console.log(`   ${msg}`);
        }
    }

    elapsed() {
        return ((Date.now() - this.startTime) / 1000).toFixed(2);
    }
}

let logger;

// ===================== HTTP CLIENT =====================

const httpClient = axios.create({
    baseURL: CONFIG.baseUrl,
    timeout: CONFIG.timeout,
    headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    },
    // Ignorar erros de certificado SSL (como no script original)
    httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    // JupiterWeb usa ISO-8859-1, precisamos converter para UTF-8
    responseType: 'arraybuffer',
    responseEncoding: 'binary'
});

/**
 * Converte buffer ISO-8859-1 para string UTF-8
 */
function decodeResponse(buffer) {
    // Tentar detectar encoding do HTML ou assumir ISO-8859-1 (padrão do JupiterWeb)
    const iconv = require('iconv-lite');
    return iconv.decode(Buffer.from(buffer), 'iso-8859-1');
}

async function fetchWithRetry(url, retries = CONFIG.retryAttempts) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await httpClient.get(url);
            return decodeResponse(response.data);
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }
            // Backoff exponencial: 3s, 6s, 12s, 24s...
            const delay = CONFIG.retryDelay * Math.pow(2, attempt);
            logger.warn(`Tentativa ${attempt + 1} falhou para ${url}. Aguardando ${delay/1000}s...`);
            await sleep(delay);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================== SEMÁFORO PARA CONTROLE DE CONCORRÊNCIA =====================

class Semaphore {
    constructor(max) {
        this.max = max;
        this.current = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.current < this.max) {
            this.current++;
            return;
        }
        await new Promise(resolve => this.queue.push(resolve));
        this.current++;
    }

    release() {
        this.current--;
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            next();
        }
    }

    async run(fn) {
        await this.acquire();
        try {
            // Adiciona delay entre requisições para evitar rate limiting
            await sleep(CONFIG.delayEntreRequisicoes);
            return await fn();
        } finally {
            this.release();
        }
    }
}

// ===================== PARSING DE HTML =====================

/**
 * Obtém a lista de unidades de ensino
 */
async function obterUnidades() {
    logger.info('Obtendo lista de unidades de ensino...');
    
    const html = await fetchWithRetry('/jupColegiadoLista?tipo=T');
    const $ = cheerio.load(html);
    
    const unidades = {};
    $('a[href*="jupColegiadoMenu"]').each((_, el) => {
        const href = $(el).attr('href');
        const nome = $(el).text().trim();
        const match = href.match(/codcg=(\d+)/);
        if (match && nome) {
            unidades[nome] = match[1];
            nomesUnidades[match[1]] = nome; // Mapeamento reverso
        }
    });
    
    codigosUnidades = unidades;
    logger.success(`${Object.keys(unidades).length} unidades encontradas`);
    return unidades;
}

/**
 * Obtém a lista de disciplinas de uma unidade
 */
async function obterDisciplinasUnidade(codigoUnidade) {
    logger.debug(`Obtendo disciplinas da unidade ${codigoUnidade}...`);
    
    const html = await fetchWithRetry(`/jupDisciplinaLista?letra=A-Z&tipo=T&codcg=${codigoUnidade}`);
    const $ = cheerio.load(html);
    
    const disciplinas = [];
    $('a[href*="obterTurma"]').each((_, el) => {
        const href = $(el).attr('href');
        const nome = $(el).text().trim();
        const match = href.match(/sgldis=([A-Z0-9\s]{7})/);
        if (match) {
            disciplinas.push({
                codigo: match[1].trim(),
                nome: nome
            });
        }
    });
    
    logger.debug(`  ${disciplinas.length} disciplinas na unidade ${codigoUnidade}`);
    return disciplinas;
}

/**
 * Verifica se é uma tabela folha (sem tabelas dentro)
 */
function ehTabelaFolha($, table) {
    return $(table).find('table').length === 0;
}

/**
 * Parseia informações de uma turma
 */
function parsearInfoTurma($, folha) {
    const info = {};
    
    $(folha).find('tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length >= 2) {
            // Normalizar label removendo espaços extras
            const label = normalizeText($(tds[0]).text());
            const value = normalizeText($(tds[1]).text());
            
            if (/C[óo]digo\s*da\s*Turma\s*Te[óo]rica/i.test(label)) {
                info.codigo_teorica = value;
            } else if (/C[óo]digo\s*da\s*Turma/i.test(label)) {
                const match = value.match(/^(\w+)/);
                if (match) info.codigo = match[1];
            } else if (/In[íi]cio/i.test(label)) {
                info.inicio = value;
            } else if (/Fim/i.test(label)) {
                info.fim = value;
            } else if (/Tipo\s*da\s*Turma/i.test(label)) {
                info.tipo = value;
            } else if (/Observa[çc][õo]es/i.test(label)) {
                info.observacoes = value;
            }
        }
    });
    
    return info;
}

/**
 * Parseia horários de uma turma
 */
function parsearHorario($, folha) {
    const horarios = [];
    let accum = null;
    
    $(folha).find('tr').each((_, tr) => {
        const tds = $(tr).find('td');
        const valores = [];
        tds.each((_, td) => valores.push($(td).text().trim()));
        
        if (valores.length < 4) return;
        if (valores[0] === 'Horário') return; // Cabeçalho
        
        const [dia, inicio, fim, professor] = valores;
        
        if (dia !== '') {
            // Novo dia de aula
            if (accum !== null) {
                horarios.push(accum);
            }
            accum = {
                dia: dia,
                inicio: inicio,
                fim: fim,
                professores: professor ? [professor] : []
            };
        } else if (dia === '' && inicio === '') {
            // Mais professores ou horário estendido
            if (accum) {
                if (fim && fim > accum.fim) {
                    accum.fim = fim;
                }
                if (professor) {
                    accum.professores.push(professor);
                }
            }
        } else if (dia === '' && inicio !== '') {
            // Mais uma aula no mesmo dia
            if (accum !== null) {
                horarios.push(accum);
            }
            accum = {
                dia: accum ? accum.dia : '',
                inicio: inicio,
                fim: fim,
                professores: professor ? [professor] : []
            };
        }
    });
    
    if (accum !== null) {
        horarios.push(accum);
    }
    
    return horarios;
}

/**
 * Normaliza texto removendo espaços extras e quebras de linha
 */
function normalizeText(text) {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Parseia turmas de uma disciplina
 */
function parsearTurmas($, tabelasFolha) {
    const turmas = [];
    let info = null;
    let horario = null;
    
    tabelasFolha.each((_, folha) => {
        const texto = normalizeText($(folha).text());
        
        // O texto "Código da Turma" pode estar quebrado em múltiplas linhas
        if (/C[óo]digo\s*da\s*Turma/i.test(texto)) {
            // Nova turma - salvar a anterior se existir
            if (info !== null && horario) {
                info.horario = horario;
                turmas.push(info);
            }
            info = parsearInfoTurma($, folha);
            horario = null;
        } else if (/Hor[áa]rio/i.test(texto) && $(folha).find('td').length >= 4) {
            horario = parsearHorario($, folha);
        }
        // Ignoramos vagas conforme solicitado
    });
    
    // Última turma
    if (info !== null) {
        info.horario = horario || [];
        turmas.push(info);
    }
    
    return turmas;
}

/**
 * Extrai créditos da página de detalhes da disciplina
 */
async function obterCreditosDisciplina(codigoDisciplina) {
    try {
        const html = await fetchWithRetry(`/obterDisciplina?sgldis=${codigoDisciplina}`);
        const $ = cheerio.load(html);
        
        let creditos_aula = 0;
        let creditos_trabalho = 0;
        
        // Buscar em todas as células de tabela
        $('td').each((_, td) => {
            const texto = $(td).text();
            
            // Padrões mais flexíveis para capturar créditos
            const matchAula = texto.match(/Cr[ée]ditos?\s*Aula\s*[:\-]?\s*(\d+)/i);
            const matchTrabalho = texto.match(/Cr[ée]ditos?\s*Trabalho\s*[:\-]?\s*(\d+)/i);
            
            if (matchAula) {
                creditos_aula = parseInt(matchAula[1]) || 0;
            }
            if (matchTrabalho) {
                creditos_trabalho = parseInt(matchTrabalho[1]) || 0;
            }
        });
        
        return { creditos_aula, creditos_trabalho };
    } catch (error) {
        logger.debug(`  Erro ao buscar créditos: ${error.message}`);
        return { creditos_aula: 0, creditos_trabalho: 0 };
    }
}

/**
 * Processa uma disciplina (apenas turmas - informações para grade interativa)
 */
async function processarDisciplina(semaphore, disciplina, codigoUnidade) {
    return semaphore.run(async () => {
        const { codigo, nome } = disciplina;
        logger.debug(`Processando ${codigo} - ${nome}`);
        
        try {
            // Obter turmas
            const htmlTurmas = await fetchWithRetry(`/obterTurma?print=true&sgldis=${codigo}`);
            const $turmas = cheerio.load(htmlTurmas);
            
            const tabelasFolhaTurmas = $turmas('table').filter((_, t) => ehTabelaFolha($turmas, t));
            const turmas = parsearTurmas($turmas, tabelasFolhaTurmas);
            
            // Buscar créditos na página de detalhes da disciplina
            const creditos = await obterCreditosDisciplina(codigo);
            
            const hasValidClasses = turmas.length > 0;
            
            if (!hasValidClasses) {
                logger.debug(`  ${codigo}: sem turmas válidas`);
            }
            
            // Construir objeto da disciplina com informações essenciais para grade
            const info = {
                codigo: codigo,
                nome: nome,
                unidade: nomesUnidades[codigoUnidade] || 'Desconhecida',
                campus: CAMPUS_POR_UNIDADE[parseInt(codigoUnidade)] || 'Outro',
                creditos_aula: creditos.creditos_aula,
                creditos_trabalho: creditos.creditos_trabalho,
                has_valid_classes: hasValidClasses,
                turmas: turmas
            };
            
            logger.debug(`  ${codigo}: ${turmas.length} turmas, ${creditos.creditos_aula}+${creditos.creditos_trabalho} créditos${hasValidClasses ? '' : ' (sem turmas válidas)'}`);
            return info;
            
        } catch (error) {
            logger.error(`Erro ao processar ${codigo}: ${error.message}`);
            return null;
        }
    });
}

// ===================== MAIN =====================

async function main() {
    // Parsear argumentos
    const args = parseArgs();
    
    logger = new Logger(args.verbose);
    CONFIG.simultaneidade = args.simultaneidade;
    CONFIG.timeout = args.timeout;
    
    logger.info('=== Scraping de Disciplinas USP ===');
    logger.info(`Simultaneidade: ${CONFIG.simultaneidade}`);
    logger.info(`Timeout: ${CONFIG.timeout}ms`);
    
    if (args.dryRun) {
        logger.warn('MODO DRY-RUN: Nenhum dado será salvo');
    }
    
    try {
        // 1. Limpar dados se solicitado
        if (args.clear && !args.dryRun) {
            logger.info('Limpando dados existentes...');
            await DisciplinesService.clearAllData();
            logger.success('Dados limpos');
        }
        
        // 2. Obter unidades
        const unidades = await obterUnidades();
        
        // 3. Filtrar unidades se especificado
        let codigosParaProcessar;
        if (args.unidades && args.unidades.length > 0) {
            codigosParaProcessar = args.unidades;
            logger.info(`Processando apenas unidades: ${codigosParaProcessar.join(', ')}`);
        } else {
            codigosParaProcessar = Object.values(unidades);
        }
        
        // 4. Obter disciplinas de todas as unidades
        logger.info('Obtendo lista de disciplinas...');
        const todasDisciplinas = [];
        
        for (const codigoUnidade of codigosParaProcessar) {
            try {
                const disciplinas = await obterDisciplinasUnidade(codigoUnidade);
                for (const d of disciplinas) {
                    todasDisciplinas.push({ ...d, codigoUnidade });
                }
            } catch (error) {
                logger.error(`Erro na unidade ${codigoUnidade}: ${error.message}`);
            }
        }
        
        logger.success(`${todasDisciplinas.length} disciplinas encontradas`);
        
        // 5. Processar disciplinas com semáforo
        logger.info('Processando disciplinas...');
        logger.info(`Tempo estimado: ~${Math.ceil(todasDisciplinas.length * (CONFIG.delayEntreRequisicoes + 1000) / 1000 / CONFIG.simultaneidade / 60)} minutos`);
        const semaphore = new Semaphore(CONFIG.simultaneidade);
        
        let processadas = 0;
        const total = todasDisciplinas.length;
        const startProcess = Date.now();
        
        const promises = todasDisciplinas.map(d => 
            processarDisciplina(semaphore, d, d.codigoUnidade).then(result => {
                processadas++;
                if (processadas % 50 === 0 || processadas === total) {
                    const elapsed = (Date.now() - startProcess) / 1000;
                    const rate = processadas / elapsed;
                    const remaining = Math.ceil((total - processadas) / rate / 60);
                    logger.info(`📊 Progresso: ${processadas}/${total} (${(processadas/total*100).toFixed(1)}%) - ~${remaining}min restantes`);
                }
                return result;
            })
        );
        
        const resultados = await Promise.all(promises);
        const disciplinasValidas = resultados.filter(r => r !== null);
        
        logger.success(`${disciplinasValidas.length} disciplinas processadas com sucesso`);
        
        // 6. Salvar no banco
        if (!args.dryRun) {
            logger.info('Salvando no banco de dados...');
            let salvos = 0;
            let erros = 0;
            
            for (const disciplina of disciplinasValidas) {
                try {
                    await DisciplinesService.saveDiscipline(disciplina);
                    salvos++;
                    if (salvos % 100 === 0) {
                        logger.info(`  ${salvos}/${disciplinasValidas.length} salvas...`);
                    }
                } catch (error) {
                    logger.error(`Erro ao salvar ${disciplina.codigo}: ${error.message}`);
                    erros++;
                }
            }
            
            logger.success(`${salvos} disciplinas salvas, ${erros} erros`);
        } else {
            // Dry run - mostrar exemplo
            if (disciplinasValidas.length > 0) {
                logger.info('Exemplo de disciplina processada:');
                console.log(JSON.stringify(disciplinasValidas[0], null, 2));
            }
        }
        
        logger.success(`=== Concluído em ${logger.elapsed()}s ===`);
        
    } catch (error) {
        logger.error(`Erro fatal: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

function parseArgs() {
    const args = {
        unidades: [],
        simultaneidade: CONFIG.simultaneidade,  // Usa o valor do CONFIG
        timeout: CONFIG.timeout,                // Usa o valor do CONFIG
        verbose: false,
        dryRun: false,
        clear: false,
    };
    
    const argv = process.argv.slice(2);
    
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        
        if (arg === '-u' || arg === '--unidades') {
            args.unidades = argv[++i].split(',').map(s => s.trim());
        } else if (arg === '-s' || arg === '--simultaneidade') {
            args.simultaneidade = parseInt(argv[++i]) || CONFIG.simultaneidade;
        } else if (arg === '-t' || arg === '--timeout') {
            args.timeout = parseInt(argv[++i]) || CONFIG.timeout;
        } else if (arg === '-v' || arg === '--verbose') {
            args.verbose = true;
        } else if (arg === '--dry-run') {
            args.dryRun = true;
        } else if (arg === '--clear') {
            args.clear = true;
        } else if (arg === '-h' || arg === '--help') {
            console.log(`
Scraping de Disciplinas USP (JupiterWeb)

Uso:
  node scrapeUSPDisciplines.js [opções]

Opções:
  -u, --unidades <codigos>   Códigos de unidades (separados por vírgula)
  -s, --simultaneidade <n>   Requisições simultâneas (padrão: 3)
  -t, --timeout <ms>         Timeout em ms (padrão: 30000)
  -v, --verbose              Modo verboso
  --dry-run                  Não salva, apenas mostra
  --clear                    Limpa dados antes de iniciar
  -h, --help                 Mostra esta ajuda

Exemplos:
  node scrapeUSPDisciplines.js -u 45,3 -v
  node scrapeUSPDisciplines.js --clear --dry-run
  node scrapeUSPDisciplines.js -s 10 -t 120000
            `);
            process.exit(0);
        }
    }
    
    return args;
}

// Executar
main().catch(error => {
    console.error('Erro não tratado:', error);
    process.exit(1);
});
