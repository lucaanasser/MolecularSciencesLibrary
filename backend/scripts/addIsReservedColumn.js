const sqlite3 = require('sqlite3');
const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || './database/library.db';

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`ALTER TABLE books ADD COLUMN is_reserved INTEGER DEFAULT 0`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Coluna is_reserved já existe.');
            } else {
                console.error('Erro ao adicionar coluna is_reserved:', err.message);
            }
        } else {
            console.log('Coluna is_reserved adicionada com sucesso.');
        }
    });
});

db.close();
