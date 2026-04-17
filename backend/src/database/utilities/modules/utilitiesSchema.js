/**
 * Responsabilidade: criar tabelas e seeds do dominio utilities.
 * Camada: database/utilities.
 * Entradas/Saidas: recebe db/helpers e prepara schema base de regras/notificacoes.
 * Dependencias criticas: run/get.
 */

const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: cria tabelas utilitarias de notificacoes/regras e aplica seed default de rules.
 * Onde e usada: initUtilitiesDb.
 * Dependencias chamadas: run e get do contexto.
 * Efeitos colaterais: cria schema utilitario e insere registro padrao de regras.
 */
async function initUtilitiesSchema({ run, get }) {
    await run(
        `CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            metadata TEXT,
            loan_id INTEGER,
            status TEXT DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`
    );
    log.success('Tabela notifications criada com sucesso');

    await run(
        `CREATE TABLE IF NOT EXISTS rules (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            max_days INTEGER NOT NULL DEFAULT 7,
            overdue_reminder_days INTEGER NOT NULL DEFAULT 3,
            max_books_per_user INTEGER NOT NULL DEFAULT 5,
            max_renewals INTEGER NOT NULL DEFAULT 2,
            renewal_days INTEGER NOT NULL DEFAULT 7,
            extension_window_days INTEGER NOT NULL DEFAULT 3,
            extension_block_multiplier INTEGER NOT NULL DEFAULT 3,
            shortened_due_days_after_nudge INTEGER NOT NULL DEFAULT 5,
            nudge_cooldown_hours INTEGER NOT NULL DEFAULT 24,
            pending_nudge_extension_days INTEGER NOT NULL DEFAULT 5
        )`
    );
    log.success('Tabela rules criada com sucesso');

    const row = await get('SELECT * FROM rules WHERE id = 1');
    if (!row) {
        await run(
            `INSERT INTO rules (id, max_days, overdue_reminder_days, max_books_per_user, max_renewals, renewal_days, extension_window_days, extension_block_multiplier, shortened_due_days_after_nudge, nudge_cooldown_hours, pending_nudge_extension_days)
             VALUES (1, 7, 3, 5, 2, 7, 3, 3, 5, 24, 5)`
        );
    }
}

module.exports = {
    initUtilitiesSchema
};
