const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt'); 
require('dotenv').config();

// Database configuration - use environment variable like db.js
const dbUrl = process.env.DATABASE_URL || 'sqlite:///app/database/library.db';
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

        // Insert test data
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