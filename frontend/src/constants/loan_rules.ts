/*
 * Este arquivo foi gerado automaticamente a partir do backend.
 * NÃO EDITE MANUALMENTE!
 * 
 * Para atualizar os campos de regras de empréstimo, edite o arquivo validLoanRules.js no backend, 
 * atualize a database e execute o script de geração novamente.
 */

export const LOAN_RULES = [
  "max_days",
  "max_books_per_user",
  "overdue_reminder_days",
  "max_renewals",
  "renewal_days",
  "nudge_cooldown_hours"
] as const;

export type LoanRuleField = typeof LOAN_RULES[number];

export const LOAN_RULES_META: Record<LoanRuleField, { label: string; unit: string }> = {
  "max_days": {
    "label": "Tempo de empréstimo",
    "unit": "dias"
  },
  "max_books_per_user": {
    "label": "Máximo de livros por usuário",
    "unit": "livros"
  },
  "overdue_reminder_days": {
    "label": "Intervalo entre lembretes de atraso",
    "unit": "dias"
  },
  "max_renewals": {
    "label": "Máximo de renovações por empréstimo",
    "unit": "vezes"
  },
  "renewal_days": {
    "label": "Tempo de cada renovação",
    "unit": "dias"
  },
  "nudge_cooldown_hours": {
    "label": "Tempo de cooldown da cutucada",
    "unit": "horas"
  }
} as const;
