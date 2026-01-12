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
    
    // Pegar alguns usuários e livros para criar empréstimos
    const users = await allQuery('SELECT id FROM users WHERE role = ? LIMIT 3', ['aluno']);
    const books = await allQuery('SELECT id FROM books LIMIT 5');
    
    if (users.length === 0 || books.length === 0) {
        console.log('  ⏭️  Sem usuários ou livros para criar empréstimos');
        return;
    }
    
    // Criar alguns empréstimos ativos
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < Math.min(3, users.length, books.length); i++) {
        try {
            await runQuery(
                `INSERT INTO loans (book_id, student_id, borrowed_at, due_date, renewals, is_extended, returned_at) 
                 VALUES (?, ?, ?, ?, 0, 0, NULL)`,
                [books[i].id, users[i].id, now.toISOString(), sevenDaysFromNow.toISOString()]
            );
            
            // Marcar livro como reservado
            await runQuery('UPDATE books SET is_reserved = 1 WHERE id = ?', [books[i].id]);
            
            console.log(`  ✅ Empréstimo criado: Livro ${books[i].id} para Usuário ${users[i].id}`);
        } catch (err) {
            console.error(`  ❌ Erro ao criar empréstimo:`, err.message);
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

// Execução Principal
async function main() {
    console.log('🚀 Iniciando seed do banco de dados...\n');
    
    try {
        await seedUsers();
        await seedBooks();
        await seedDisciplines();
        await seedDonators();
        await seedLoans();
        await seedBadges();
        
        console.log('\n✅ Seed concluído com sucesso!');
        console.log('\n📋 Resumo:');
        console.log(`   - ${USERS.length} usuários`);
        console.log(`   - ${BOOKS.length} livros`);
        console.log(`   - ${DISCIPLINES.length} disciplinas`);
        console.log(`   - ${DONATORS.length} doadores`);
        console.log(`   - Empréstimos e badges criados`);
        console.log('\n💡 Credenciais padrão para usuários de teste:');
        console.log('   Email: <email do usuário>');
        console.log('   Senha: senha123');
        
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
