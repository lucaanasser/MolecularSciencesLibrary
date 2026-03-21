/**
 * Migração: Adicionar campo 'topico' na tabela forum_tags
 * Data: Janeiro 2026
 * Descrição: Adiciona os campos topico, created_by_user e approved para sistema de aprovação de tags
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/library.db');

console.log('📋 Iniciando migração: Adicionar campos topico, created_by_user e approved em forum_tags');
console.log('📂 Database:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco de dados');
});

// Verificar se os campos já existem
db.all("PRAGMA table_info(forum_tags)", [], (err, columns) => {
    if (err) {
        console.error('❌ Erro ao verificar estrutura da tabela:', err.message);
        db.close();
        process.exit(1);
    }

    const hasTopico = columns.some(col => col.name === 'topico');
    const hasCreatedByUser = columns.some(col => col.name === 'created_by_user');
    const hasApproved = columns.some(col => col.name === 'approved');

    console.log('\n🔍 Estrutura atual da tabela forum_tags:');
    console.log(`   - Campo 'topico': ${hasTopico ? '✓ Existe' : '✗ Não existe'}`);
    console.log(`   - Campo 'created_by_user': ${hasCreatedByUser ? '✓ Existe' : '✗ Não existe'}`);
    console.log(`   - Campo 'approved': ${hasApproved ? '✓ Existe' : '✗ Não existe'}`);

    if (hasTopico && hasCreatedByUser && hasApproved) {
        console.log('\n✅ Todos os campos já existem. Nenhuma migração necessária.');
        db.close();
        return;
    }

    console.log('\n🚀 Iniciando migração...\n');

    db.serialize(() => {
        // Passo 1: Criar tabela temporária com a nova estrutura
        db.run(`
            CREATE TABLE forum_tags_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT UNIQUE NOT NULL,
                topico TEXT NOT NULL DEFAULT 'geral',
                descricao TEXT,
                created_by_user INTEGER,
                approved INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(created_by_user) REFERENCES users(id) ON DELETE SET NULL
            )
        `, function(err) {
            if (err) {
                console.error('❌ Erro ao criar tabela temporária:', err.message);
                db.close();
                process.exit(1);
            }
            console.log('1️⃣ Tabela temporária criada');

            // Passo 2: Copiar dados da tabela antiga para a nova
            db.run(`
                INSERT INTO forum_tags_new (id, nome, descricao, created_at, topico, approved)
                SELECT id, nome, descricao, created_at, 'geral' as topico, 1 as approved
                FROM forum_tags
            `, function(err) {
                if (err) {
                    console.error('❌ Erro ao copiar dados:', err.message);
                    db.close();
                    process.exit(1);
                }
                console.log('2️⃣ Dados copiados para tabela temporária');

                // Passo 3: Remover tabela antiga
                db.run(`DROP TABLE forum_tags`, function(err) {
                    if (err) {
                        console.error('❌ Erro ao remover tabela antiga:', err.message);
                        db.close();
                        process.exit(1);
                    }
                    console.log('3️⃣ Tabela antiga removida');

                    // Passo 4: Renomear tabela nova
                    db.run(`ALTER TABLE forum_tags_new RENAME TO forum_tags`, function(err) {
                        if (err) {
                            console.error('❌ Erro ao renomear tabela:', err.message);
                            db.close();
                            process.exit(1);
                        }
                        console.log('4️⃣ Tabela renomeada');

                        // Passo 5: Verificar resultado
                        db.all("SELECT COUNT(*) as count FROM forum_tags", [], function(err, rows) {
                            if (err) {
                                console.error('❌ Erro ao verificar migração:', err.message);
                                db.close();
                                process.exit(1);
                            }

                            console.log(`\n✅ Migração concluída com sucesso!`);
                            console.log(`📊 Total de tags: ${rows[0].count}`);
                            
                            // Mostrar exemplo das tags migradas
                            db.all("SELECT nome, topico, approved FROM forum_tags LIMIT 5", [], function(err, samples) {
                                if (!err && samples.length > 0) {
                                    console.log('\n📋 Exemplo de tags migradas:');
                                    samples.forEach(tag => {
                                        console.log(`   - ${tag.nome} (tópico: ${tag.topico}, aprovada: ${tag.approved})`);
                                    });
                                }
                                
                                db.close((err) => {
                                    if (err) {
                                        console.error('❌ Erro ao fechar banco:', err.message);
                                    }
                                    console.log('\n🔒 Conexão fechada\n');
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
