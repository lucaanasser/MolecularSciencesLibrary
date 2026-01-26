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
            is_postgrad INTEGER DEFAULT 0,
            ementa TEXT,
            objetivos TEXT,
            conteudo_programatico TEXT,
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

    // USER_SCHEDULE_DISCIPLINES TABLE - Disciplinas na lista do plano (sidebar)
    db.run(`
        CREATE TABLE IF NOT EXISTS user_schedule_disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL,
            discipline_id INTEGER NOT NULL,
            selected_class_id INTEGER,
            is_visible INTEGER DEFAULT 1,
            is_expanded INTEGER DEFAULT 0,
            color TEXT DEFAULT '#14b8a6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(schedule_id) REFERENCES user_schedules(id) ON DELETE CASCADE,
            FOREIGN KEY(discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE,
            FOREIGN KEY(selected_class_id) REFERENCES discipline_classes(id) ON DELETE SET NULL,
            UNIQUE(schedule_id, discipline_id)
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela user_schedule_disciplines:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela user_schedule_disciplines criada com sucesso');
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

    // =====================================================
    // FORUM TABLES - Sistema de perguntas e respostas
    // =====================================================

    // FORUM_QUESTIONS TABLE - Perguntas do fórum
    db.run(`
        CREATE TABLE IF NOT EXISTS forum_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            autor_id INTEGER NOT NULL,
            votos INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            is_closed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(autor_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela forum_questions:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela forum_questions criada com sucesso');
    });

    // FORUM_ANSWERS TABLE - Respostas às perguntas
    db.run(`
        CREATE TABLE IF NOT EXISTS forum_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            conteudo TEXT NOT NULL,
            autor_id INTEGER NOT NULL,
            votos INTEGER DEFAULT 0,
            is_accepted INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(question_id) REFERENCES forum_questions(id) ON DELETE CASCADE,
            FOREIGN KEY(autor_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela forum_answers:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela forum_answers criada com sucesso');
    });

    // FORUM_TAGS TABLE - Tags para categorização
    db.run(`
        CREATE TABLE IF NOT EXISTS forum_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE NOT NULL,
            topico TEXT NOT NULL,
            descricao TEXT,
            created_by_user INTEGER,
            approved INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(created_by_user) REFERENCES users(id) ON DELETE SET NULL
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela forum_tags:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela forum_tags criada com sucesso');
    });

    // FORUM_QUESTION_TAGS TABLE - Relacionamento N:N entre perguntas e tags
    db.run(`
        CREATE TABLE IF NOT EXISTS forum_question_tags (
            question_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (question_id, tag_id),
            FOREIGN KEY(question_id) REFERENCES forum_questions(id) ON DELETE CASCADE,
            FOREIGN KEY(tag_id) REFERENCES forum_tags(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela forum_question_tags:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela forum_question_tags criada com sucesso');
    });

    // FORUM_VOTES TABLE - Votos em perguntas e respostas (polimórfico)
    db.run(`
        CREATE TABLE IF NOT EXISTS forum_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            votable_type TEXT NOT NULL CHECK(votable_type IN ('question', 'answer')),
            votable_id INTEGER NOT NULL,
            vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 1)),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, votable_type, votable_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela forum_votes:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela forum_votes criada com sucesso');
    });

    // =====================================================
    // PUBLIC PROFILE TABLES - Sistema de perfis públicos
    // =====================================================

    // PUBLIC_PROFILES TABLE - Perfil público principal
    db.run(`
        CREATE TABLE IF NOT EXISTS public_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            turma TEXT,
            curso_origem TEXT,
            area_interesse TEXT,
            bio TEXT,
            citacao TEXT,
            citacao_autor TEXT,
            email_publico TEXT,
            linkedin TEXT,
            lattes TEXT,
            github TEXT,
            site TEXT,
            banner_choice TEXT DEFAULT 'purple' CHECK(banner_choice IN ('purple', 'blue', 'green', 'red', 'orange', 'yellow')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela public_profiles:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela public_profiles criada com sucesso');
    });

    // PROFILE_TAGS TABLE - Tags do perfil (grande-área, área, subárea, custom)
    db.run(`
        CREATE TABLE IF NOT EXISTS profile_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category IN ('grande-area', 'area', 'subarea', 'custom')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela profile_tags:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela profile_tags criada com sucesso');
    });

    // ADVANCED_CYCLES TABLE - Ciclos avançados
    db.run(`
        CREATE TABLE IF NOT EXISTS advanced_cycles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tema TEXT NOT NULL,
            orientador TEXT NOT NULL,
            coorientadores TEXT,
            instituto TEXT,
            universidade TEXT,
            semestres INTEGER DEFAULT 4,
            ano_inicio INTEGER,
            ano_conclusao INTEGER,
            descricao TEXT,
            color TEXT DEFAULT '#14b8a6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela advanced_cycles:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela advanced_cycles criada com sucesso');
    });

    // ADVANCED_CYCLE_TAGS TABLE - Tags dos ciclos avançados (max 5: 2 área + 3 subárea)
    db.run(`
        CREATE TABLE IF NOT EXISTS advanced_cycle_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cycle_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category IN ('area', 'subarea')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(cycle_id) REFERENCES advanced_cycles(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela advanced_cycle_tags:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela advanced_cycle_tags criada com sucesso');
    });

    // PROFILE_DISCIPLINES TABLE - Disciplinas cursadas
    db.run(`
        CREATE TABLE IF NOT EXISTS profile_disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            codigo TEXT NOT NULL,
            nome TEXT NOT NULL,
            professor TEXT,
            ano INTEGER NOT NULL,
            semestre INTEGER NOT NULL CHECK(semestre IN (1, 2)),
            nota TEXT,
            avancado_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(avancado_id) REFERENCES advanced_cycles(id) ON DELETE SET NULL
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela profile_disciplines:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela profile_disciplines criada com sucesso');
    });

    // INTERNATIONAL_EXPERIENCES TABLE - Experiências internacionais
    db.run(`
        CREATE TABLE IF NOT EXISTS international_experiences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('intercambio', 'estagio', 'pesquisa', 'curso', 'outro')),
            pais TEXT NOT NULL,
            instituicao TEXT NOT NULL,
            programa TEXT,
            orientador TEXT,
            descricao TEXT,
            ano_inicio INTEGER NOT NULL,
            ano_fim INTEGER,
            duracao_numero INTEGER,
            duracao_unidade TEXT CHECK(duracao_unidade IN ('dias', 'semanas', 'meses', 'anos')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela international_experiences:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela international_experiences criada com sucesso');
    });

    // POST_CM_INFO TABLE - Informações pós-CM
    db.run(`
        CREATE TABLE IF NOT EXISTS post_cm_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('trabalho', 'pos-graduacao', 'nova-graduacao', 'retorno-curso-origem', 'outro')),
            instituicao TEXT NOT NULL,
            cargo TEXT,
            orientador TEXT,
            descricao TEXT,
            ano_inicio INTEGER,
            ano_fim INTEGER,
            github TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela post_cm_info:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela post_cm_info criada com sucesso');
    });

    // POST_CM_AREAS TABLE - Áreas do pós-CM
    db.run(`
        CREATE TABLE IF NOT EXISTS post_cm_areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_cm_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(post_cm_id) REFERENCES post_cm_info(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela post_cm_areas:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela post_cm_areas criada com sucesso');
    });

    // PROFILE_FOLLOWS TABLE - Sistema de seguir usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS profile_follows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(follower_id, following_id),
            FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [initDb] Erro ao criar tabela profile_follows:', err.message);
            process.exit(1);
        }
        console.log('🟢 [initDb] Tabela profile_follows criada com sucesso');
    });

    // Criar índices para melhor performance do fórum
    db.run(`CREATE INDEX IF NOT EXISTS idx_forum_questions_autor ON forum_questions(autor_id)`, (err) => {
        if (err) console.warn('🟡 [initDb] Aviso ao criar índice idx_forum_questions_autor:', err.message);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_forum_questions_created ON forum_questions(created_at DESC)`, (err) => {
        if (err) console.warn('🟡 [initDb] Aviso ao criar índice idx_forum_questions_created:', err.message);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_forum_questions_votos ON forum_questions(votos DESC)`, (err) => {
        if (err) console.warn('🟡 [initDb] Aviso ao criar índice idx_forum_questions_votos:', err.message);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_forum_answers_question ON forum_answers(question_id)`, (err) => {
        if (err) console.warn('🟡 [initDb] Aviso ao criar índice idx_forum_answers_question:', err.message);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_forum_votes_votable ON forum_votes(votable_type, votable_id)`, (err) => {
        if (err) console.warn('🟡 [initDb] Aviso ao criar índice idx_forum_votes_votable:', err.message);
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