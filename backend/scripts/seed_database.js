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
const USERS = [
    { name: 'João Silva', nusp: 12345678, email: 'joao.silva@usp.br', phone: '(11) 98765-4321', role: 'aluno', class: '2024A' },
    { name: 'Maria Santos', nusp: 23456789, email: 'maria.santos@usp.br', phone: '(11) 97654-3210', role: 'aluno', class: '2024B' },
    { name: 'Pedro Oliveira', nusp: 34567890, email: 'pedro.oliveira@usp.br', phone: '(11) 96543-2109', role: 'aluno', class: '2023A' },
    { name: 'Ana Costa', nusp: 45678901, email: 'ana.costa@usp.br', phone: '(11) 95432-1098', role: 'aluno', class: '2023B' },
    { name: 'Carlos Ferreira', nusp: 56789012, email: 'carlos.ferreira@usp.br', phone: '(11) 94321-0987', role: 'aluno', class: '2024A' },
    { name: 'Juliana Almeida', nusp: 67890123, email: 'juliana.almeida@usp.br', phone: '(11) 93210-9876', role: 'aluno', class: '2024B' },
    { name: 'Roberto Lima', nusp: 78901234, email: 'roberto.lima@usp.br', phone: '(11) 92109-8765', role: 'aluno', class: '2023A' },
    { name: 'Fernanda Souza', nusp: 89012345, email: 'fernanda.souza@usp.br', phone: '(11) 91098-7654', role: 'aluno', class: '2023B' },
    { name: 'Lucas Pereira', nusp: 90123456, email: 'lucas.pereira@usp.br', phone: '(11) 90987-6543', role: 'proaluno', class: '2022A' },
    { name: 'Mariana Ribeiro', nusp: 10234567, email: 'mariana.ribeiro@usp.br', phone: '(11) 89876-5432', role: 'proaluno', class: '2022B' },
];

const BOOKS = [
    // Física
    { area: 'Física', subarea: 1, title: 'Física I - Mecânica', authors: 'Halliday, Resnick, Walker', edition: 10, volume: 1, language: 1 },
    { area: 'Física', subarea: 1, title: 'Física I - Mecânica', authors: 'Halliday, Resnick, Walker', edition: 10, volume: 1, language: 1 },
    { area: 'Física', subarea: 2, title: 'Física II - Termodinâmica', authors: 'Halliday, Resnick, Walker', edition: 10, volume: 2, language: 1 },
    { area: 'Física', subarea: 3, title: 'Física III - Eletromagnetismo', authors: 'Halliday, Resnick, Walker', edition: 10, volume: 3, language: 1 },
    { area: 'Física', subarea: 4, title: 'Fundamentos de Física Moderna', authors: 'Eisberg, Resnick', edition: 1, volume: 0, language: 1 },
    { area: 'Física', subarea: 5, title: 'Mecânica Quântica', authors: 'Cohen-Tannoudji', edition: 2, volume: 1, language: 1 },
    
    // Química
    { area: 'Química', subarea: 1, title: 'Química Geral', authors: 'Atkins, Jones', edition: 9, volume: 0, language: 1 },
    { area: 'Química', subarea: 1, title: 'Química Geral', authors: 'Atkins, Jones', edition: 9, volume: 0, language: 1 },
    { area: 'Química', subarea: 2, title: 'Química Orgânica', authors: 'Solomons, Fryhle', edition: 12, volume: 1, language: 1 },
    { area: 'Química', subarea: 2, title: 'Química Orgânica', authors: 'Solomons, Fryhle', edition: 12, volume: 2, language: 1 },
    { area: 'Química', subarea: 3, title: 'Físico-Química', authors: 'Atkins, De Paula', edition: 10, volume: 1, language: 1 },
    { area: 'Química', subarea: 4, title: 'Química Inorgânica', authors: 'Shriver, Atkins', edition: 6, volume: 0, language: 1 },
    { area: 'Química', subarea: 5, title: 'Química Analítica Quantitativa', authors: 'Harris', edition: 8, volume: 0, language: 1 },
    
    // Biologia
    { area: 'Biologia', subarea: 1, title: 'Biologia Celular e Molecular', authors: 'Alberts, Johnson, Lewis', edition: 6, volume: 0, language: 1 },
    { area: 'Biologia', subarea: 2, title: 'Bioquímica', authors: 'Lehninger, Nelson, Cox', edition: 7, volume: 0, language: 1 },
    { area: 'Biologia', subarea: 2, title: 'Bioquímica', authors: 'Voet, Voet, Pratt', edition: 4, volume: 0, language: 1 },
    { area: 'Biologia', subarea: 3, title: 'Genética', authors: 'Griffiths, Wessler, Carroll', edition: 11, volume: 0, language: 1 },
    { area: 'Biologia', subarea: 4, title: 'Biologia dos Microrganismos', authors: 'Madigan, Bender, Buckley', edition: 15, volume: 0, language: 1 },
    { area: 'Biologia', subarea: 5, title: 'Fisiologia Humana', authors: 'Guyton, Hall', edition: 13, volume: 0, language: 1 },
    { area: 'Biologia', subarea: 6, title: 'Ecologia', authors: 'Begon, Townsend, Harper', edition: 4, volume: 0, language: 1 },
    
    // Matemática
    { area: 'Matemática', subarea: 1, title: 'Cálculo I', authors: 'Stewart', edition: 8, volume: 1, language: 1 },
    { area: 'Matemática', subarea: 1, title: 'Cálculo I', authors: 'Stewart', edition: 8, volume: 1, language: 1 },
    { area: 'Matemática', subarea: 2, title: 'Cálculo II', authors: 'Stewart', edition: 8, volume: 2, language: 1 },
    { area: 'Matemática', subarea: 3, title: 'Álgebra Linear', authors: 'Boldrini, Costa, Figueiredo', edition: 3, volume: 0, language: 1 },
    { area: 'Matemática', subarea: 4, title: 'Equações Diferenciais', authors: 'Boyce, DiPrima', edition: 10, volume: 0, language: 1 },
    { area: 'Matemática', subarea: 5, title: 'Análise Real', authors: 'Lima, Elon Lages', edition: 1, volume: 1, language: 1 },
    { area: 'Matemática', subarea: 6, title: 'Estatística Básica', authors: 'Bussab, Morettin', edition: 9, volume: 0, language: 1 },
    
    // Computação
    { area: 'Computação', subarea: 1, title: 'Introdução à Programação em Python', authors: 'Downey', edition: 2, volume: 0, language: 1 },
    { area: 'Computação', subarea: 2, title: 'Estruturas de Dados e Algoritmos', authors: 'Cormen, Leiserson, Rivest', edition: 3, volume: 0, language: 1 },
    { area: 'Computação', subarea: 3, title: 'Sistemas Operacionais', authors: 'Tanenbaum, Bos', edition: 4, volume: 0, language: 1 },
    { area: 'Computação', subarea: 4, title: 'Redes de Computadores', authors: 'Tanenbaum, Wetherall', edition: 5, volume: 0, language: 1 },
    { area: 'Computação', subarea: 5, title: 'Banco de Dados', authors: 'Elmasri, Navathe', edition: 7, volume: 0, language: 1 },
    { area: 'Computação', subarea: 6, title: 'Inteligência Artificial', authors: 'Russell, Norvig', edition: 4, volume: 0, language: 1 },
    
    // Variados
    { area: 'Variados', subarea: 1, title: 'Redação Científica', authors: 'Day, Robert A.', edition: 6, volume: 0, language: 1 },
    { area: 'Variados', subarea: 2, title: 'Ética na Ciência', authors: 'Resnik, David B.', edition: 1, volume: 0, language: 1 },
    { area: 'Variados', subarea: 3, title: 'História da Ciência', authors: 'Kuhn, Thomas S.', edition: 1, volume: 0, language: 1 },
    { area: 'Variados', subarea: 4, title: 'Metodologia Científica', authors: 'Gil, Antonio Carlos', edition: 7, volume: 0, language: 1 },
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
    { codigo: 'MAC0122', nome: 'Algoritmos e Estruturas de Dados', unidade: 'IME', campus: 'São Paulo', creditos_aula: 6, creditos_trabalho: 0 },
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
    console.log('\n📝 Criando usuários...');
    const defaultPassword = await bcrypt.hash('senha123', SALT_ROUNDS);
    
    for (const user of USERS) {
        try {
            const existing = await getQuery('SELECT * FROM users WHERE NUSP = ?', [user.nusp]);
            if (!existing) {
                await runQuery(
                    `INSERT INTO users (name, NUSP, email, phone, password_hash, role, class) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [user.name, user.nusp, user.email, user.phone, defaultPassword, user.role, user.class]
                );
                console.log(`  ✅ Usuário criado: ${user.name} (${user.email})`);
            } else {
                console.log(`  ⏭️  Usuário já existe: ${user.name}`);
            }
        } catch (err) {
            console.error(`  ❌ Erro ao criar usuário ${user.name}:`, err.message);
        }
    }
}

async function seedBooks() {
    console.log('\n📚 Criando livros...');
    
    // Agrupar livros por área e subárea para gerar códigos sequenciais
    const booksByAreaSubarea = {};
    
    for (const book of BOOKS) {
        const key = `${book.area}-${book.subarea}`;
        if (!booksByAreaSubarea[key]) {
            booksByAreaSubarea[key] = [];
        }
        booksByAreaSubarea[key].push(book);
    }
    
    let bookId = 1;
    for (const key in booksByAreaSubarea) {
        const books = booksByAreaSubarea[key];
        let seq = 1;
        
        for (const book of books) {
            try {
                const code = generateBookCode(book.area, book.subarea, seq, book.volume);
                
                const existing = await getQuery('SELECT * FROM books WHERE code = ?', [code]);
                if (!existing) {
                    await runQuery(
                        `INSERT INTO books (id, code, area, subarea, title, authors, edition, volume, language, is_reserved) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                        [bookId, code, book.area, book.subarea, book.title, book.authors, book.edition, book.volume, book.language]
                    );
                    console.log(`  ✅ Livro criado: ${code} - ${book.title}`);
                    seq++;
                } else {
                    console.log(`  ⏭️  Livro já existe: ${code}`);
                }
                bookId++;
            } catch (err) {
                console.error(`  ❌ Erro ao criar livro ${book.title}:`, err.message);
                bookId++;
            }
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
