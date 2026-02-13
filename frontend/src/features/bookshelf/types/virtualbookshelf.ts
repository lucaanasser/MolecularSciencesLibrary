export interface VirtualShelf {
  id?: number;
  shelf_number: number;
  shelf_row: number;
  book_code_start: string | null;
  book_code_end: string | null;
  calculated_book_code_end?: string | null;
}

export interface ShelfConfigUpdate {
  shelf_number: number;
  shelf_row: number;
  book_code_start?: string;
  book_code_end?: string;
}

export type EditingMode = 'start' | 'end' | null;