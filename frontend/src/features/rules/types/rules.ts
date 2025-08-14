export interface LoanRules {
  max_days: number;
  max_books_per_user: number;
  overdue_reminder_days: number;
  max_renewals: number; 
  renewal_days: number; 
  extension_window_days: number;
  extension_block_multiplier: number;
  shortened_due_days_after_nudge: number;
  nudge_cooldown_hours: number;
  pending_nudge_extension_days: number;
}
