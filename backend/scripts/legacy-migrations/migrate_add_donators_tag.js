// Script de migração para adicionar coluna tag à tabela donators
// Execução: node backend/scripts/migrate_add_donators_tag.js
//
// A coluna tag identifica o remetente/turma/etiqueta associada à doação
// (ex: "Prof.", "T9", "T27", etc.)

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database/library.db');

console.log('🔵 [Migração] Iniciando migração: adicionar coluna tag em donators');
console.log(`📁 [Migração] Caminho do banco: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('🔴 [Migração] Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('✅ [Migração] Conectado ao banco de dados');
});

db.run(`ALTER TABLE donators ADD COLUMN tag TEXT`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) {
            console.log("🟡 [Migração] Coluna 'tag' já existe, pulando...");
        } else {
            console.error('🔴 [Migração] Erro ao adicionar coluna:', err.message);
            db.close();
            process.exit(1);
        }
    } else {
        console.log("🟢 [Migração] Coluna 'tag' adicionada com sucesso à tabela donators.");
        console.log("ℹ️  [Migração] Campo opcional para identificar remetente/turma/etiqueta da doação.");
    }

    db.close((closeErr) => {
        if (closeErr) {
            console.error('🔴 [Migração] Erro ao fechar banco:', closeErr.message);
            process.exit(1);
        }
        console.log('✅ [Migração] Migração concluída com sucesso');
    });
});
