import { VirtualShelf } from '@/features/bookshelf/types/virtualbookshelf';
import { Book } from '@/types/book';

/**
 * Serviço para gerenciar operações da estante virtual
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

class VirtualBookshelfService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  /**
   * Sempre forneça o código inicial e final ao criar/atualizar uma prateleira
   */
  async setShelfCodes(shelf_number: number, shelf_row: number, book_code_start: string, book_code_end: string) {
    const response = await fetch('/api/virtual-bookshelf/shelf-codes', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ shelf_number, shelf_row, book_code_start, book_code_end })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erro HTTP: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Retorna os livros de uma prateleira específica de uma estante
   * @param shelf_number número da estante (1-4)
   * @param shelf_row número da prateleira dentro da estante (1-6)
   * @returns Array de livros com todos os campos do backend
   */
  async getBooksByShelf(shelf_number: number, shelf_row: number): Promise<Book[]> {
    console.log(`🔵 [VirtualBookshelfService] Buscando livros: shelf_number=${shelf_number}, shelf_row=${shelf_row}`);
    const response = await fetch(`/api/virtual-bookshelf/shelf-books?shelf_number=${shelf_number}&shelf_row=${shelf_row}`);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    const books: Book[] = await response.json();
    console.log(`🟢 [VirtualBookshelfService] Livros recebidos do backend:`, books.length);
    return books;
  }

  /**
   * Obtém todas as configurações das prateleiras
   */
  async getShelvesConfig(): Promise<VirtualShelf[]> {
    const response = await fetch('/api/virtual-bookshelf');
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Atualiza o código inicial de uma prateleira
   */
  async updateShelfStartCode(shelf_number: number, shelf_row: number, book_code_start: string) {
    const response = await fetch('/api/virtual-bookshelf/shelf-start', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ shelf_number, shelf_row, book_code_start })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erro HTTP: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Atualiza o código final de uma prateleira (apenas última prateleira)
   */
  async updateShelfEndCode(shelf_number: number, shelf_row: number, book_code_end: string) {
    const response = await fetch('/api/virtual-bookshelf/shelf-end', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ shelf_number, shelf_row, book_code_end })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erro HTTP: ${response.status}`);
    }
    return response.json();
  }
}

export default new VirtualBookshelfService();
