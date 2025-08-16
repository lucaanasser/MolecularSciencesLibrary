/**
 * Tipos relacionados a empréstimos.
 */
export interface Loan {
  loan_id: number;
  book_id: number;
  student_id: number;
  borrowed_at: string;
  returned_at: string | null;
  due_date?: string | null;
  renewals?: number;
  book_title?: string;
  book_authors?: string;
  user_name?: string;
  user_email?: string;
  is_reserved?: number; // 1 = reservado para reserva didática, 0 = não reservado
  is_extended?: number; // 1 se já estendido
  last_nudged_at?: string | null;
  // extension_pending removido
}