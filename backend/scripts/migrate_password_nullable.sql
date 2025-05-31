-- Migration: Permitir password_hash ser NULL na tabela users
PRAGMA foreign_keys=off;

ALTER TABLE users RENAME TO users_old;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    NUSP INTEGER NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- Agora permite NULL
    role TEXT NOT NULL, -- 'admin', 'aluno', 'proaluno'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, NUSP, email, password_hash, role, created_at)
SELECT id, name, NUSP, email, password_hash, role, created_at FROM users_old;

DROP TABLE users_old;

PRAGMA foreign_keys=on;
