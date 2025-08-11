#!/usr/bin/env node
/**
 * Script para criar cenários de teste usando livros reais já existentes no banco.
 * Cria (ou reutiliza) usuário especificado e gera 3 empréstimos:
 * 1. Empréstimo atrasado
 * 2. Empréstimo na janela final para extensão (renovações no máximo e faltando 3 dias)
 * 3. Empréstimo já estendido (fase estendida ativa)
 */

const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = process.env.DATABASE_URL?.replace('sqlite://','') || path.join(__dirname, '..', '..', 'database', 'library.db');
const db = new sqlite3.Database(dbPath);

const USER_DATA = {
  name: 'Luca',
  NUSP: 11,
  email: 'lucanasser@protonmail.com',
  password: '1',
  role: 'admin'
};

function getUser(callback) {
  db.get('SELECT id FROM users WHERE email = ?', [USER_DATA.email], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row.id);
    // criar
    bcrypt.hash(USER_DATA.password, 10).then(hash => {
      db.run(`INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image) VALUES (?,?,?,?,?,?,?)`,
        [USER_DATA.name, USER_DATA.NUSP, USER_DATA.email, '', hash, USER_DATA.role, null], function (insErr) {
          if (insErr) return callback(insErr);
          callback(null, this.lastID);
        });
    }).catch(e => callback(e));
  });
}

function getRandomBooks(callback) {
  db.all(`SELECT id FROM books ORDER BY RANDOM() LIMIT 3`, [], (err, rows) => {
    if (err) return callback(err);
    if (!rows || rows.length < 3) return callback(new Error('Menos de 3 livros disponíveis no banco para gerar cenários.'));
    callback(null, rows.map(r => r.id));
  });
}

function getRules(callback) {
  db.get(`SELECT max_renewals, renewal_days, extension_window_days, extension_block_multiplier FROM rules WHERE id = 1`, [], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error('Regras não encontradas.'));
    callback(null, row);
  });
}

function seedLoans(userId, bookIds, rules, callback) {
  const [bookOverdue, bookWindow, bookExtended] = bookIds;
  const { max_renewals, renewal_days, extension_window_days, extension_block_multiplier } = rules;
  const blockDays = renewal_days * extension_block_multiplier;

  db.serialize(() => {
    // Limpa empréstimos anteriores desses livros
    db.run(`DELETE FROM loans WHERE book_id IN (?,?,?)`, bookIds, (delErr) => {
      if (delErr) return callback(delErr);

      // 1. Atrasado: due_date 5 dias atrás, borrowed_at 20 dias atrás
      db.run(`INSERT INTO loans (book_id, student_id, borrowed_at, renewals, due_date, extended_phase) VALUES (?,?, datetime('now','-20 days'), ?, datetime('now','-5 days'), 0)`,
        [bookOverdue, userId, Math.max(1, max_renewals - 1)], (e1) => {
          if (e1) return callback(e1);

          // 2. Janela extensão: due_date em +3 dias, renovado no máximo
          db.run(`INSERT INTO loans (book_id, student_id, borrowed_at, renewals, due_date, extended_phase) VALUES (?,?, datetime('now','-30 days'), ?, datetime('now','+3 days'), 0)`,
            [bookWindow, userId, max_renewals], (e2) => {
              if (e2) return callback(e2);

              // 3. Estendido: extended_phase=1, due_date futuro (bloco + 10 dias para ter sobra)
              db.run(`INSERT INTO loans (book_id, student_id, borrowed_at, renewals, due_date, extended_phase, extended_started_at) VALUES (?,?, datetime('now','-30 days'), ?, datetime('now', '+'|| ? ||' days'), 1, datetime('now'))`,
                [bookExtended, userId, max_renewals, blockDays + 10], (e3) => {
                  if (e3) return callback(e3);
                  callback(null, { bookOverdue, bookWindow, bookExtended });
                });
            });
        });
    });
  });
}

function main() {
  console.log('🔵 Iniciando seed de cenários de teste...');
  getUser((uErr, userId) => {
    if (uErr) { console.error('Erro usuário:', uErr.message); process.exit(1); }
    console.log('🟢 Usuário alvo ID:', userId);
    getRandomBooks((bErr, books) => {
      if (bErr) { console.error('Erro livros:', bErr.message); process.exit(1); }
      console.log('🟢 Livros escolhidos:', books.join(', '));
      getRules((rErr, rules) => {
        if (rErr) { console.error('Erro regras:', rErr.message); process.exit(1); }
        console.log('🟢 Regras:', rules);
        seedLoans(userId, books, rules, (sErr, summary) => {
          if (sErr) { console.error('Erro ao inserir empréstimos:', sErr.message); process.exit(1); }
          console.log('✅ Cenários criados com sucesso:', summary);
          process.exit(0);
        });
      });
    });
  });
}

main();
