const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt'); 
require('dotenv').config();

// Database configuration - usar pasta database na raiz do projeto (fora de backend)
const projectRoot = path.resolve(__dirname, '..', '..', '..');
const defaultDbPath = path.join(projectRoot, 'database', 'library.db');
const dbUrl = process.env.DATABASE_URL || `sqlite://${defaultDbPath}`;
const dbPath = dbUrl.replace('sqlite://', '');
const dbDir = path.dirname(dbPath);
const SALT_ROUNDS = 10;

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
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
            phone TEXT NOT NULL,
            password_hash TEXT, -- Agora permite NULL
            role TEXT NOT NULL, -- 'admin', 'aluno', 'proaluno'
            profile_image TEXT, -- Caminho da imagem de perfil
            class TEXT, -- Número da turma
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
            language INTEGER NOT NULL,
            is_reserved INTEGER DEFAULT 0
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela books:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela books criada com sucesso');
    });

    // BORROWED_BOOKS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            returned_at TIMESTAMP,
            renewals INTEGER NOT NULL DEFAULT 0, 
            due_date TIMESTAMP, 
            is_extended INTEGER NOT NULL DEFAULT 0, -- 0 normal, 1 estendido
            last_nudged_at TIMESTAMP, -- último nudge que impactou
            FOREIGN KEY(book_id) REFERENCES books(id)
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela loans:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela loans criada com sucesso');
    });

    // NOTIFICATIONS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL, -- 'overdue', 'nudge', etc
            message TEXT NOT NULL,
            metadata TEXT,
            loan_id INTEGER, -- vínculo direto com empréstimo para nudges
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
            max_books_per_user INTEGER NOT NULL DEFAULT 5,
            max_renewals INTEGER NOT NULL DEFAULT 2,
            renewal_days INTEGER NOT NULL DEFAULT 7,
            extension_window_days INTEGER NOT NULL DEFAULT 3, -- janela (dias) antes do vencimento para liberar extensão
            extension_block_multiplier INTEGER NOT NULL DEFAULT 3, -- multiplicador (renewal_days * multiplier)
            shortened_due_days_after_nudge INTEGER NOT NULL DEFAULT 5, -- prazo mínimo após nudge em fase estendida
            nudge_cooldown_hours INTEGER NOT NULL DEFAULT 24, -- intervalo entre nudges permitidos
            pending_nudge_extension_days INTEGER NOT NULL DEFAULT 5 -- NOVO
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela rules:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela rules criado com sucesso');
        // Insere registro padrão se não existir
        db.get('SELECT * FROM rules WHERE id = 1', (err, row) => {
            if (!row) {
                db.run(
                    `INSERT INTO rules (id, max_days, overdue_reminder_days, max_books_per_user, max_renewals, renewal_days, extension_window_days, extension_block_multiplier, shortened_due_days_after_nudge, nudge_cooldown_hours, pending_nudge_extension_days) VALUES (1, 7, 3, 5, 2, 7, 3, 3, 5, 24, 5)`
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

    // DISCIPLINES TABLE - Disciplinas da USP (estrutura simplificada para grade interativa)
    db.run(`
        CREATE TABLE IF NOT EXISTS disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            unidade TEXT,
            campus TEXT,
            creditos_aula INTEGER DEFAULT 0,
            creditos_trabalho INTEGER DEFAULT 0,
            has_valid_classes INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela disciplines:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela disciplines criada com sucesso');
    });

    // DISCIPLINE_CLASSES TABLE - Turmas das disciplinas
    db.run(`
        CREATE TABLE IF NOT EXISTS discipline_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discipline_id INTEGER NOT NULL,
            codigo_turma TEXT NOT NULL,
            codigo_turma_teorica TEXT,
            tipo TEXT,
            inicio DATE,
            fim DATE,
            observacoes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela discipline_classes:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela discipline_classes criada com sucesso');
    });

    // CLASS_SCHEDULES TABLE - Horários de aula
    db.run(`
        CREATE TABLE IF NOT EXISTS class_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            dia TEXT NOT NULL,
            horario_inicio TEXT NOT NULL,
            horario_fim TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(class_id) REFERENCES discipline_classes(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela class_schedules:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela class_schedules criada com sucesso');
    });

    // CLASS_PROFESSORS TABLE - Professores por turma/horário
    db.run(`
        CREATE TABLE IF NOT EXISTS class_professors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            schedule_id INTEGER,
            nome TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(class_id) REFERENCES discipline_classes(id) ON DELETE CASCADE,
            FOREIGN KEY(schedule_id) REFERENCES class_schedules(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela class_professors:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela class_professors criada com sucesso');
    });

    // USER_SCHEDULES TABLE - Grades/Planos salvos dos usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS user_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL DEFAULT 'Plano 1',
            is_active INTEGER DEFAULT 1,
            is_deleted INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela user_schedules:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela user_schedules criada com sucesso');
    });

    // USER_SCHEDULE_CLASSES TABLE - Turmas adicionadas à grade do usuário
    db.run(`
        CREATE TABLE IF NOT EXISTS user_schedule_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            color TEXT DEFAULT '#14b8a6',
            is_visible INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(schedule_id) REFERENCES user_schedules(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES discipline_classes(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela user_schedule_classes:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela user_schedule_classes criada com sucesso');
    });

    // USER_CUSTOM_DISCIPLINES TABLE - Disciplinas adicionadas manualmente pelo usuário
    db.run(`
        CREATE TABLE IF NOT EXISTS user_custom_disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL,
            nome TEXT NOT NULL,
            codigo TEXT,
            dia TEXT NOT NULL,
            horario_inicio TEXT NOT NULL,
            horario_fim TEXT NOT NULL,
            color TEXT DEFAULT '#14b8a6',
            is_visible INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(schedule_id) REFERENCES user_schedules(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela user_custom_disciplines:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela user_custom_disciplines criada com sucesso');
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
                        `INSERT INTO users (name, NUSP, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`,
                        ['Administrador', adminNUSP, adminEmail, '', adminHash, 'admin'],
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
                        `INSERT INTO users (name, NUSP, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`,
                        ['Pro Aluno', proalunoNUSP, proalunoEmail, '', proalunoHash, 'proaluno'],
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

    insertSpecialUsersAndClose();
});