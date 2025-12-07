#!/usr/bin/env node
/**
 * Script para limpar os cenários de teste criados pelo seed_test_scenarios.js
 * Remove todos os livros de teste (IDs 9001-9013) e seus empréstimos
 */

require('dotenv').config();
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || path.join(__dirname, '../../database/library.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco de dados');
});

function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function main() {
    console.log('🔵 Iniciando limpeza dos cenários de teste...\n');
    
    try {
        // Remove empréstimos dos livros de teste (IDs 9001-9013)
        const deleteLoans = await runQuery(
            'DELETE FROM loans WHERE book_id BETWEEN 9001 AND 9013'
        );
        console.log(`✅ ${deleteLoans.changes} empréstimos removidos`);
        
        // Remove os livros de teste
        const deleteBooks = await runQuery(
            'DELETE FROM books WHERE id BETWEEN 9001 AND 9013'
        );
        console.log(`✅ ${deleteBooks.changes} livros removidos`);
        
        console.log('\n✅ Limpeza concluída com sucesso!');
        
    } catch (err) {
        console.error('❌ Erro ao limpar cenários:', err.message);
        process.exit(1);
    } finally {
        db.close(() => {
            console.log('👋 Conexão com o banco fechada');
            process.exit(0);
        });
    }
}

main();
