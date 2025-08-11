#!/usr/bin/env node
/**
 * Migração para adicionar coluna 'class' à tabela users.
 * Idempotente: só adiciona se não existir.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const explicitEnv = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('sqlite://')
  ? process.env.DATABASE_URL.replace('sqlite://', '')
  : null;

const candidates = [
  explicitEnv,
  path.resolve(__dirname, '../../database/library.db'),
  path.resolve(__dirname, '../database/library.db'),
  path.resolve(process.cwd(), 'database/library.db')
].filter(Boolean);

let dbPath = candidates.find(p => fs.existsSync(p));
if (!dbPath) {
  dbPath = candidates[0];
}

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

console.log('🔵 [migration:add_user_class] Usando banco em', dbPath);
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('🔴 [migration:add_user_class] Erro ao abrir DB:', err.message);
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
    const exists = info.some(c => c.name === 'class');
    if (exists) {
      console.log('🟡 [migration:add_user_class] Coluna users.class já existe. Nada a fazer.');
    } else {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE users ADD COLUMN class TEXT`, (err) => {
          if (err) return reject(err);
          console.log('🟢 [migration:add_user_class] Coluna class adicionada em users');
          resolve();
        });
      });
    }
    console.log('✅ [migration:add_user_class] Migração concluída');
  } catch (e) {
    console.error('❌ [migration:add_user_class] Erro na migração:', e.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

run();
