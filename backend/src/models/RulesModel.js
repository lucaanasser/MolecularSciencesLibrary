const sqlite3 = require('sqlite3');
const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || 'app/database/library.db';

function getDb() {
    return new sqlite3.Database(dbPath);
}

const RulesModel = {
    getRules: () => {
        console.log('🔵 [RulesModel] Buscando regras de empréstimo');
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.get('SELECT max_days, overdue_reminder_days, max_books_per_user, max_renewals, renewal_days, extension_window_days, extension_block_multiplier, shortened_due_days_after_nudge, nudge_cooldown_hours FROM rules WHERE id = 1', (err, row) => {
                db.close();
                if (err) {
                    console.error('🔴 [RulesModel] Erro ao buscar regras:', err.message);
                    reject(err);
                } else {
                    console.log('🟢 [RulesModel] Regras encontradas:', row);
                    resolve(row);
                }
            });
        });
    },

    updateRules: (data) => {
        console.log('🔵 [RulesModel] Atualizando regras:', data);
        return new Promise((resolve, reject) => {
            const db = getDb();
            db.run(
                `UPDATE rules SET max_days = ?, overdue_reminder_days = ?, max_books_per_user = ?, max_renewals = ?, renewal_days = ?, extension_window_days = ?, extension_block_multiplier = ?, shortened_due_days_after_nudge = ?, nudge_cooldown_hours = ? WHERE id = 1`,
                [
                    data.max_days,
                    data.overdue_reminder_days,
                    data.max_books_per_user,
                    data.max_renewals,
                    data.renewal_days,
                    data.extension_window_days,
                    data.extension_block_multiplier,
                    data.shortened_due_days_after_nudge,
                    data.nudge_cooldown_hours
                ],
                function (err) {
                    db.close();
                    if (err) {
                        console.error('🔴 [RulesModel] Erro ao atualizar regras:', err.message);
                        reject(err);
                    } else {
                        console.log('🟢 [RulesModel] Regras atualizadas com sucesso');
                        resolve();
                    }
                }
            );
        });
    }
};

module.exports = RulesModel;