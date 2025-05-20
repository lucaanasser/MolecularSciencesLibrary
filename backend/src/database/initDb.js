const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

// Database configuration - use environment variable like db.js
const dbUrl = process.env.DATABASE_URL || 'sqlite:///app/database/library.db';
const dbPath = dbUrl.replace('sqlite://', '');
const dbDir = path.dirname(dbPath);

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    // Add permissions to directory
    fs.chmodSync(dbDir, 0o777);
}

console.log(`Initializing database at path: ${dbPath}`);

// Create and initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error creating database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    // USERS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL, -- 'admin', 'aluno', 'proaluno'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
            process.exit(1);
        }
        console.log('Users table created successfully');
    });

    // BOOKS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            area TEXT NOT NULL,
            subarea INTEGER NOT NULL,
            authors TEXT NOT NULL,
            edition INTEGER NOT NULL, 
            language INTEGER NOT NULL,
            volume INTEGER NOT NULL,
            exemplar INTEGER NOT NULL,
            code TEXT NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating books table:', err.message);
            process.exit(1);
        }
        console.log('Books table created successfully');

        // Insert test data
        const testBook = {
            area: 'Variados',
            subarea: 1,
            authors: 'Teste',
            edition: 1,
            language: 2, 
            volume: 1,
            exemplar: 1,
            code: 'VAR-01.01 v1',
            title: 'Teste de Livro',
            subtitle: 'Teste de Subtitulo',
        };

        db.run(`
            INSERT INTO books (area, subarea, authors, edition, language, volume, exemplar, code, title, subtitle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            testBook.area,
            testBook.subarea,
            testBook.authors,
            testBook.edition,
            testBook.language,
            testBook.volume,
            testBook.exemplar,
            testBook.code,
            testBook.title,
            testBook.subtitle
        ], function(err) {
            if (err) {
                console.error('Error inserting test data:', err.message);
            } else {
                console.log('Test data inserted successfully');
            }
        });
    });

    // BORROWED_BOOKS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS borrowed_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            exemplar INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            returned_at TIMESTAMP,
            FOREIGN KEY(book_id) REFERENCES books(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating borrowed_books table:', err.message);
            process.exit(1);
        }
        console.log('borrowed_books table created successfully');
    });

    // Close connection after all tables are created
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        }
        console.log('Database connection closed.');
    });
});