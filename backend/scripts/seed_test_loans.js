#!/usr/bin/env node
/**
 * Script para criar cenários de teste usando livros reais já existentes no banco.
 * Cria (ou reutiliza) usuário especificado e gera 4 empréstimos:
 * 1. Empréstimo atrasado
 * 2. Empréstimo faltando 1 hora para ficar atrasado (renovações no máximo, elegível para extensão)
 * 3. Empréstimo com extensão pendente faltando 1 hora para completar a janela
 * 4. Empréstimo já estendido (fase estendida ativa)
 */

const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = process.env.DATABASE_URL?.replace('sqlite://','') || '/root/MolecularSciencesLibrary/database/library.db';
const db = new sqlite3.Database(dbPath);

const USER_DATA = {
  name: 'Luca',
  NUSP: 11,
  email: 'lucanasser@protonmail.com',
  password: '1',
  role: 'aluno'
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
  db.all(`SELECT id FROM books ORDER BY RANDOM() LIMIT 4`, [], (err, rows) => {
    if (err) return callback(err);
    if (!rows || rows.length < 4) return callback(new Error('Menos de 4 livros disponíveis no banco para gerar cenários.'));
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
  const [bookOverdue, book1hBeforeOverdue, bookPending1h, bookExtended] = bookIds;
  const { max_renewals, renewal_days, extension_window_days, extension_block_multiplier } = rules;
  const blockDays = renewal_days * extension_block_multiplier;

  db.serialize(() => {
    // Limpa empréstimos anteriores desses livros
    db.run(`DELETE FROM loans WHERE book_id IN (?,?,?,?)`, bookIds, (delErr) => {
      if (delErr) return callback(delErr);

      // 1) Atrasado: due_date 5 dias atrás, borrowed_at 20 dias atrás, renovações abaixo do máximo
      db.run(
        `INSERT INTO loans (book_id, student_id, borrowed_at, renewals, due_date, is_extended)
         VALUES (?,?, datetime('now','-20 days'), ?, datetime('now','-5 days'), 0)`,
        [bookOverdue, userId, Math.max(0, (max_renewals || 0) - 1)],
        (e1) => {
          if (e1) return callback(e1);

          // 2) Faltando 1 hora para atraso: due_date em +1 hora, renovações no máximo, não estendido
          db.run(
            `INSERT INTO loans (book_id, student_id, borrowed_at, renewals, due_date, is_extended)
             VALUES (?,?, datetime('now','-30 days'), ?, datetime('now','+1 hours'), 0)`,
            [book1hBeforeOverdue, userId, max_renewals || 0],
            (e2) => {
              if (e2) return callback(e2);

              // 3) Extensão PENDENTE faltando 1h para completar a janela: pending=1, requested_at = now - windowDays + 1h
              db.run(
                `INSERT INTO loans (book_id, student_id, borrowed_at, renewals, due_date, is_extended)
                 VALUES (?,?, datetime('now','-30 days'), ?, datetime('now','+2 days'), 0)`,
                [bookPending1h, userId, max_renewals || 0, extension_window_days || 3],
                (e3) => {
                  if (e3) return callback(e3);

                  // 4) Já estendido: extended_phase=1, due_date futuro (bloco + 10 dias para sobrar)
                  db.run(
                    `INSERT INTO loans (book_id, student_id, borrowed_at, renewals, due_date, is_extended)
                     VALUES (?,?, datetime('now','-30 days'), ?, datetime('now', '+'|| ? ||' days'), 1)`,
                    [bookExtended, userId, max_renewals || 0, blockDays + 10],
                    (e4) => {
                      if (e4) return callback(e4);
                      callback(null, { bookOverdue, book1hBeforeOverdue, bookPending1h, bookExtended });
                    }
                  );
                }
              );
            }
          );
        }
      );
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
