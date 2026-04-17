/**
 * Responsabilidade: criar tabelas do dominio library.
 * Camada: database/library.
 * Entradas/Saidas: recebe db e helpers SQL, cria schema e dados padrao.
 * Dependencias criticas: run/get (shared sqlite helpers).
 */

const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: cria schema do dominio library e aplica seeds iniciais de badges/prateleiras.
 * Onde e usada: initLibraryDb.
 * Dependencias chamadas: run e get do contexto.
 * Efeitos colaterais: cria tabelas e popula dados padrao do dominio.
 */
async function createLibraryTables({ run, get }) {
    await run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            NUSP INTEGER NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            password_hash TEXT,
            role TEXT NOT NULL,
            profile_image TEXT,
            class TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL DEFAULT 'active'
        )`
    );
    log.success('Tabela users criada com sucesso');

    await run(
        `CREATE TABLE IF NOT EXISTS books (
            id INTEGER UNIQUE PRIMARY KEY,
            code TEXT NOT NULL,
            area TEXT NOT NULL,
            subarea TEXT NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            authors TEXT NOT NULL,
            edition INTEGER NOT NULL,
            volume INTEGER,
            language TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'disponível'
        )`
    );
    log.success('Tabela books criada com sucesso');

    await run(
        `CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            returned_at TIMESTAMP,
            renewals INTEGER NOT NULL DEFAULT 0,
            due_date TIMESTAMP,
            is_extended INTEGER NOT NULL DEFAULT 0,
            last_nudged_at TIMESTAMP,
            FOREIGN KEY(book_id) REFERENCES books(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`
    );
    log.success('Tabela loans criada com sucesso');

    await run(
        `CREATE TABLE IF NOT EXISTS badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            image_locked TEXT NOT NULL,
            image_unlocked TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    );
    log.success('Tabela badges criada com sucesso');

    await run(
        `CREATE TABLE IF NOT EXISTS donators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            tag TEXT,
            book_id INTEGER,
            donation_type TEXT NOT NULL,
            amount REAL,
            contact TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(book_id) REFERENCES books(id)
        )`
    );
    log.success('Tabela donators criada com sucesso');

    await run(
        `CREATE TABLE IF NOT EXISTS virtual_bookshelf (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shelf_number INTEGER NOT NULL,
            shelf_row INTEGER NOT NULL,
            book_code_start TEXT,
            book_code_end TEXT,
            UNIQUE(shelf_number, shelf_row)
        )`
    );
    log.success('Tabela virtual_bookshelf criada com sucesso');

    const defaultBadges = [
        {
            name: 'Leitor Frequente',
            description: 'Você já fez 10 empréstimos.',
            image_locked: '/images/badges/leitor_frequente_locked.png',
            image_unlocked: '/images/badges/leitor_frequente_unlocked.png'
        }
    ];

    for (const badge of defaultBadges) {
        const row = await get('SELECT * FROM badges WHERE name = ?', [badge.name]);
        if (!row) {
            await run(
                `INSERT INTO badges (name, description, image_locked, image_unlocked) VALUES (?, ?, ?, ?)`,
                [badge.name, badge.description, badge.image_locked, badge.image_unlocked]
            );
        }
    }

    for (let shelfNumber = 1; shelfNumber <= 4; shelfNumber += 1) {
        for (let shelfRow = 1; shelfRow <= 6; shelfRow += 1) {
            await run(
                `INSERT OR IGNORE INTO virtual_bookshelf (shelf_number, shelf_row, book_code_start, book_code_end)
                 VALUES (?, ?, ?, ?)`,
                [shelfNumber, shelfRow, null, null]
            );
        }
    }
    log.success('Configuracao padrao de prateleiras inserida');
}

module.exports = {
    createLibraryTables
};
