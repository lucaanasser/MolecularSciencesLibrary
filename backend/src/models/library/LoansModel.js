const { getQuery, allQuery, executeQuery } = require('../../database/db');
const UsersModel = require('./UsersModel');
const BooksModel = require('./BooksModel');
        
/**
 * Model responsável pelo acesso ao banco de dados para empréstimos de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

module.exports = {
    
    // Cria um novo empréstimo
    createLoan: async (book_id, user_id, due_date) => {
        console.log(`🔵 [LoansModel] Criando empréstimo: book_id=${book_id}, user_id=${user_id}`);
        let dueDateSql = due_date;
        if (due_date && typeof due_date === 'string') {
            dueDateSql = due_date.replace('T', ' ').replace(/\..*$/, '');
        }
        try {
            // Primeiro, insere o empréstimo
            const insertSql = `INSERT INTO loans (book_id, user_id, borrowed_at, due_date, renewals) VALUES (?, ?, CURRENT_TIMESTAMP, ?, 0)`;
            const insertParams = [book_id, user_id, dueDateSql];
            const result = await executeQuery(insertSql, insertParams);

            // Depois, atualiza o status do livro
            const updateSql = `UPDATE books SET status = 'emprestado' WHERE id = ?`;
            await executeQuery(updateSql, [book_id]);

            console.log(`🟢 [LoansModel] Empréstimo criado e livro atualizado em transação.`);
            return { success: true, loan_id: result.lastID, updated: true };
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro na transação de empréstimo: ${err.message}`);
            return { success: false, loan_id: null, updated: false, error: err.message };
        }
    },
    
    // Registra devolução de um empréstimo
    returnBook: async (loan_id) => {
        console.log(`🔵 [LoansModel] Registrando devolução do empréstimo: loan_id=${loan_id}`);
        try {
            // Busca o empréstimo para pegar o book_id
            const loan = await getQuery(`SELECT book_id FROM loans WHERE id = ?`, [loan_id]);
            if (!loan) {
                console.warn(`🟡 [LoansModel] Empréstimo não encontrado para id: ${loan_id}`);
                return { success: false, loan_id, updated: false, error: 'Empréstimo não encontrado' };
            }

            // Primeiro, atualiza o empréstimo (marca como devolvido)
            await executeQuery(
                `UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
                [loan_id]
            );

            // Depois, atualiza o status do livro
            await executeQuery(
                `UPDATE books SET status = 'disponível' WHERE id = ?`,
                [loan.book_id]
            );

            // Busca o empréstimo atualizado para retornar
            const updatedLoan = await getQuery(`SELECT * FROM loans WHERE id = ?`, [loan_id]);

            console.log(`🟢 [LoansModel] Devolução registrada e livro atualizado para disponível. Empréstimo id: ${loan_id}`);
            return updatedLoan;
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao registrar devolução: ${err.message}`);
            return { success: false, loan_id, updated: false, error: err.message };
        }
    },

    // Cria um empréstimo de uso interno (fantasma - já devolvido)
    // Padroniza user_id = 2 (proaluno) para indicar uso interno
    registerInternalUse: async (book_id) => {
        console.log(`🔵 [LoansModel] Criando empréstimo de uso interno: book_id=${book_id}`);
        return executeQuery(
            `INSERT INTO loans (book_id, user_id, borrowed_at, due_date, renewals, returned_at) 
             VALUES (?, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP)`,
            [book_id]
        ).then((result) => {
            console.log(`🟢 [LoansModel] Empréstimo de uso interno criado com ID: ${result.lastID}`);
            return { success: true, loan_id: result.lastID, updated: true };
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao criar empréstimo de uso interno: ${err.message}`);
            return { success: false, loan_id: null, updated: false, error: err.message };
        });
    },

    // Busca empréstimos de um livro específico (opcionalmente apenas ativos)
    getLoansByBookId: async function (book_id, activeOnly = false) {
        console.log(`🔵 [LoansModel] Buscando empréstimos para o livro ID ${book_id}${activeOnly ? " (ativos apenas)" : ""}`);
        let sql = `SELECT * FROM loans WHERE book_id = ?`;
        const params = [book_id];
        if (activeOnly) {
            sql += ` AND returned_at IS NULL`;
        }
        try {
          const result = await allQuery(sql, params);
          console.log(`🟢 [LoansModel] Empréstimos encontrados para o livro ID ${book_id}: ${result.length}`);
          if(result.length > 1 && activeOnly) {
              console.error(`🔴 [LoansModel] Atenção: mais de um empréstimo encontrado para o livro ID ${book_id}. Verifique a integridade dos dados.`);
              throw new Error(`Integridade de dados comprometida: múltiplos empréstimos ativos para o mesmo livro (ID ${book_id}).`);
          }
          return result;
        } catch (err) {
          console.error(`🔴 [LoansModel] Erro ao buscar empréstimos para o livro ID ${book_id}: ${err.message}`);
          throw err;
        } 
    },

    // Busca todos os empréstimos da DB
    getAllLoans: async function () {
        console.log("🔵 [LoansModel] Buscando todos os empréstimos com detalhes completos");
        try {
            const rows = await allQuery(
                `SELECT l.id as loan_id, l.book_id, l.user_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date, l.is_extended, l.last_nudged_at
                 FROM loans l
                 LEFT JOIN users u ON l.user_id = u.id
                 LEFT JOIN books b ON l.book_id = b.id
                 ORDER BY l.borrowed_at DESC`,
                []
            );
            console.log(`🟢 [LoansModel] Empréstimos encontrados: ${rows.length}`);
            return await Promise.all(rows.map(async (row) => {
                const book = await BooksModel.getBookById(row.book_id);
                const user = await UsersModel.getUserById(row.user_id);
                return {
                    id: row.loan_id,
                    book,
                    user,
                    borrowed_at: row.borrowed_at,
                    returned_at: row.returned_at,
                    due_date: row.due_date,
                    renewals: row.renewals,
                    is_extended: !!row.is_extended,
                    last_nudged_at: row.last_nudged_at
                };
            }));
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimos: ${err.message}`);
            throw err;
        }
    },

    // Busca empréstimos de um usuário específico
    getLoansByUser: async function (user_id) {
        console.log(`🔵 [LoansModel] Buscando empréstimos do usuário: ${user_id}`);
        try {
            const rows = await allQuery(
                `SELECT l.id as loan_id, l.book_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date, l.is_extended, l.last_nudged_at
                 FROM loans l
                 LEFT JOIN books b ON l.book_id = b.id
                 WHERE l.user_id = ?
                 ORDER BY l.borrowed_at DESC`,
                [user_id]
            );
            return await Promise.all(rows.map(async (row) => {
                const book = await BooksModel.getBookById(row.book_id);
                return {
                    id: row.loan_id,
                    book,
                    borrowed_at: row.borrowed_at,
                    returned_at: row.returned_at,
                    due_date: row.due_date,
                    renewals: row.renewals,
                    is_extended: !!row.is_extended,
                    last_nudged_at: row.last_nudged_at
                };
            }));
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimos do usuário: ${err.message}`);
            throw err;
        }
    },

    // Busca um empréstimo pelo ID
    getLoanById: (loan_id) => {
        return getQuery(`SELECT * FROM loans WHERE id = ?`, [loan_id]).then((row) => {
            return row;
        }).catch((err) => {
            throw err;
        });
    },

    // Renova um empréstimo
    renewLoan: (loan_id, new_due_date) => {
        console.log(`🔵 [LoansModel] Renovando empréstimo: loan_id=${loan_id}, new_due_date=${new_due_date}`);
        // Atualiza due_date para a data informada
        return executeQuery(
            `UPDATE loans SET renewals = renewals + 1, due_date = ? WHERE id = ? AND returned_at IS NULL`,
            [new_due_date, loan_id]
        ).then((result) => {
            if (result.changes === 0) {
                throw new Error('Empréstimo não encontrado ou já devolvido.');
            }
            console.log(`🟢 [LoansModel] Empréstimo renovado com sucesso: loan_id=${loan_id}`);
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao renovar empréstimo: ${err.message}`);
            throw err;
        });
    },

    /* ======================= NÃO UTILIZADAS ATUALMENTE ======================= */

    // Registra o último nudge enviado para um empréstimo
    setLastNudged: (loan_id) => {
        return executeQuery(
            `UPDATE loans SET last_nudged_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [loan_id]
        ).then(() => {
            return;
        }).catch((err) => {
            throw err;
        });
    },

    // Encurta o prazo de um empréstimo estendido para 5 dias a partir de agora
    shortenDueDateIfLongerThan: (loan_id, targetDaysFromNow) => {
        return executeQuery(
            `UPDATE loans
                    SET due_date = datetime('now', '+'|| ? ||' days')
                    WHERE id = ?
                      AND returned_at IS NULL
                      AND is_extended = 1
                      AND (due_date IS NULL OR due_date > datetime('now', '+'|| ? ||' days'))`,
            [targetDaysFromNow, loan_id, targetDaysFromNow]
        ).then((result) => {
            return result.changes > 0;
        }).catch((err) => {
            throw err;
        });
    },

    
};