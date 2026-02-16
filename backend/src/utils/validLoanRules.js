/**
 * Lista dos campos válidos para regras de empréstimo de livros e seus metadados.
 * 
 * Sempre que um novo campo de regra for adicionado ou removido do banco de dados,
 * atualize este arquivo para garantir consistência em toda a aplicação.
 */

const LOAN_RULES = [
    'max_days',
    'max_books_per_user',
    'overdue_reminder_days',
    'max_renewals',
    'renewal_days',
    //'extension_window_days',
    //'extension_block_multiplier',
    //'shortened_due_days_after_nudge',
    'nudge_cooldown_hours',
    //'pending_nudge_extension_days'
];

const LOAN_RULES_META = {
    max_days: { label: "Tempo de empréstimo", unit: "dias" },
    max_books_per_user: { label: "Máximo de livros por usuário", unit: "livros" },
    overdue_reminder_days: { label: "Intervalo entre lembretes de atraso", unit: "dias" },
    max_renewals: { label: "Máximo de renovações por empréstimo", unit: "vezes" },
    renewal_days: { label: "Tempo de cada renovação", unit: "dias" },
    //extension_window_days: { label: "Janela para extensão do empréstimo", unit: "dias" },
    //extension_block_multiplier: { label: "Multiplicador do bloco de extensão", unit: "vezes" },
    //shortened_due_days_after_nudge: { label: "Tempo mínimo após nudge (fase estendida)", unit: "dias" },
    nudge_cooldown_hours: { label: "Tempo de cooldown da cutucada", unit: "horas" },
    //pending_nudge_extension_days: { label: "Tempo de extensão curta após nudge (pendência)", unit: "dias" }
};

module.exports = {
    LOAN_RULES,
    LOAN_RULES_META
};