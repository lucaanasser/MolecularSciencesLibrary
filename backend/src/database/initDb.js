const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt'); 
require('dotenv').config();

// Database configuration - use environment variable like db.js
const dbUrl = process.env.DATABASE_URL || 'sqlite://./database/library.db';
const dbPath = dbUrl.replace('sqlite://', '');
const dbDir = path.dirname(dbPath);
const SALT_ROUNDS = 10;

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    // Add permissions to directory
    fs.chmodSync(dbDir, 0o777);
}

console.log(`🔵 [initDb] Inicializando banco de dados em: ${dbPath}`);

// Create and initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('🔴 [initDb] Erro ao criar banco de dados:', err.message);
        process.exit(1);
    }
    console.log('🟢 [initDb] Conectado ao banco de dados SQLite.');
});

db.serialize(() => {
    // USERS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            NUSP INTEGER NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT, -- Agora permite NULL
            role TEXT NOT NULL, -- 'admin', 'aluno', 'proaluno'
            profile_image TEXT, -- Caminho da imagem de perfil
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela users:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela users criada com sucesso');
    });

    // BOOKS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER UNIQUE PRIMARY KEY,
            code TEXT NOT NULL, 
            area TEXT NOT NULL,
            subarea INTEGER NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            authors TEXT NOT NULL,
            edition INTEGER NOT NULL,
            volume INTEGER,
            language INTEGER NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela books:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela books criada com sucesso');

        // Livro de teste
        const testBook = {
            id: 9781234567890, 
            area: 'Variados',
            subarea: 1,
            authors: 'Teste',
            edition: 1,
            language: 2, 
            code: 'VAR-01.01-v1',
            title: 'Teste de Livro',
            subtitle: 'Teste de Subtitulo',
            volume: 1 
        };
        db.run(`
            INSERT INTO books (id, area, subarea, authors, edition, language, code, title, subtitle, volume)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            testBook.id,
            testBook.area,
            testBook.subarea,
            testBook.authors,
            testBook.edition,
            testBook.language,
            testBook.code,
            testBook.title,
            testBook.subtitle,
            testBook.volume 
        ], function(err) {
            if (err) {
                console.error('🟡 [initDb] Erro ao inserir livro de teste:', err.message);
            } else {
                console.log('🟢 [initDb] Livro de teste inserido com sucesso');
            }
        });
        // Chama a função para inserir livros aleatórios
        insertRandomBooks(40);
    });

    // BORROWED_BOOKS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS borrowed_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            returned_at TIMESTAMP,
            FOREIGN KEY(book_id) REFERENCES books(id)
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela borrowed_books:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela borrowed_books criada com sucesso');
    });

    // NOTIFICATIONS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL, -- 'overdue', 'nudge', etc
            message TEXT NOT NULL,
            metadata TEXT,
            status TEXT DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela notifications:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela notifications criada com sucesso');
    });

    // RULES TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS rules (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            max_days INTEGER NOT NULL DEFAULT 7,
            overdue_reminder_days INTEGER NOT NULL DEFAULT 3,
            max_books_per_user INTEGER NOT NULL DEFAULT 5
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela rules:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela rules criada com sucesso');
        // Insere registro padrão se não existir
        db.get('SELECT * FROM rules WHERE id = 1', (err, row) => {
            if (!row) {
                db.run(
                    `INSERT INTO rules (id, max_days, overdue_reminder_days, max_books_per_user) VALUES (1, 7, 3, 5)`
                );
            }
        });
    });

    // BADGES TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            image_locked TEXT NOT NULL, -- Caminho ou URL da imagem do badge bloqueado
            image_unlocked TEXT NOT NULL, -- Caminho ou URL da imagem do badge desbloqueado
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela badges:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela badges criada com sucesso');

        // Inserção dos badges padrão se não existirem
        const defaultBadges = [
            {
                name: 'Leitor Frequente',
                description: 'Você já fez 10 empréstimos.',
                image_locked: '/images/badges/leitor_frequente_locked.png',
                image_unlocked: '/images/badges/leitor_frequente_unlocked.png'
            }
        ];
        defaultBadges.forEach(badge => {
            db.get('SELECT * FROM badges WHERE name = ?', [badge.name], (err, row) => {
                if (!row) {
                    db.run(
                        `INSERT INTO badges (name, description, image_locked, image_unlocked) VALUES (?, ?, ?, ?)`,
                        [badge.name, badge.description, badge.image_locked, badge.image_unlocked]
                    );
                }
            });
        });
    });

    // DONATORS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS donators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            book_id INTEGER,
            donation_type TEXT NOT NULL, -- 'book' ou 'money'
            amount REAL,
            contact TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(book_id) REFERENCES books(id)
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela donators:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela donators criada com sucesso');
    });

    // Tabela de organização da estante virtual (código inicial de cada prateleira)
    db.run(`
        CREATE TABLE IF NOT EXISTS virtual_bookshelf (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shelf_number INTEGER NOT NULL,
            shelf_row INTEGER NOT NULL,
            book_code_start TEXT,
            book_code_end TEXT,
            is_last_shelf BOOLEAN DEFAULT FALSE,
            UNIQUE(shelf_number, shelf_row)
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela virtual_bookshelf:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela virtual_bookshelf criada com sucesso');
        
        // Insere configuração padrão das prateleiras (4 estantes x 6 prateleiras)
        const defaultShelves = [];
        for (let shelf_number = 1; shelf_number <= 4; shelf_number++) {
            for (let shelf_row = 1; shelf_row <= 6; shelf_row++) {
                defaultShelves.push([shelf_number, shelf_row, null, null, false]);
            }
        }
        
        const insertShelf = db.prepare(`
            INSERT OR IGNORE INTO virtual_bookshelf (shelf_number, shelf_row, book_code_start, book_code_end, is_last_shelf)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        defaultShelves.forEach(shelf => {
            insertShelf.run(shelf);
        });
        insertShelf.finalize();
        
        console.log('🟢 [initDb] Configuração padrão de prateleiras inserida');
    });

    // Função para gerar código de livro no padrão BooksService
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

    // Função para inserir vários livros aleatórios com códigos únicos e corretos
    function insertRandomBooks(qtd = 100) {
        const areas = [
            { area: 'Física', subareas: [1, 2, 3] },
            { area: 'Química', subareas: [1, 2] },
            { area: 'Biologia', subareas: [1, 2, 3, 4] },
            { area: 'Matemática', subareas: [1, 2] },
            { area: 'Computação', subareas: [1, 2, 3] },
            { area: 'Variados', subareas: [1] }
        ];
        const titulos = [
            'Introdução à', 'Fundamentos de', 'Teoria de', 'Princípios de', 'Manual de', 'Guia Prático de', 'Compêndio de'
        ];
        const temas = [
            'Mecânica', 'Química Orgânica', 'Genética', 'Álgebra Linear', 'Programação', 'Estatística', 'Física Moderna', 'Redes', 'Cálculo', 'Bioquímica'
        ];
        const autores = [
            'João Silva', 'Maria Souza', 'Carlos Pereira', 'Ana Lima', 'Fernanda Costa', 'Ricardo Alves', 'Patrícia Rocha', 'Lucas Martins', 'Juliana Dias', 'Bruno Teixeira'
        ];
        const idiomas = [1, 2, 3]; // pt, en, es
        let baseId = 9781000000000;
        let exemplarCount = 0;

        // Map para controlar o sequencial por área/subárea/volume
        const seqMap = {};

        for (let i = 0; i < qtd; i++) {
            const areaObj = areas[Math.floor(Math.random() * areas.length)];
            const area = areaObj.area;
            const subarea = areaObj.subareas[Math.floor(Math.random() * areaObj.subareas.length)];
            const key = `${area}_${subarea}`;
            if (!seqMap[key]) seqMap[key] = {};
            // Decide se terá volume
            let volume = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : null;
            let volumeKey = volume || 0;
            if (!seqMap[key][volumeKey]) seqMap[key][volumeKey] = 1;
            const seq = seqMap[key][volumeKey];

            const titulo = titulos[Math.floor(Math.random() * titulos.length)] + ' ' + temas[Math.floor(Math.random() * temas.length)];
            const autor = autores[Math.floor(Math.random() * autores.length)];
            const edition = Math.floor(Math.random() * 5) + 1;
            const language = idiomas[Math.floor(Math.random() * idiomas.length)];
            const code = generateBookCode(area, subarea, seq, volume);
            const title = titulo;
            const subtitle = Math.random() > 0.5 ? `Volume especial ${edition}` : null;

            // Decide quantos exemplares para este livro (1 a 3)
            const exemplares = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 2 : 1;
            for (let ex = 1; ex <= exemplares; ex++) {
                const id = baseId + exemplarCount;
                db.run(
                    `INSERT OR IGNORE INTO books (id, area, subarea, authors, edition, language, code, title, subtitle, volume)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, area, subarea, autor, edition, language, code, title, subtitle, volume],
                    function(err) {
                        if (err) {
                            console.error('🟡 [initDb] Erro ao inserir exemplar aleatório:', err.message);
                        }
                    }
                );
                exemplarCount++;
            }
            // Incrementa o sequencial para próxima chamada
            seqMap[key][volumeKey]++;
        }
        console.log(`🟢 [initDb] Livros aleatórios (com exemplares) inseridos: ${exemplarCount}`);
    }

    // Criação dos usuários especiais
    const adminEmail = 'admin@biblioteca.com';
    const proalunoEmail = 'proaluno@biblioteca.com';
    const adminNUSP = 1;
    const proalunoNUSP = 2;
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminsenha';
    const proalunoPassword = process.env.PROALUNO_PASSWORD || 'proalunosenha';

    async function insertSpecialUsersAndClose() {
        try {
            const adminRow = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM users WHERE NUSP = ?', [adminNUSP], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            if (!adminRow) {
                const adminHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
                await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO users (name, NUSP, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
                        ['Administrador', adminNUSP, adminEmail, adminHash, 'admin'],
                        (err) => {
                            if (err) {
                                console.error('🔴 [initDb] Erro ao criar admin:', err.message);
                                reject(err);
                            } else {
                                console.log('🟢 [initDb] Usuário admin criado');
                                resolve();
                            }
                        }
                    );
                });
            } else {
                console.log('🟡 [initDb] Usuário admin já existe');
            }

            const proalunoRow = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM users WHERE NUSP = ?', [proalunoNUSP], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            if (!proalunoRow) {
                const proalunoHash = await bcrypt.hash(proalunoPassword, SALT_ROUNDS);
                await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO users (name, NUSP, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
                        ['Pro Aluno', proalunoNUSP, proalunoEmail, proalunoHash, 'proaluno'],
                        (err) => {
                            if (err) {
                                console.error('🔴 [initDb] Erro ao criar proaluno:', err.message);
                                reject(err);
                            } else {
                                console.log('🟢 [initDb] Usuário proaluno criado');
                                resolve();
                            }
                        }
                    );
                });
            } else {
                console.log('🟡 [initDb] Usuário proaluno já existe');
            }
        } catch (err) {
            console.error('🔴 [initDb] Erro ao inserir usuários especiais:', err.message);
        } finally {
            db.close((err) => {
                if (err) {
                    console.error('🔴 [initDb] Erro ao fechar banco de dados:', err.message);
                }
                console.log('🟢 [initDb] Conexão com banco de dados encerrada.');
            });
        }
    }

    // Chame a função após a criação das tabelas
    insertSpecialUsersAndClose();
});