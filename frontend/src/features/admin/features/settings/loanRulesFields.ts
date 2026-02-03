export const loanRulesFields = [
  { name: "max_days", label: "Tempo de empréstimo", unit: "dias" },
  { name: "max_books_per_user", label: "Máximo de livros por usuário", unit: "livros" },
  { name: "overdue_reminder_days", label: "Intervalo entre lembretes de atraso", unit: "dias" },
  { name: "max_renewals", label: "Máximo de renovações por empréstimo", unit: "vezes" },
  { name: "renewal_days", label: "Tempo de cada renovação", unit: "dias" },
  { name: "extension_window_days", label: "Janela para extensão do empréstimo", unit: "dias" },
  { name: "extension_block_multiplier", label: "Multiplicador do bloco de extensão", unit: "vezes" },
  { name: "shortened_due_days_after_nudge", label: "Tempo mínimo após nudge (fase estendida)", unit: "dias" },
  { name: "nudge_cooldown_hours", label: "Tempo de cooldown da cutucada", unit: "horas" },
  { name: "pending_nudge_extension_days", label: "Tempo de extensão curta após nudge (pendência)", unit: "dias" },
];
