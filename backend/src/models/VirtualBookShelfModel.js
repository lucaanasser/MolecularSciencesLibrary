// VirtualBookShelfModel contém operações de acesso ao banco para configuração da estante virtual
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const { executeQuery, getQuery, allQuery } = require('../database/db');

/**
 * Model responsável pelo acesso ao banco de dados para configuração da estante virtual.
 */
class VirtualBookShelfModel {
    
    /**
     * Obtém todas as configurações de prateleiras
     */
    async getAllShelves() {
        console.log("🔵 [VirtualBookShelfModel] Buscando todas as configurações de prateleiras");
        try {
            const shelves = await allQuery(`
                SELECT * FROM virtual_bookshelf 
                ORDER BY shelf_number, shelf_row
            `);
            console.log(`🟢 [VirtualBookShelfModel] Configurações encontradas: ${shelves.length}`);
            return shelves;
        } catch (error) {
            console.error("🔴 [VirtualBookShelfModel] Erro ao buscar configurações:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza o código inicial de uma prateleira específica
     */
    async updateShelfStartCode(shelf_number, shelf_row, book_code_start) {
        console.log(`🔵 [VirtualBookShelfModel] Atualizando prateleira ${shelf_number}-${shelf_row} com código inicial: ${book_code_start}`);
        try {
            const result = await executeQuery(`
                UPDATE virtual_bookshelf 
                SET book_code_start = ? 
                WHERE shelf_number = ? AND shelf_row = ?
            `, [book_code_start, shelf_number, shelf_row]);
            console.log(`🟢 [VirtualBookShelfModel] Prateleira atualizada com sucesso`);
            return result;
        } catch (error) {
            console.error("🔴 [VirtualBookShelfModel] Erro ao atualizar prateleira:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza o código final de uma prateleira específica (para última prateleira da estante)
     */
    async updateShelfEndCode(shelf_number, shelf_row, book_code_end) {
        console.log(`🔵 [VirtualBookShelfModel] Atualizando prateleira ${shelf_number}-${shelf_row} com código final: ${book_code_end}`);
        try {
            const result = await executeQuery(`
                UPDATE virtual_bookshelf 
                SET book_code_end = ? 
                WHERE shelf_number = ? AND shelf_row = ?
            `, [book_code_end, shelf_number, shelf_row]);
            console.log(`🟢 [VirtualBookShelfModel] Código final da prateleira atualizado com sucesso`);
            return result;
        } catch (error) {
            console.error("🔴 [VirtualBookShelfModel] Erro ao atualizar código final:", error.message);
            throw error;
        }
    }

    /**
     * Marca/desmarca uma prateleira como última da estante
     */
    async setLastShelf(shelf_number, shelf_row, is_last_shelf) {
        console.log(`🔵 [VirtualBookShelfModel] Configurando prateleira ${shelf_number}-${shelf_row} como última: ${is_last_shelf}`);
        try {
            const result = await executeQuery(`
                UPDATE virtual_bookshelf 
                SET is_last_shelf = ? 
                WHERE shelf_number = ? AND shelf_row = ?
            `, [is_last_shelf, shelf_number, shelf_row]);
            console.log(`🟢 [VirtualBookShelfModel] Configuração de última prateleira atualizada`);
            return result;
        } catch (error) {
            console.error("🔴 [VirtualBookShelfModel] Erro ao configurar última prateleira:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza configuração completa das prateleiras
     */
    async updateShelvesConfig(shelvesConfig) {
        console.log("🔵 [VirtualBookShelfModel] Atualizando configuração completa das prateleiras");
        try {
            // Usar transação para garantir consistência
            const db = require('../database/db').getDatabase();
            
            await new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");
                    
                    const updateStmt = db.prepare(`
                        UPDATE virtual_bookshelf 
                        SET book_code_start = ?, book_code_end = ?, is_last_shelf = ? 
                        WHERE shelf_number = ? AND shelf_row = ?
                    `);
                    
                    let errors = [];
                    
                    shelvesConfig.forEach((shelf, index) => {
                        updateStmt.run([
                            shelf.book_code_start || null,
                            shelf.book_code_end || null,
                            shelf.is_last_shelf || false,
                            shelf.shelf_number,
                            shelf.shelf_row
                        ], (err) => {
                            if (err) errors.push(err);
                        });
                    });
                    
                    updateStmt.finalize((err) => {
                        if (err || errors.length > 0) {
                            db.run("ROLLBACK");
                            reject(err || errors[0]);
                        } else {
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        }
                    });
                });
            });
            
            console.log("🟢 [VirtualBookShelfModel] Configuração completa atualizada com sucesso");
            return true;
        } catch (error) {
            console.error("🔴 [VirtualBookShelfModel] Erro ao atualizar configuração:", error.message);
            throw error;
        }
    }

    /**
     * Obtém uma prateleira específica
     */
    async getShelf(shelf_number, shelf_row) {
        console.log(`🔵 [VirtualBookShelfModel] Buscando prateleira ${shelf_number}-${shelf_row}`);
        try {
            const shelf = await getQuery(`
                SELECT * FROM virtual_bookshelf 
                WHERE shelf_number = ? AND shelf_row = ?
            `, [shelf_number, shelf_row]);
            console.log(`🟢 [VirtualBookShelfModel] Prateleira encontrada: ${shelf ? 'sim' : 'não'}`);
            return shelf;
        } catch (error) {
            console.error("🔴 [VirtualBookShelfModel] Erro ao buscar prateleira:", error.message);
            throw error;
        }
    }
}

module.exports = new VirtualBookShelfModel();