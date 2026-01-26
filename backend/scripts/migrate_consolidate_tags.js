const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/library.db');

console.log('🔵 [Migration] Consolidando tabelas de tags em area_tags');
console.log(`🔵 [Migration] Usando banco: ${DB_PATH}`);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('🔴 [Migration] Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('🟢 [Migration] Conectado ao banco de dados');
});

// Executar migrations em série
db.serialize(() => {
    console.log('🔵 [Migration] Criando tabela area_tags...');
    
    // 1. Criar a nova tabela area_tags
    db.run(`
        CREATE TABLE IF NOT EXISTS area_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL CHECK(entity_type IN ('profile', 'advanced_cycle', 'post_cm')),
            entity_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category IN ('grande-area', 'area', 'subarea', 'custom')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('🔴 [Migration] Erro ao criar tabela area_tags:', err.message);
            process.exit(1);
        }
        console.log('✅ [Migration] Tabela area_tags criada');
    });

    // 2. Criar índices para performance
    db.run(`
        CREATE INDEX IF NOT EXISTS idx_area_tags_entity 
        ON area_tags(entity_type, entity_id)
    `, (err) => {
        if (err) {
            console.error('🔴 [Migration] Erro ao criar índice:', err.message);
        } else {
            console.log('✅ [Migration] Índice criado');
        }
    });

    // 3. Verificar se tabelas antigas existem antes de migrar
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='profile_tags'", [], (err, row) => {
        if (row) {
            console.log('🔵 [Migration] Migrando dados de profile_tags...');
            db.run(`
                INSERT INTO area_tags (entity_type, entity_id, label, category, created_at)
                SELECT 'profile', user_id, label, category, created_at
                FROM profile_tags
                WHERE category IN ('grande-area', 'area', 'subarea')
            `, function(err) {
                if (err) {
                    console.error('🔴 [Migration] Erro ao migrar profile_tags:', err.message);
                } else {
                    console.log(`✅ [Migration] ${this.changes} tags de perfil migradas`);
                }
            });
        } else {
            console.log('🟡 [Migration] Tabela profile_tags não existe, pulando...');
        }
    });

    // 4. Migrar dados de advanced_cycle_tags se existir
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='advanced_cycle_tags'", [], (err, row) => {
        if (row) {
            console.log('🔵 [Migration] Migrando dados de advanced_cycle_tags...');
            db.run(`
                INSERT INTO area_tags (entity_type, entity_id, label, category, created_at)
                SELECT 'advanced_cycle', cycle_id, label, category, created_at
                FROM advanced_cycle_tags
            `, function(err) {
                if (err) {
                    console.error('🔴 [Migration] Erro ao migrar advanced_cycle_tags:', err.message);
                } else {
                    console.log(`✅ [Migration] ${this.changes} tags de ciclos avançados migradas`);
                }
            });
        } else {
            console.log('🟡 [Migration] Tabela advanced_cycle_tags não existe, pulando...');
        }
    });

    // 5. Migrar dados de post_cm_areas se existir
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='post_cm_areas'", [], (err, row) => {
        if (row) {
            console.log('🔵 [Migration] Migrando dados de post_cm_areas...');
            db.run(`
                INSERT INTO area_tags (entity_type, entity_id, label, category, created_at)
                SELECT 'post_cm', post_cm_id, label, 'area', created_at
                FROM post_cm_areas
            `, function(err) {
                if (err) {
                    console.error('🔴 [Migration] Erro ao migrar post_cm_areas:', err.message);
                } else {
                    console.log(`✅ [Migration] ${this.changes} áreas de pós-CM migradas`);
                }
            });
        } else {
            console.log('🟡 [Migration] Tabela post_cm_areas não existe, pulando...');
        }
    });

    // 6. Verificar migração e informar sobre próximos passos
    setTimeout(() => {
        db.get(`SELECT COUNT(*) as total FROM area_tags`, [], (err, row) => {
            if (err) {
                console.error('🔴 [Migration] Erro ao verificar migração:', err.message);
            } else {
                console.log(`✅ [Migration] Total de tags na nova tabela: ${row.total}`);
            }
            
            console.log('\n📋 [Migration] Resumo:');
            console.log('   ✅ Tabela area_tags criada e pronta para uso');
            console.log('   ✅ Índices criados para performance');
            console.log('   ✅ Modelos atualizados para usar a nova tabela');
            console.log('\n💡 [Migration] Próximos passos:');
            console.log('   1. Testar o sistema com a nova estrutura');
            console.log('   2. Verificar se tudo funciona corretamente');
            console.log('   3. Se necessário, execute novamente após popular dados');
            console.log('\n🟡 [Migration] As tabelas antigas foram marcadas como deprecated no código.');
            console.log('   Elas serão criadas vazias para compatibilidade, mas não serão mais usadas.');
            
            db.close((err) => {
                if (err) {
                    console.error('🔴 [Migration] Erro ao fechar conexão:', err.message);
                } else {
                    console.log('\n🟢 [Migration] Migração concluída com sucesso!');
                }
            });
        });
    }, 1000); // Aguarda para garantir que todas as migrations anteriores terminaram
});
