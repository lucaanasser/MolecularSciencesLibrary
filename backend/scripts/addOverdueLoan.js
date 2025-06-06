// Script para adicionar um empréstimo atrasado manualmente
// Uso: node scripts/addOverdueLoan.js

const path = require('path');
const { db } = require(path.join(__dirname, '../src/database/db'));

const userId = 4;
const bookId = 9781234567890;
const borrowedAt = '2025-05-10T12:00:00Z'; // 10 de maio de 2025

function addOverdueLoan() {
  db.run(
    `INSERT INTO borrowed_books (book_id, student_id, borrowed_at) VALUES (?, ?, ?)`,
    [bookId, userId, borrowedAt],
    function (err) {
      if (err) {
        console.error('Erro ao inserir empréstimo:', err.message);
        process.exit(1);
      }
      console.log('Empréstimo atrasado inserido com sucesso! ID:', this.lastID);
      process.exit(0);
    }
  );
}

addOverdueLoan();
