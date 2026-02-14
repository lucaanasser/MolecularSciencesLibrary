/**
 * Tipos relacionados a livros.
 */

export interface Book {
  id: number;
  code: string;
  title: string;
  subtitle?: string;
  authors: string;
  edition?: string;
  language: string;
  area: string;
  subarea: number;
  volume?: number;
  exemplar?: number;
  is_reserved: number;
  available: boolean;
  overdue: boolean;
  status: string;
  student_id?: number;
  loan_id?: number;
  due_in_window?: boolean;
  is_extended?: boolean;
  due_date?: string;
}

export interface BookFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  q?: string;
  status?: string;
  reserved?: string;
  extended?: boolean;
  limit?: number;
  offset?: number;
}

export interface BookFormData {
  title: string;
  authors: string;
  edition: string;
  volume: string;
  area: string;
  subarea: string | number;
  language: number | null;
  exemplar?: string;
}

export type AddBookType = "novo" | "exemplar" | "volume" | null;

export interface AreaCode {
  [key: string]: string;
}

export interface SubareaCode {
  [key: string]: { [key: string]: string | number };
}