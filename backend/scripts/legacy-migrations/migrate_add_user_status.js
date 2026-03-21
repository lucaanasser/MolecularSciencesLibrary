// Script de migração para adicionar coluna status à tabela users
// Execução: node backend/scripts/migrate_add_user_status.js
//
// A coluna status indica o estado do cadastro do usuário:
//   'active'  — usuário ativo (cadastrado pelo admin ou aprovado)
//   'pending' — usuário aguardando aprovação do administrador (auto-cadastro)

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database/library.db');

console.log('🔵 [Migração] Iniciando migração: adicionar coluna status em users');
console.log(`📁 [Migração] Caminho do banco: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('🔴 [Migração] Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('✅ [Migração] Conectado ao banco de dados');
});

db.run(`ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) {
            console.log("🟡 [Migração] Coluna 'status' já existe, pulando...");
        } else {
            console.error('🔴 [Migração] Erro ao adicionar coluna:', err.message);
            db.close();
            process.exit(1);
        }
    } else {
        console.log("🟢 [Migração] Coluna 'status' adicionada com sucesso.");
        console.log("ℹ️  [Migração] Valor padrão: 'active'. Novos auto-cadastros terão status = 'pending'.");
    }

    db.close((closeErr) => {
        if (closeErr) {
            console.error('🔴 [Migração] Erro ao fechar banco:', closeErr.message);
            process.exit(1);
        }
        console.log('✅ [Migração] Migração concluída com sucesso');
    });
});
