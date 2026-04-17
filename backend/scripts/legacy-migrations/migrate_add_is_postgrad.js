// Script para adicionar coluna is_postgrad à tabela disciplines
// Execução: node backend/scripts/migrate_add_is_postgrad.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database/library.db');

console.log('🔵 [Migração] Iniciando migração: adicionar coluna is_postgrad');
console.log(`📁 [Migração] Caminho do banco: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('🔴 [Migração] Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('✅ [Migração] Conectado ao banco de dados');
});

// Adiciona coluna is_postgrad se não existir
db.run(`
    ALTER TABLE disciplines ADD COLUMN is_postgrad INTEGER DEFAULT 0
`, (err) => {
    if (err) {
        // Se o erro for que a coluna já existe, tudo bem
        if (err.message.includes('duplicate column')) {
            console.log('🟡 [Migração] Coluna is_postgrad já existe, pulando...');
        } else {
            console.error('🔴 [Migração] Erro ao adicionar coluna:', err.message);
            db.close();
            process.exit(1);
        }
    } else {
        console.log('🟢 [Migração] Coluna is_postgrad adicionada com sucesso');
        console.log('ℹ️  [Migração] Valor padrão: 0 (não é pós-graduação)');
    }
    
    // Fecha conexão
    db.close((err) => {
        if (err) {
            console.error('🔴 [Migração] Erro ao fechar banco:', err.message);
            process.exit(1);
        }
        console.log('✅ [Migração] Migração concluída com sucesso');
    });
});
