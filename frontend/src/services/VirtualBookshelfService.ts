import { Book } from '@/types/book';
import { logger } from '@/utils/logger';
import { fetchJson } from '@/utils/fetchJson';

export const VirtualBookshelfService = {

  setShelfCodes: async (shelf_number: number, shelf_row: number, book_code_start: string, book_code_end: string) => {
    return fetchJson(
      '/api/virtual-bookshelf/shelf-codes',
      {
        method: 'PUT',
        body: JSON.stringify({ shelf_number, shelf_row, book_code_start, book_code_end }),
      }
    );
  },

  getBooksByShelf: async (shelf_number: number, shelf_row: number): Promise<Book[]> => {
    logger.log(`🔵 [VirtualBookshelfService] Buscando livros: shelf_number=${shelf_number}, shelf_row=${shelf_row}`);
    const books: Book[] = await fetchJson(
      `/api/virtual-bookshelf/shelf-books?shelf_number=${shelf_number}&shelf_row=${shelf_row}`,
      {}
    );
    logger.log(`🟢 [VirtualBookshelfService] Livros recebidos do backend:`, books.length);
    return books;
  },

  getShelvesConfig: async (): Promise<any[]> => {
    return fetchJson('/api/virtual-bookshelf', {});
  },

  updateShelfStartCode: async (shelf_number: number, shelf_row: number, book_code_start: string) => {
    return fetchJson(
      '/api/virtual-bookshelf/shelf-start',
      {
        method: 'PUT',
        body: JSON.stringify({ shelf_number, shelf_row, book_code_start }),
      }
    );
  },

  updateShelfEndCode: async (shelf_number: number, shelf_row: number, book_code_end: string) => {
    return fetchJson(
      '/api/virtual-bookshelf/shelf-end',
      {
        method: 'PUT',
        body: JSON.stringify({ shelf_number, shelf_row, book_code_end }),
      }
    );
  }
};