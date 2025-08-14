#!/usr/bin/env node
/**
 * Migração para colunas do fluxo de extensão/nudge.
 * Idempotente: só adiciona colunas que faltam.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Detecta melhor caminho possível para o banco existente
const explicitEnv = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('sqlite://')
  ? process.env.DATABASE_URL.replace('sqlite://', '')
  : null;

const candidates = [
  explicitEnv,
  // DB na raiz do repositório (../.. a partir de backend/scripts)
  path.resolve(__dirname, '../../database/library.db'),
  // DB dentro de backend/
  path.resolve(__dirname, '../database/library.db'),
  // DB relativo ao CWD (caso execute de outro lugar)
  path.resolve(process.cwd(), 'database/library.db')
].filter(Boolean);

let dbPath = candidates.find(p => fs.existsSync(p));
if (!dbPath) {
  // Usa primeiro candidato não nulo (preferindo raiz) mesmo que não exista ainda
  dbPath = candidates[0];
}

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

console.log('🔵 [migration] Usando banco em', dbPath);
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('🔴 [migration] Erro ao abrir DB:', err.message);
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

function tableExists(table) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
}

function addColumnIfMissing(table, columnName, columnDef) {
  return getTableInfo(table).then(info => {
    const exists = info.some(c => c.name === columnName);
    if (exists) {
      console.log(`🟡 [migration] Coluna já existe: ${table}.${columnName}`);
      return;
    }
    return new Promise((resolve, reject) => {
      const sql = `ALTER TABLE ${table} ADD COLUMN ${columnName} ${columnDef}`;
      db.run(sql, (err) => {
        if (err) {
          console.error(`🔴 [migration] Falha ao adicionar ${table}.${columnName}:`, err.message);
          reject(err);
        } else {
          console.log(`🟢 [migration] Coluna adicionada: ${table}.${columnName}`);
          resolve();
        }
      });
    });
  });
}

async function run() {
  try {
    const loansExists = await tableExists('loans');
    const rulesExists = await tableExists('rules');
    if (!loansExists || !rulesExists) {
      console.log('🟡 [migration] Tabelas base ausentes (loans ou rules). Rode primeiro: node src/database/initDb.js (no diretório backend) ou npm start que já executa initDb.');
      console.log('🛑 [migration] Abortando migração sem alterar nada.');
      return;
    }

    // LOANS
    await addColumnIfMissing('loans', 'extended_phase', 'INTEGER NOT NULL DEFAULT 0');
    await addColumnIfMissing('loans', 'extended_started_at', 'TIMESTAMP');
    await addColumnIfMissing('loans', 'last_nudged_at', 'TIMESTAMP');
    await addColumnIfMissing('loans', 'extension_pending', 'INTEGER NOT NULL DEFAULT 0');
    await addColumnIfMissing('loans', 'extension_requested_at', 'TIMESTAMP');

    // RULES
    await addColumnIfMissing('rules', 'extension_window_days', 'INTEGER NOT NULL DEFAULT 3');
    await addColumnIfMissing('rules', 'extension_block_multiplier', 'INTEGER NOT NULL DEFAULT 3');
    await addColumnIfMissing('rules', 'shortened_due_days_after_nudge', 'INTEGER NOT NULL DEFAULT 5');
    await addColumnIfMissing('rules', 'nudge_cooldown_hours', 'INTEGER NOT NULL DEFAULT 24');
    await addColumnIfMissing('rules', 'pending_nudge_extension_days', 'INTEGER NOT NULL DEFAULT 5');

    // Garantir linha id=1 em rules com defaults preenchidos
    await new Promise((resolve, reject) => {
      db.get('SELECT id FROM rules WHERE id = 1', (err, row) => {
        if (err) return reject(err);
        if (!row) {
          const insert = `INSERT INTO rules (id, max_days, overdue_reminder_days, max_books_per_user, max_renewals, renewal_days, extension_window_days, extension_block_multiplier, shortened_due_days_after_nudge, nudge_cooldown_hours, pending_nudge_extension_days) VALUES (1, 7, 3, 5, 2, 7, 3, 3, 5, 24, 5)`;
          db.run(insert, (err2) => {
            if (err2) return reject(err2);
            console.log('🟢 [migration] Linha padrão inserida em rules');
            resolve();
          });
        } else {
          const update = `UPDATE rules SET 
              extension_window_days = COALESCE(extension_window_days, 3),
              extension_block_multiplier = COALESCE(extension_block_multiplier, 3),
              shortened_due_days_after_nudge = COALESCE(shortened_due_days_after_nudge, 5),
              nudge_cooldown_hours = COALESCE(nudge_cooldown_hours, 24),
              pending_nudge_extension_days = COALESCE(pending_nudge_extension_days, 5)
            WHERE id = 1`;
          db.run(update, (err3) => {
            if (err3) return reject(err3);
            console.log('🟢 [migration] Linha rules atualizada (defaults assegurados)');
            resolve();
          });
        }
      });
    });

    console.log('✅ [migration] Migração concluída');
  } catch (e) {
    console.error('❌ [migration] Erro na migração:', e.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

run();
