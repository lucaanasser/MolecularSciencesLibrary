import { Book } from "@/types/book";
import { User } from "@/types/user";

export interface Loan {
  id: number;
  book: Book;
  user: User;

  borrowed_at: string;
  returned_at: string | null;
  due_date?: string | null;
  
  renewals?: number;
  is_extended?: boolean;
  last_nudged_at?: string | null;
}