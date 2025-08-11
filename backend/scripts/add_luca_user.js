#!/usr/bin/env node
/**
 * Script para inserir (se não existir) o usuário lucanasser@protonmail.com
 * Senha: 1 (hash bcrypt)
 * Role: admin (pode ajustar se quiser)
 * NUSP: gerado fictício se não existir
 */
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || path.join(__dirname, '..', '..', 'database', 'library.db');
const db = new sqlite3.Database(dbPath);

async function run() {
  const email = 'lucanasser@protonmail.com';
  const passwordPlain = '1';
  const password_hash = await bcrypt.hash(passwordPlain, 10);
  const name = 'Luca Nasser';
  const role = 'admin';
  const phone = null;
  const NUSP = '00000001';
  const profile_image = null;

  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err.message);
      process.exit(1);
    }
    if (row) {
      console.log('Usuário já existe. ID:', row.id);
      process.exit(0);
    }
    db.run(
      `INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, NUSP, email, phone, password_hash, role, profile_image],
      function (insErr) {
        if (insErr) {
          console.error('Erro ao inserir usuário:', insErr.message);
          process.exit(1);
        }
        console.log('Usuário criado com sucesso. ID:', this.lastID);
        process.exit(0);
      }
    );
  });
}

run();
