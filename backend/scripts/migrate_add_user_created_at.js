#!/usr/bin/env node
/**
 * Migração para garantir a coluna 'created_at' em users e preencher valores.
 * - Adiciona a coluna se não existir (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
 * - Preenche linhas antigas com CURRENT_TIMESTAMP quando estiverem NULL
 * Idempotente.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Resolve caminho do banco (mesma estratégia dos outros scripts de migração)
const explicitEnv = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('sqlite://')
  ? process.env.DATABASE_URL.replace('sqlite://', '')
  : null;

const candidates = [
  explicitEnv,
  path.resolve(__dirname, '../../database/library.db'), // raiz do repo
  path.resolve(__dirname, '../database/library.db'),    // dentro de backend/
  path.resolve(process.cwd(), 'database/library.db')     // relativo ao CWD
].filter(Boolean);

let dbPath = candidates.find(p => fs.existsSync(p));
if (!dbPath) {
  dbPath = candidates[0];
}

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

console.log('🔵 [migration:add_user_created_at] Usando banco em', dbPath);
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('🔴 [migration:add_user_created_at] Erro ao abrir DB:', err.message);
    process.exit(1);
  }
});

function getTableInfo(table) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function run() {
  try {
    const info = await getTableInfo('users');
    if (!info || info.length === 0) {
      console.log('🟡 [migration:add_user_created_at] Tabela users não encontrada. Rode primeiro a inicialização do DB (node src/database/initDb.js).');
      return;
    }

    const hasCreatedAt = info.some(c => c.name === 'created_at');

    if (!hasCreatedAt) {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, (err) => {
          if (err) return reject(err);
          console.log('🟢 [migration:add_user_created_at] Coluna users.created_at adicionada');
          resolve();
        });
      });
    } else {
      console.log('🟡 [migration:add_user_created_at] Coluna users.created_at já existe');
    }

    // Backfill: garante valor para linhas antigas
    await new Promise((resolve, reject) => {
      db.run(`UPDATE users SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL`, (err) => {
        if (err) return reject(err);
        console.log('🟢 [migration:add_user_created_at] Backfill de created_at concluído');
        resolve();
      });
    });

    console.log('✅ [migration:add_user_created_at] Migração concluída');
  } catch (e) {
    console.error('❌ [migration:add_user_created_at] Erro na migração:', e.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

run();
