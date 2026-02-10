import { Book } from "@/types/book";
import { User } from "@/types/user";

export interface Loan {
  id: number;
  book: Book;
  student: User;

  borrowed_at: string; // existe algum tipo para data? ou string é o mais simples?
  returned_at: string | null;
  due_date?: string | null;
  
  renewals?: number;
  is_extended?: boolean;
  last_nudged_at?: string | null;
}