export interface Loan {
  loan_id: number;
  book_id: number;
  student_id: number;
  borrowed_at: string;   
  returned_at: string | null;
  book_title?: string;
  book_authors?: string;
  user_name?: string;
  user_email?: string;
}