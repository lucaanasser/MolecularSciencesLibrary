/**
 * Migração: Adicionar campo 'is_anonymous' nas tabelas forum_questions e forum_answers
 * Data: Janeiro 2026
 * Descrição: Permite perguntas e respostas anônimas (admin ainda vê autor real)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/library.db');

console.log('📋 Iniciando migração: Adicionar is_anonymous em forum_questions e forum_answers');
console.log('📂 Database:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco de dados');
});

db.serialize(() => {
    // Adicionar is_anonymous em forum_questions
    db.run(`ALTER TABLE forum_questions ADD COLUMN is_anonymous INTEGER DEFAULT 0`, function(err) {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('ℹ️  Campo is_anonymous já existe em forum_questions');
            } else {
                console.error('❌ Erro ao adicionar is_anonymous em forum_questions:', err.message);
            }
        } else {
            console.log('✅ Campo is_anonymous adicionado em forum_questions');
        }
    });

    // Adicionar is_anonymous em forum_answers
    db.run(`ALTER TABLE forum_answers ADD COLUMN is_anonymous INTEGER DEFAULT 0`, function(err) {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('ℹ️  Campo is_anonymous já existe em forum_answers');
            } else {
                console.error('❌ Erro ao adicionar is_anonymous em forum_answers:', err.message);
            }
        } else {
            console.log('✅ Campo is_anonymous adicionado em forum_answers');
        }

        // Verificar resultado
        db.all("PRAGMA table_info(forum_questions)", [], (err, columns) => {
            if (!err) {
                const hasField = columns.some(col => col.name === 'is_anonymous');
                console.log(`\n📊 forum_questions.is_anonymous: ${hasField ? '✓ Existe' : '✗ Não existe'}`);
            }

            db.all("PRAGMA table_info(forum_answers)", [], (err, columns) => {
                if (!err) {
                    const hasField = columns.some(col => col.name === 'is_anonymous');
                    console.log(`📊 forum_answers.is_anonymous: ${hasField ? '✓ Existe' : '✗ Não existe'}`);
                }

                db.close((err) => {
                    if (err) {
                        console.error('❌ Erro ao fechar banco:', err.message);
                    }
                    console.log('\n✅ Migração concluída!\n');
                });
            });
        });
    });
});
