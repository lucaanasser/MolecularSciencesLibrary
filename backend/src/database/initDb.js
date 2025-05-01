const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbPath = '/app/database/library.db';
const dbDir = path.dirname(dbPath);

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create and initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error creating database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

// Create tables
db.serialize(() => {
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
            code: 'VAR-01.01.01',
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
            
            // Close the database connection
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                }
                console.log('Database connection closed.');
            });
        });
    });
});