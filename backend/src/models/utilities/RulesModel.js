const { getQuery, executeQuery } = require('../../database/db');
const LOAN_RULES = require('../../utils/validLoanRules').LOAN_RULES;

const RulesModel = {
    getRules: () => {
        console.log('🔵 [RulesModel] Buscando regras de empréstimo');
        return getQuery('SELECT max_days, overdue_reminder_days, max_books_per_user, max_renewals, renewal_days, extension_window_days, extension_block_multiplier, shortened_due_days_after_nudge, nudge_cooldown_hours, pending_nudge_extension_days FROM rules WHERE id = 1')
            .then(row => {
                console.log('🟢 [RulesModel] Regras encontradas:', row);
                return row;
            })
            .catch(err => {
                console.error('🔴 [RulesModel] Erro ao buscar regras:', err.message);
                throw err;
            });
    },

    updateRules: (data) => {
        console.log('🔵 [RulesModel] Atualizando regras:', data);

        // Monta SET dinâmico e parâmetros na ordem de LOAN_RULES
        const setClause = LOAN_RULES.map(field => `${field} = ?`).join(', ');
        const params = LOAN_RULES.map(field => data[field]);

        return executeQuery(
            `UPDATE rules SET ${setClause} WHERE id = 1`,
            params
        )
            .then(() => {
                console.log('🟢 [RulesModel] Regras atualizadas com sucesso');
            })
            .catch(err => {
                console.error('🔴 [RulesModel] Erro ao atualizar regras:', err.message);
                throw err;
            });
    }
};

module.exports = RulesModel;