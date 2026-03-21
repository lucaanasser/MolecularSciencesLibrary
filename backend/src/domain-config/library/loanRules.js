/**
 * Lista dos campos validos para regras de emprestimo de livros e seus metadados.
 */

const LOAN_RULES = [
    'max_days',
    'max_books_per_user',
    'overdue_reminder_days',
    'max_renewals',
    'renewal_days',
    'nudge_cooldown_hours'
];

const LOAN_RULES_META = {
    max_days: { label: 'Tempo de empréstimo', unit: 'dias' },
    max_books_per_user: { label: 'Máximo de livros por usuário', unit: 'livros' },
    overdue_reminder_days: { label: 'Intervalo entre lembretes de atraso', unit: 'dias' },
    max_renewals: { label: 'Máximo de renovações por empréstimo', unit: 'vezes' },
    renewal_days: { label: 'Tempo de cada renovação', unit: 'dias' },
    nudge_cooldown_hours: { label: 'Tempo de cooldown da cutucada', unit: 'horas' }
};

module.exports = {
    LOAN_RULES,
    LOAN_RULES_META
};
