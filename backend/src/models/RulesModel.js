const { getQuery, runQuery } = require('../database/db');

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
        return runQuery(
            `UPDATE rules SET max_days = ?, overdue_reminder_days = ?, max_books_per_user = ?, max_renewals = ?, renewal_days = ?, extension_window_days = ?, extension_block_multiplier = ?, shortened_due_days_after_nudge = ?, nudge_cooldown_hours = ?, pending_nudge_extension_days = ? WHERE id = 1`,
            [
                data.max_days,
                data.overdue_reminder_days,
                data.max_books_per_user,
                data.max_renewals,
                data.renewal_days,
                data.extension_window_days,
                data.extension_block_multiplier,
                data.shortened_due_days_after_nudge,
                data.nudge_cooldown_hours,
                data.pending_nudge_extension_days
            ]
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