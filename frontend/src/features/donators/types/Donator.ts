export interface Donator {
  id?: number;
  user_id?: number | null;
  name?: string;
  book_id?: number | null;
  donation_type: 'book' | 'money';
  amount?: number | null;
  contact?: string;
  notes?: string;
  created_at?: string;
}