#!/usr/bin/env node
/**
 * Script de Seed para Povoar o Banco de Dados da Biblioteca
 * 
 * Este script cria dados de exemplo para:
 * - Usuários (alunos, proalunos, admin)
 * - Livros de diversas áreas
 * - Doadores
 * - Disciplinas
 * - Empréstimos ativos
 * - Badges
 * 
 * Uso: node backend/scripts/seed_database.js
 */

require('dotenv').config();
const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || path.join(__dirname, '../../database/library.db');
const SALT_ROUNDS = 10;

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco de dados');
});

// Funções utilitárias
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Dados de Seed
// ⚠️ MODO DESENVOLVIMENTO - Senha padrão: 1
// NUSP 1 = Admin, NUSP 2 = ProAluno (já criados na inicialização)
const USERS = [
    { name: 'Teste Aluno 1', nusp: 3, email: 'aluno3@usp.br', phone: '(11) 91111-1111', role: 'aluno', class: '2024A' },
    { name: 'Teste Aluno 2', nusp: 4, email: 'aluno4@usp.br', phone: '(11) 92222-2222', role: 'aluno', class: '2024B' },
    { name: 'Teste Aluno 3', nusp: 5, email: 'aluno5@usp.br', phone: '(11) 93333-3333', role: 'aluno', class: '2023A' },
    { name: 'Teste Aluno 4', nusp: 6, email: 'aluno6@usp.br', phone: '(11) 94444-4444', role: 'aluno', class: '2023B' },
    { name: 'Teste Aluno 5', nusp: 7, email: 'aluno7@usp.br', phone: '(11) 95555-5555', role: 'aluno', class: '2024A' },
    { name: 'Teste Aluno 6', nusp: 8, email: 'aluno8@usp.br', phone: '(11) 96666-6666', role: 'aluno', class: '2024B' },
];

const BOOKS = [
    // Códigos de barras simples: 1, 2, 3, 4... (modo dev)
    // Física
    { barcode: '1', area: 'Física', subarea: 1, title: 'Física I - Mecânica', authors: 'Halliday', edition: 10, volume: 1, language: 1 },
    { barcode: '2', area: 'Física', subarea: 1, title: 'Física I - Mecânica', authors: 'Halliday', edition: 10, volume: 1, language: 1 },
    { barcode: '3', area: 'Física', subarea: 2, title: 'Física II - Termodinâmica', authors: 'Halliday', edition: 10, volume: 2, language: 1 },
    { barcode: '4', area: 'Física', subarea: 3, title: 'Física III - Eletromagnetismo', authors: 'Halliday', edition: 10, volume: 3, language: 1 },
    { barcode: '5', area: 'Física', subarea: 4, title: 'Física Moderna', authors: 'Eisberg', edition: 1, volume: 0, language: 1 },
    
    // Química
    { barcode: '6', area: 'Química', subarea: 1, title: 'Química Geral', authors: 'Atkins', edition: 9, volume: 0, language: 1 },
    { barcode: '7', area: 'Química', subarea: 1, title: 'Química Geral', authors: 'Atkins', edition: 9, volume: 0, language: 1 },
    { barcode: '8', area: 'Química', subarea: 2, title: 'Química Orgânica', authors: 'Solomons', edition: 12, volume: 1, language: 1 },
    { barcode: '9', area: 'Química', subarea: 2, title: 'Química Orgânica', authors: 'Solomons', edition: 12, volume: 2, language: 1 },
    { barcode: '10', area: 'Química', subarea: 3, title: 'Físico-Química', authors: 'Atkins', edition: 10, volume: 1, language: 1 },
    
    // Biologia
    { barcode: '11', area: 'Biologia', subarea: 1, title: 'Biologia Celular', authors: 'Alberts', edition: 6, volume: 0, language: 1 },
    { barcode: '12', area: 'Biologia', subarea: 2, title: 'Bioquímica', authors: 'Lehninger', edition: 7, volume: 0, language: 1 },
    { barcode: '13', area: 'Biologia', subarea: 2, title: 'Bioquímica', authors: 'Voet', edition: 4, volume: 0, language: 1 },
    { barcode: '14', area: 'Biologia', subarea: 3, title: 'Genética', authors: 'Griffiths', edition: 11, volume: 0, language: 1 },
    { barcode: '15', area: 'Biologia', subarea: 4, title: 'Microbiologia', authors: 'Madigan', edition: 15, volume: 0, language: 1 },
    
    // Matemática
    { barcode: '16', area: 'Matemática', subarea: 1, title: 'Cálculo I', authors: 'Stewart', edition: 8, volume: 1, language: 1 },
    { barcode: '17', area: 'Matemática', subarea: 1, title: 'Cálculo I', authors: 'Stewart', edition: 8, volume: 1, language: 1 },
    { barcode: '18', area: 'Matemática', subarea: 2, title: 'Cálculo II', authors: 'Stewart', edition: 8, volume: 2, language: 1 },
    { barcode: '19', area: 'Matemática', subarea: 3, title: 'Álgebra Linear', authors: 'Boldrini', edition: 3, volume: 0, language: 1 },
    { barcode: '20', area: 'Matemática', subarea: 4, title: 'Equações Diferenciais', authors: 'Boyce', edition: 10, volume: 0, language: 1 },
    
    // Computação
    { barcode: '21', area: 'Computação', subarea: 1, title: 'Python', authors: 'Downey', edition: 2, volume: 0, language: 1 },
    { barcode: '22', area: 'Computação', subarea: 2, title: 'Algoritmos', authors: 'Cormen', edition: 3, volume: 0, language: 1 },
    { barcode: '23', area: 'Computação', subarea: 3, title: 'Sistemas Operacionais', authors: 'Tanenbaum', edition: 4, volume: 0, language: 1 },
    { barcode: '24', area: 'Computação', subarea: 4, title: 'Redes', authors: 'Tanenbaum', edition: 5, volume: 0, language: 1 },
    { barcode: '25', area: 'Computação', subarea: 5, title: 'Banco de Dados', authors: 'Elmasri', edition: 7, volume: 0, language: 1 },
];

const DISCIPLINES = [
    { codigo: 'QFL1100', nome: 'Química Geral', unidade: 'IQ', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'QFL2308', nome: 'Química Orgânica I', unidade: 'IQ', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'QFL3401', nome: 'Físico-Química I', unidade: 'IQ', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'QFL4500', nome: 'Química Analítica', unidade: 'IQ', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'BIO0101', nome: 'Biologia Celular', unidade: 'IB', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'BIO0202', nome: 'Bioquímica', unidade: 'IB', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'BIO0303', nome: 'Genética', unidade: 'IB', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'FIS1201', nome: 'Física I', unidade: 'IF', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'FIS1202', nome: 'Física II', unidade: 'IF', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'FIS1203', nome: 'Física III', unidade: 'IF', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'MAT0111', nome: 'Cálculo I', unidade: 'IME', campus: 'São Paulo', creditos_aula: 6, creditos_trabalho: 0 },
    { codigo: 'MAT0122', nome: 'Cálculo II', unidade: 'IME', campus: 'São Paulo', creditos_aula: 6, creditos_trabalho: 0 },
    { codigo: 'MAT0205', nome: 'Álgebra Linear', unidade: 'IME', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'MAC0110', nome: 'Introdução à Computação', unidade: 'IME', campus: 'São Paulo', creditos_aula: 4, creditos_trabalho: 0 },
    { codigo: 'MAC0122', nome: 'Algoritmos', unidade: 'IME', campus: 'São Paulo', creditos_aula: 6, creditos_trabalho: 0 },
];

const DONATORS = [
    { name: 'Instituto de Química - USP', donation_type: 'book', notes: 'Doação de 50 livros de Química' },
    { name: 'Instituto de Física - USP', donation_type: 'book', notes: 'Doação de 30 livros de Física' },
    { name: 'Prof. Dr. João da Silva', donation_type: 'book', notes: 'Doação de coleção pessoal' },
    { name: 'Editora Elsevier', donation_type: 'book', notes: 'Doação de 20 exemplares' },
    { name: 'Associação de Ex-Alunos', donation_type: 'money', amount: 5000.00, notes: 'Doação para aquisição de novos livros' },
    { name: 'Maria Oliveira', donation_type: 'money', amount: 500.00, contact: 'maria.oliveira@email.com', notes: 'Doação anônima' },
    { name: 'Fundação de Amparo à Pesquisa', donation_type: 'money', amount: 10000.00, notes: 'Verba para biblioteca' },
];

// =====================================================
// FORUM - Dados do fórum (migrados do frontend mockado)
// =====================================================

const FORUM_TAGS = [
    // Acadêmico
    { nome: 'créditos', topico: 'academico', descricao: 'Dúvidas sobre créditos para formatura' },
    { nome: 'projeto-avançado', topico: 'academico', descricao: 'TCC, MAC0499 e projetos de conclusão' },
    { nome: 'orientador', topico: 'academico', descricao: 'Como encontrar e trabalhar com orientadores' },
    { nome: 'formatura', topico: 'academico', descricao: 'Requisitos e processos de formatura' },
    { nome: 'iniciação-científica', topico: 'academico', descricao: 'IC, bolsas e pesquisa' },
    { nome: 'grade-curricular', topico: 'academico', descricao: 'Mudanças na grade e disciplinas' },
    { nome: 'optativas', topico: 'academico', descricao: 'Recomendações de optativas' },
    { nome: 'tcc', topico: 'academico', descricao: 'Trabalho de conclusão de curso' },
    { nome: 'pré-requisitos', topico: 'academico', descricao: 'Pré-requisitos de disciplinas' },
    { nome: 'intercâmbio', topico: 'academico', descricao: 'Programas de intercâmbio' },
    { nome: 'mac0499', topico: 'academico', descricao: 'Disciplina de Trabalho de Formatura' },
    { nome: 'estágio', topico: 'academico', descricao: 'Estágios obrigatórios e opcionais' },
    { nome: 'monitoria', topico: 'academico', descricao: 'Programa de monitoria (PAE)' },
    { nome: 'mestrado', topico: 'academico', descricao: 'Pós-graduação stricto sensu' },
    { nome: 'bolsas', topico: 'academico', descricao: 'Bolsas de estudo e auxílios' },
    
    // Administrativo
    { nome: 'matrícula', topico: 'administrativo', descricao: 'Processo de matrícula' },
    { nome: 'trancamento', topico: 'administrativo', descricao: 'Trancamento de disciplinas e curso' },
    { nome: 'documentos', topico: 'administrativo', descricao: 'Emissão de documentos e declarações' },
    { nome: 'prazos', topico: 'administrativo', descricao: 'Prazos acadêmicos e administrativos' },
    { nome: 'transferência', topico: 'administrativo', descricao: 'Transferência entre cursos' },
    
    // Técnico
    { nome: 'júpiter', topico: 'tecnico', descricao: 'Sistema Júpiter USP' },
    { nome: 'machine-learning', topico: 'tecnico', descricao: 'Aprendizado de máquina' },
    { nome: 'python', topico: 'tecnico', descricao: 'Linguagem de programação Python' },
    { nome: 'javascript', topico: 'tecnico', descricao: 'Linguagem de programação JavaScript' },
    { nome: 'java', topico: 'tecnico', descricao: 'Linguagem de programação Java' },
    { nome: 'c', topico: 'tecnico', descricao: 'Linguagem de programação C' },
    { nome: 'algoritmos', topico: 'tecnico', descricao: 'Estruturas de dados e algoritmos' },
    { nome: 'banco-de-dados', topico: 'tecnico', descricao: 'Sistemas de gerenciamento de banco de dados' },
    { nome: 'redes', topico: 'tecnico', descricao: 'Redes de computadores' },
    { nome: 'sistemas-operacionais', topico: 'tecnico', descricao: 'Sistemas operacionais' },
    
    // Biblioteca
    { nome: 'empréstimo', topico: 'biblioteca', descricao: 'Empréstimos de livros e materiais' },
    { nome: 'renovação', topico: 'biblioteca', descricao: 'Renovação de empréstimos' },
    { nome: 'reserva', topico: 'biblioteca', descricao: 'Reserva de livros' },
    { nome: 'multa', topico: 'biblioteca', descricao: 'Multas e atrasos' },
    { nome: 'doação', topico: 'biblioteca', descricao: 'Doações de livros e materiais' },
    { nome: 'acervo', topico: 'biblioteca', descricao: 'Consultas sobre o acervo' },
    { nome: 'horário-biblioteca', topico: 'biblioteca', descricao: 'Horários de funcionamento' },
    
    // Carreira
    { nome: 'carreira', topico: 'carreira', descricao: 'Desenvolvimento de carreira profissional' },
    { nome: 'entrevista', topico: 'carreira', descricao: 'Dicas para entrevistas de emprego' },
    { nome: 'currículo', topico: 'carreira', descricao: 'Elaboração de currículo' },
    { nome: 'linkedin', topico: 'carreira', descricao: 'Perfil profissional no LinkedIn' },
    { nome: 'emprego', topico: 'carreira', descricao: 'Busca por oportunidades de trabalho' },
    { nome: 'freelancer', topico: 'carreira', descricao: 'Trabalho freelancer e autônomo' },
    
    // Eventos
    { nome: 'eventos', topico: 'eventos', descricao: 'Eventos da biblioteca e IME' },
    { nome: 'palestras', topico: 'eventos', descricao: 'Palestras e seminários' },
    { nome: 'workshops', topico: 'eventos', descricao: 'Workshops e cursos' },
    { nome: 'hackathon', topico: 'eventos', descricao: 'Hackathons e competições' },
    { nome: 'semana-da-computação', topico: 'eventos', descricao: 'Semana da Computação' },
    
    // Geral
    { nome: 'modelos', topico: 'geral', descricao: 'Templates e modelos de documentos' },
    { nome: 'recomendações', topico: 'geral', descricao: 'Recomendações gerais' },
    { nome: 'experiência', topico: 'geral', descricao: 'Experiências e relatos' },
    { nome: 'dúvida', topico: 'geral', descricao: 'Dúvidas gerais' },
    { nome: 'iniciante', topico: 'geral', descricao: 'Questões para iniciantes' },
    { nome: 'veterano', topico: 'geral', descricao: 'Dicas de veteranos' },
    { nome: 'vida-universitária', topico: 'geral', descricao: 'Vida universitária e adaptação' },
];

// Perguntas do fórum (migradas do ForumPage.tsx)
// autorId será mapeado para os usuários de seed (NUSP 3-8)
const FORUM_QUESTIONS = [
    {
        titulo: 'Quantos créditos preciso para formar?',
        conteudo: 'Estou no 3º ano e ainda não entendi direito quantos créditos preciso completar. Alguém pode explicar de forma clara? Vi no Júpiter mas está confuso...',
        autorNusp: 3, // Teste Aluno 1
        views: 234,
        votos: 12,
        tags: ['créditos', 'formatura', 'júpiter'],
        createdAgo: '2 hours',
    },
    {
        titulo: 'Como encontrar um orientador para o TCC?',
        conteudo: 'Estou no último ano e preciso encontrar um orientador para o TCC. Qual a melhor forma de abordar um professor? Tem algum template de email?',
        autorNusp: 4, // Teste Aluno 2
        views: 189,
        votos: 23,
        tags: ['orientador', 'tcc', 'projeto-avançado'],
        createdAgo: '5 hours',
    },
    {
        titulo: 'Modelo de projeto de MAC0499 (avançado)',
        conteudo: 'Alguém tem um exemplo de projeto de avançado aprovado? Quero ter uma ideia de como estruturar o meu. Qualquer área serve!',
        autorNusp: 5, // Teste Aluno 3
        views: 456,
        votos: 8,
        tags: ['projeto-avançado', 'mac0499', 'modelos'],
        createdAgo: '1 day',
    },
    {
        titulo: 'Iniciação científica conta como crédito?',
        conteudo: 'Estou fazendo IC há 6 meses e queria saber se isso conta como crédito-aula ou crédito-trabalho para a formatura. Alguém sabe?',
        autorNusp: 6, // Teste Aluno 4
        views: 123,
        votos: 15,
        tags: ['créditos', 'iniciação-científica', 'formatura'],
        createdAgo: '2 days',
    },
    {
        titulo: 'Optativas recomendadas para quem gosta de ML',
        conteudo: 'Quero me aprofundar em Machine Learning. Quais optativas vocês recomendam? Já fiz MAC0460.',
        autorNusp: 7, // Teste Aluno 5
        views: 567,
        votos: 31,
        tags: ['optativas', 'machine-learning', 'recomendações'],
        createdAgo: '3 days',
    },
    {
        titulo: 'Grade curricular mudou? Como isso me afeta?',
        conteudo: 'Entrei em 2023 e vi que a grade mudou em 2024. Isso afeta quem já estava matriculado? Posso seguir a nova grade se eu quiser?',
        autorNusp: 8, // Teste Aluno 6
        views: 89,
        votos: 6,
        tags: ['grade-curricular', 'formatura'],
        createdAgo: '4 days',
    },
    {
        titulo: 'Como funciona o sistema de pré-requisitos?',
        conteudo: 'Não consigo me matricular em MAC0338 mas já fiz todas as disciplinas listadas como pré-requisito. O que pode estar acontecendo?',
        autorNusp: 3, // Teste Aluno 1
        views: 178,
        votos: 9,
        tags: ['pré-requisitos', 'matrícula', 'júpiter'],
        createdAgo: '5 days',
    },
    {
        titulo: 'Vale a pena fazer intercâmbio?',
        conteudo: 'Estou pensando em fazer intercâmbio no 4º ano. Alguém tem experiência? Como funciona a validação de créditos?',
        autorNusp: 4, // Teste Aluno 2
        views: 234,
        votos: 42,
        tags: ['intercâmbio', 'créditos', 'experiência'],
        createdAgo: '1 week',
    },
];

// Respostas do fórum
const FORUM_ANSWERS = [
    // Respostas para pergunta 1 (créditos para formar)
    {
        questionIndex: 0,
        conteudo: 'Para BCC são 240 créditos no total, sendo pelo menos 156 em disciplinas obrigatórias. O resto você completa com optativas.',
        autorNusp: 5,
        votos: 8,
        isAccepted: true,
        createdAgo: '1 hour',
    },
    {
        questionIndex: 0,
        conteudo: 'Complementando: você pode ver o resumo no Júpiter em "Histórico Escolar" > "Resumo". Lá mostra quantos créditos você já tem e quantos faltam.',
        autorNusp: 6,
        votos: 5,
        isAccepted: false,
        createdAgo: '30 minutes',
    },
    // Respostas para pergunta 2 (orientador TCC)
    {
        questionIndex: 1,
        conteudo: 'Eu mandei email para vários professores explicando meu interesse na área de pesquisa deles. Fui rejeitado por uns 3 antes de conseguir. Não desanime!',
        autorNusp: 7,
        votos: 12,
        isAccepted: true,
        createdAgo: '4 hours',
    },
    {
        questionIndex: 1,
        conteudo: 'Dica: vá nas aulas de optativas avançadas e converse com os professores pessoalmente. É muito mais efetivo que email.',
        autorNusp: 8,
        votos: 7,
        isAccepted: false,
        createdAgo: '3 hours',
    },
    // Respostas para pergunta 4 (IC conta como crédito)
    {
        questionIndex: 3,
        conteudo: 'IC conta como crédito-trabalho! São 2 créditos por semestre de bolsa. Você precisa pedir para o orientador lançar no sistema.',
        autorNusp: 4,
        votos: 10,
        isAccepted: true,
        createdAgo: '1 day',
    },
    // Respostas para pergunta 5 (optativas ML)
    {
        questionIndex: 4,
        conteudo: 'MAC0459 (Data Science) e MAC0318 (Robótica) são excelentes! Se puder, faça também algo de estatística no IME.',
        autorNusp: 3,
        votos: 15,
        isAccepted: true,
        createdAgo: '2 days',
    },
    {
        questionIndex: 4,
        conteudo: 'Recomendo também MAC0425 (Inteligência Artificial) se ainda não fez. É base importante para ML.',
        autorNusp: 6,
        votos: 9,
        isAccepted: false,
        createdAgo: '2 days',
    },
    // Respostas para pergunta 7 (pré-requisitos)
    {
        questionIndex: 6,
        conteudo: 'Às vezes o sistema demora para atualizar. Tenta esperar uns dias e ver se resolve. Se não, vai na seção de alunos.',
        autorNusp: 8,
        votos: 4,
        isAccepted: false,
        createdAgo: '4 days',
    },
    {
        questionIndex: 6,
        conteudo: 'Pode ser pré-requisito fraco (só recomendado) vs forte (obrigatório). Verifica no programa da disciplina.',
        autorNusp: 5,
        votos: 6,
        isAccepted: true,
        createdAgo: '4 days',
    },
    // Respostas para pergunta 8 (intercâmbio)
    {
        questionIndex: 7,
        conteudo: 'Fiz intercâmbio na Alemanha e foi a melhor decisão! A validação de créditos pode ser burocrática, mas vale muito a pena.',
        autorNusp: 6,
        votos: 18,
        isAccepted: true,
        createdAgo: '6 days',
    },
    {
        questionIndex: 7,
        conteudo: 'Dica: escolha universidades que já tenham convênio com o IME. Facilita muito a validação.',
        autorNusp: 7,
        votos: 11,
        isAccepted: false,
        createdAgo: '5 days',
    },
];

// Função para gerar código de livro
function generateBookCode(area, subarea, seq, volume) {
    const areaCodes = {
        "Física": "FIS",
        "Química": "QUI",
        "Biologia": "BIO",
        "Matemática": "MAT",
        "Computação": "CMP",
        "Variados": "VAR"
    };
    const areaCode = areaCodes[area] || "XXX";
    const subareaCode = String(subarea).padStart(2, "0");
    const seqCode = String(seq).padStart(2, "0");
    let code = `${areaCode}-${subareaCode}.${seqCode}`;
    if (volume && parseInt(volume, 10) > 0) {
        code += `-v${parseInt(volume, 10)}`;
    }
    return code;
}

// Funções de Seed
async function seedUsers() {
    console.log('\n📝 Criando usuários de teste...');
    console.log('⚠️  MODO DESENVOLVIMENTO - Senha padrão para todos: "1"');
    const defaultPassword = await bcrypt.hash('1', SALT_ROUNDS);
    
    for (const user of USERS) {
        try {
            const existing = await getQuery('SELECT * FROM users WHERE NUSP = ?', [user.nusp]);
            if (!existing) {
                await runQuery(
                    `INSERT INTO users (name, NUSP, email, phone, password_hash, role, class) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [user.name, user.nusp, user.email, user.phone, defaultPassword, user.role, user.class]
                );
                console.log(`  ✅ Usuário criado: ${user.name} (NUSP: ${user.nusp}, Senha: 1)`);
            } else {
                console.log(`  ⏭️  Usuário já existe: ${user.name} (NUSP: ${user.nusp})`);
            }
        } catch (err) {
            console.error(`  ❌ Erro ao criar usuário ${user.name}:`, err.message);
        }
    }
    
    console.log('\n💡 Lembre-se:');
    console.log('   NUSP 1 = Admin (senha: 1)');
    console.log('   NUSP 2 = ProAluno (senha: 1)');
    console.log('   NUSP 3-8 = Alunos teste (senha: 1)');
}

async function seedBooks() {
    console.log('\n📚 Criando livros com códigos de barras simples (modo dev)...');
    
    for (let i = 0; i < BOOKS.length; i++) {
        const book = BOOKS[i];
        try {
            const existing = await getQuery('SELECT * FROM books WHERE code = ?', [book.barcode]);
            if (!existing) {
                await runQuery(
                    `INSERT INTO books (id, code, area, subarea, title, authors, edition, volume, language, is_reserved) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                    [i + 1, book.barcode, book.area, book.subarea, book.title, book.authors, book.edition, book.volume, book.language]
                );
                console.log(`  ✅ Livro criado: Código ${book.barcode} - ${book.title}`);
            } else {
                console.log(`  ⏭️  Livro já existe: Código ${book.barcode}`);
            }
        } catch (err) {
            console.error(`  ❌ Erro ao criar livro ${book.title}:`, err.message);
        }
    }
}

async function seedDisciplines() {
    console.log('\n🎓 Criando disciplinas...');
    
    for (const discipline of DISCIPLINES) {
        try {
            const existing = await getQuery('SELECT * FROM disciplines WHERE codigo = ?', [discipline.codigo]);
            if (!existing) {
                await runQuery(
                    `INSERT INTO disciplines (codigo, nome, unidade, campus, creditos_aula, creditos_trabalho, has_valid_classes) 
                     VALUES (?, ?, ?, ?, ?, ?, 0)`,
                    [discipline.codigo, discipline.nome, discipline.unidade, discipline.campus, discipline.creditos_aula, discipline.creditos_trabalho]
                );
                console.log(`  ✅ Disciplina criada: ${discipline.codigo} - ${discipline.nome}`);
            } else {
                console.log(`  ⏭️  Disciplina já existe: ${discipline.codigo}`);
            }
        } catch (err) {
            console.error(`  ❌ Erro ao criar disciplina ${discipline.codigo}:`, err.message);
        }
    }
}

async function seedDonators() {
    console.log('\n💰 Criando doadores...');
    
    for (const donator of DONATORS) {
        try {
            await runQuery(
                `INSERT INTO donators (name, donation_type, amount, contact, notes) 
                 VALUES (?, ?, ?, ?, ?)`,
                [donator.name, donator.donation_type, donator.amount || null, donator.contact || null, donator.notes || null]
            );
            console.log(`  ✅ Doador criado: ${donator.name} (${donator.donation_type})`);
        } catch (err) {
            console.error(`  ❌ Erro ao criar doador ${donator.name}:`, err.message);
        }
    }
}

async function seedLoans() {
    console.log('\n📖 Criando empréstimos de exemplo...');
    
    // Buscar o aluno 1 (NUSP 3) e os 6 primeiros livros
    const aluno1 = await getQuery('SELECT id FROM users WHERE NUSP = ?', [3]);
    const livros = await allQuery('SELECT id FROM books ORDER BY id ASC LIMIT 6');

    if (!aluno1 || livros.length < 6) {
        console.log('  ⏭️  Sem aluno 1 ou livros suficientes para criar empréstimos');
        return;
    }

    const now = new Date();
    // 2 empréstimos em dia (ativos)
    for (let i = 0; i < 2; i++) {
        const borrowedAt = new Date(now.getTime() - (i * 2) * 24 * 60 * 60 * 1000); // hoje e ontem
        const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // daqui 7 dias
        try {
            await runQuery(
                `INSERT INTO loans (book_id, student_id, borrowed_at, due_date, renewals, is_extended, returned_at)
                 VALUES (?, ?, ?, ?, 0, 0, NULL)`,
                [livros[i].id, aluno1.id, borrowedAt.toISOString(), dueDate.toISOString()]
            );
            await runQuery('UPDATE books SET is_reserved = 1 WHERE id = ?', [livros[i].id]);
            console.log(`  ✅ Empréstimo em dia criado: Livro ${livros[i].id} para Aluno 1`);
        } catch (err) {
            console.error(`  ❌ Erro ao criar empréstimo em dia:`, err.message);
        }
    }
    // Não criar empréstimos atrasados nem devolvidos para o aluno teste 1
}

async function seedDisciplineClasses() {
    console.log('\n👨‍🏫 Criando turmas de disciplinas...');
    
    // Pegar algumas disciplinas para criar turmas
    const disciplines = await allQuery('SELECT * FROM disciplines LIMIT 5');
    
    if (disciplines.length === 0) {
        console.log('  ⏭️  Sem disciplinas para criar turmas');
        return 0;
    }
    
    const turmas = ['45A', '45B', '46A'];
    const tipos = ['Teórica', 'Prática', 'Teórico-Prática'];
    let classesCreated = 0;
    
    for (const discipline of disciplines) {
        for (const turma of turmas) {
            try {
                const existing = await getQuery(
                    'SELECT * FROM discipline_classes WHERE discipline_id = ? AND codigo_turma = ?',
                    [discipline.id, turma]
                );
                
                if (!existing) {
                    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
                    const inicio = '2025-02-10';
                    const fim = '2025-06-30';
                    
                    const result = await runQuery(
                        `INSERT INTO discipline_classes (discipline_id, codigo_turma, tipo, inicio, fim) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [discipline.id, turma, tipo, inicio, fim]
                    );
                    console.log(`  ✅ Turma criada: ${discipline.codigo} - Turma ${turma} (${tipo})`);
                    classesCreated++;
                    
                    // Criar horários e professores para esta turma
                    await seedClassSchedules(result.lastID, discipline.codigo, turma);
                    await seedClassProfessors(result.lastID, discipline.codigo, turma);
                } else {
                    console.log(`  ⏭️  Turma já existe: ${discipline.codigo} - Turma ${turma}`);
                }
            } catch (err) {
                console.error(`  ❌ Erro ao criar turma ${discipline.codigo}-${turma}:`, err.message);
            }
        }
        
        // Marcar que a disciplina tem turmas válidas
        try {
            await runQuery('UPDATE disciplines SET has_valid_classes = 1 WHERE id = ?', [discipline.id]);
        } catch (err) {
            console.error(`  ❌ Erro ao atualizar disciplina ${discipline.codigo}:`, err.message);
        }
    }
    
    return classesCreated;
}

async function seedClassSchedules(classId, disciplineCodigo, turma) {
    // Criar 2-3 horários por turma (usando as colunas corretas: dia, horario_inicio, horario_fim)
    const schedules = [
        { dia: 'seg', horario_inicio: '08:00', horario_fim: '10:00' },
        { dia: 'qua', horario_inicio: '08:00', horario_fim: '10:00' },
        { dia: 'sex', horario_inicio: '14:00', horario_fim: '16:00' }
    ];
    
    for (const schedule of schedules) {
        try {
            await runQuery(
                `INSERT INTO class_schedules (class_id, dia, horario_inicio, horario_fim) 
                 VALUES (?, ?, ?, ?)`,
                [classId, schedule.dia, schedule.horario_inicio, schedule.horario_fim]
            );
        } catch (err) {
            // Silenciosamente ignorar se já existe
        }
    }
}

async function seedClassProfessors(classId, disciplineCodigo, turma) {
    // Lista de professores exemplo
    const professors = [
        'Prof. Dr. João Silva',
        'Profa. Dra. Maria Santos',
        'Prof. Dr. Carlos Oliveira',
        'Profa. Dra. Ana Costa',
        'Prof. Dr. Pedro Almeida'
    ];
    
    // Escolher 1-2 professores aleatórios para a turma (usando coluna 'nome')
    const numProfs = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numProfs; i++) {
        const prof = professors[Math.floor(Math.random() * professors.length)];
        try {
            await runQuery(
                `INSERT INTO class_professors (class_id, nome) 
                 VALUES (?, ?)`,
                [classId, prof]
            );
        } catch (err) {
            // Silenciosamente ignorar se já existe
        }
    }
}

async function seedBadges() {
    console.log('\n🏆 Criando badges...');
    
    const badges = [
        {
            name: 'Primeiro Empréstimo',
            description: 'Realizou seu primeiro empréstimo na biblioteca',
            image_locked: '/images/badges/first_loan_locked.png',
            image_unlocked: '/images/badges/first_loan_unlocked.png'
        },
        {
            name: 'Leitor Frequente',
            description: 'Já fez 10 empréstimos',
            image_locked: '/images/badges/frequent_reader_locked.png',
            image_unlocked: '/images/badges/frequent_reader_unlocked.png'
        },
        {
            name: 'Pontual',
            description: 'Devolveu 20 livros dentro do prazo',
            image_locked: '/images/badges/punctual_locked.png',
            image_unlocked: '/images/badges/punctual_unlocked.png'
        },
        {
            name: 'Maratonista',
            description: 'Emprestou 50 livros',
            image_locked: '/images/badges/marathonist_locked.png',
            image_unlocked: '/images/badges/marathonist_unlocked.png'
        },
        {
            name: 'Explorador',
            description: 'Emprestou livros de todas as áreas',
            image_locked: '/images/badges/explorer_locked.png',
            image_unlocked: '/images/badges/explorer_unlocked.png'
        }
    ];
    
    for (const badge of badges) {
        try {
            const existing = await getQuery('SELECT * FROM badges WHERE name = ?', [badge.name]);
            if (!existing) {
                await runQuery(
                    `INSERT INTO badges (name, description, image_locked, image_unlocked) 
                     VALUES (?, ?, ?, ?)`,
                    [badge.name, badge.description, badge.image_locked, badge.image_unlocked]
                );
                console.log(`  ✅ Badge criado: ${badge.name}`);
            } else {
                console.log(`  ⏭️  Badge já existe: ${badge.name}`);
            }
        } catch (err) {
            console.error(`  ❌ Erro ao criar badge ${badge.name}:`, err.message);
        }
    }
}

// =====================================================
// FORUM SEED - Perguntas, respostas, tags e votos
// =====================================================

async function seedForum() {
    console.log('\n💬 Criando dados do fórum...');
    
    // Verificar se tabelas existem
    const tableCheck = await getQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='forum_questions'");
    if (!tableCheck) {
        console.log('  ⚠️  Tabelas do fórum não existem. Execute initDb primeiro.');
        return { questions: 0, answers: 0, tags: 0 };
    }

    // Verificar se já tem dados
    const existingQuestions = await getQuery('SELECT COUNT(*) as count FROM forum_questions');
    if (existingQuestions && existingQuestions.count > 0) {
        console.log(`  ⏭️  Fórum já tem ${existingQuestions.count} perguntas. Pulando seed.`);
        return { questions: existingQuestions.count, answers: 0, tags: 0 };
    }

    // Criar mapa de NUSP para ID de usuário
    const userMap = {};
    for (let nusp = 3; nusp <= 8; nusp++) {
        const user = await getQuery('SELECT id FROM users WHERE NUSP = ?', [nusp]);
        if (user) {
            userMap[nusp] = user.id;
        }
    }

    // 1. Criar tags
    console.log('  📌 Criando tags...');
    const tagIdMap = {};
    for (const tag of FORUM_TAGS) {
        try {
            await runQuery(
                'INSERT INTO forum_tags (nome, topico, descricao, approved, created_at) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
                [tag.nome, tag.topico, tag.descricao]
            );
            const created = await getQuery('SELECT id FROM forum_tags WHERE nome = ?', [tag.nome]);
            if (created) {
                tagIdMap[tag.nome] = created.id;
            }
        } catch (err) {
            // Tag pode já existir
            const existing = await getQuery('SELECT id FROM forum_tags WHERE nome = ?', [tag.nome]);
            if (existing) {
                tagIdMap[tag.nome] = existing.id;
            }
        }
    }
    console.log(`     ✅ ${Object.keys(tagIdMap).length} tags criadas/encontradas`);

    // Função helper para converter tempo relativo em data
    function getDateFromAgo(agoString) {
        const now = new Date();
        const match = agoString.match(/(\d+)\s*(hour|minute|day|week|month)/i);
        if (!match) return now;
        
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        
        switch (unit) {
            case 'minute':
                return new Date(now.getTime() - value * 60 * 1000);
            case 'hour':
                return new Date(now.getTime() - value * 60 * 60 * 1000);
            case 'day':
                return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
            case 'week':
                return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
            case 'month':
                return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
            default:
                return now;
        }
    }

    // 2. Criar perguntas
    console.log('  ❓ Criando perguntas...');
    const questionIdMap = [];
    for (let i = 0; i < FORUM_QUESTIONS.length; i++) {
        const q = FORUM_QUESTIONS[i];
        const autorId = userMap[q.autorNusp];
        
        if (!autorId) {
            console.log(`     ⚠️  Autor NUSP ${q.autorNusp} não encontrado, pulando pergunta`);
            questionIdMap.push(null);
            continue;
        }

        try {
            const createdAt = getDateFromAgo(q.createdAgo);
            
            await runQuery(
                `INSERT INTO forum_questions (titulo, conteudo, autor_id, votos, views, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [q.titulo, q.conteudo, autorId, q.votos, q.views, createdAt.toISOString(), createdAt.toISOString()]
            );
            
            const created = await getQuery('SELECT id FROM forum_questions WHERE titulo = ?', [q.titulo]);
            if (created) {
                questionIdMap.push(created.id);
                
                // Adicionar tags à pergunta
                for (const tagName of q.tags) {
                    const tagId = tagIdMap[tagName];
                    if (tagId) {
                        await runQuery(
                            'INSERT OR IGNORE INTO forum_question_tags (question_id, tag_id) VALUES (?, ?)',
                            [created.id, tagId]
                        );
                    }
                }
            } else {
                questionIdMap.push(null);
            }
        } catch (err) {
            console.error(`     ❌ Erro ao criar pergunta "${q.titulo.substring(0, 30)}...":`, err.message);
            questionIdMap.push(null);
        }
    }
    console.log(`     ✅ ${questionIdMap.filter(id => id !== null).length} perguntas criadas`);

    // 3. Criar respostas
    console.log('  💡 Criando respostas...');
    let answersCreated = 0;
    for (const answer of FORUM_ANSWERS) {
        const questionId = questionIdMap[answer.questionIndex];
        const autorId = userMap[answer.autorNusp];
        
        if (!questionId || !autorId) {
            continue;
        }

        try {
            const createdAt = getDateFromAgo(answer.createdAgo);
            
            await runQuery(
                `INSERT INTO forum_answers (question_id, conteudo, autor_id, votos, is_accepted, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [questionId, answer.conteudo, autorId, answer.votos, answer.isAccepted ? 1 : 0, createdAt.toISOString(), createdAt.toISOString()]
            );
            answersCreated++;
        } catch (err) {
            console.error(`     ❌ Erro ao criar resposta:`, err.message);
        }
    }
    console.log(`     ✅ ${answersCreated} respostas criadas`);

    // 4. Criar alguns votos de exemplo (para simular interação)
    console.log('  👍 Criando votos de exemplo...');
    let votesCreated = 0;
    
    // Votos em perguntas
    for (let i = 0; i < questionIdMap.length; i++) {
        const questionId = questionIdMap[i];
        if (!questionId) continue;
        
        // Cada usuário pode votar em perguntas de outros
        for (let nusp = 3; nusp <= 8; nusp++) {
            const userId = userMap[nusp];
            const questionAutorNusp = FORUM_QUESTIONS[i].autorNusp;
            
            // Não pode votar na própria pergunta
            if (nusp === questionAutorNusp || !userId) continue;
            
            // 60% de chance de votar
            if (Math.random() < 0.6) {
                try {
                    const voteType = Math.random() < 0.85 ? 1 : -1; // 85% upvote, 15% downvote
                    await runQuery(
                        'INSERT OR IGNORE INTO forum_votes (user_id, votable_type, votable_id, vote_type, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                        [userId, 'question', questionId, voteType]
                    );
                    votesCreated++;
                } catch (err) {
                    // Ignorar erros de duplicata
                }
            }
        }
    }
    console.log(`     ✅ ${votesCreated} votos criados`);

    return { 
        questions: questionIdMap.filter(id => id !== null).length, 
        answers: answersCreated, 
        tags: Object.keys(tagIdMap).length 
    };
}

// Execução Principal
async function main() {
    console.log('🚀 Iniciando seed do banco de dados...\n');
    
    try {
        await seedUsers();
        await seedBooks();
        await seedDisciplines();
        const classesCount = await seedDisciplineClasses();
        await seedDonators();
        await seedLoans();
        await seedBadges();
        const forumStats = await seedForum();
        
        console.log('\n✅ Seed concluído com sucesso!');
        console.log('\n📋 Resumo:');
        console.log(`   - ${USERS.length + 2} usuários (incluindo Admin e ProAluno)`);
        console.log(`   - ${BOOKS.length} livros`);
        console.log(`   - ${DISCIPLINES.length} disciplinas`);
        console.log(`   - ${classesCount || 0} turmas criadas`);
        console.log(`   - ${DONATORS.length} doadores`);
        console.log(`   - Empréstimos e badges criados`);
        console.log(`   - Fórum: ${forumStats.questions} perguntas, ${forumStats.answers} respostas, ${forumStats.tags} tags`);
        console.log('\n💡 Credenciais de acesso:');
        console.log('   NUSP 1 = Admin (senha: 1) - MODERADOR DO FÓRUM');
        console.log('   NUSP 2 = ProAluno (senha: 1)');
        console.log('   NUSP 3-8 = Alunos teste (senha: 1)');
        
    } catch (err) {
        console.error('\n❌ Erro durante o seed:', err.message);
        process.exit(1);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Erro ao fechar banco:', err.message);
            } else {
                console.log('\n👋 Conexão com banco encerrada');
            }
        });
    }
}

main();
