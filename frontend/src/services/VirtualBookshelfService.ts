import { VirtualShelf, ShelfConfigUpdate } from '@/types/VirtualBookshelf';

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
   * Obtém todas as configurações de prateleiras
   */
  async getShelvesConfig(): Promise<VirtualShelf[]> {
    console.log('🔵 [VirtualBookshelfService] Obtendo configurações das prateleiras');
    try {
      const response = await fetch('/api/virtual-bookshelf');
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const shelves = await response.json();
      console.log('🟢 [VirtualBookshelfService] Configurações obtidas com sucesso');
      return shelves;
    } catch (error) {
      console.error('🔴 [VirtualBookshelfService] Erro ao obter configurações:', error);
      throw error;
    }
  }

  /**
   * Atualiza o código inicial de uma prateleira
   */
  async updateShelfStartCode(shelf_number: number, shelf_row: number, book_code_start: string): Promise<any> {
    console.log(`🔵 [VirtualBookshelfService] Atualizando código inicial: Estante ${shelf_number}, Prateleira ${shelf_row} -> ${book_code_start}`);
    try {
      const response = await fetch('/api/virtual-bookshelf/shelf-start', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ shelf_number, shelf_row, book_code_start })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🟢 [VirtualBookshelfService] Código inicial atualizado com sucesso');
      return result;
    } catch (error) {
      console.error('🔴 [VirtualBookshelfService] Erro ao atualizar código inicial:', error);
      throw error;
    }
  }

  /**
   * Atualiza o código final de uma prateleira (apenas para últimas prateleiras)
   */
  async updateShelfEndCode(shelf_number: number, shelf_row: number, book_code_end: string): Promise<any> {
    console.log(`🔵 [VirtualBookshelfService] Atualizando código final: Estante ${shelf_number}, Prateleira ${shelf_row} -> ${book_code_end}`);
    try {
      const response = await fetch('/api/virtual-bookshelf/shelf-end', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ shelf_number, shelf_row, book_code_end })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🟢 [VirtualBookshelfService] Código final atualizado com sucesso');
      return result;
    } catch (error) {
      console.error('🔴 [VirtualBookshelfService] Erro ao atualizar código final:', error);
      throw error;
    }
  }

  /**
   * Configura uma prateleira como última da estante
   */
  async setLastShelf(shelf_number: number, shelf_row: number, is_last_shelf: boolean): Promise<any> {
    console.log(`🔵 [VirtualBookshelfService] Configurando última prateleira: Estante ${shelf_number}, Prateleira ${shelf_row} -> ${is_last_shelf}`);
    try {
      const response = await fetch('/api/virtual-bookshelf/last-shelf', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ shelf_number, shelf_row, is_last_shelf })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🟢 [VirtualBookshelfService] Configuração de última prateleira atualizada');
      return result;
    } catch (error) {
      console.error('🔴 [VirtualBookshelfService] Erro ao configurar última prateleira:', error);
      throw error;
    }
  }

  /**
   * Atualiza múltiplas configurações de prateleiras
   */
  async updateShelvesConfig(shelvesConfig: ShelfConfigUpdate[]): Promise<any> {
    console.log('🔵 [VirtualBookshelfService] Atualizando configurações em lote');
    try {
      const response = await fetch('/api/virtual-bookshelf', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ shelvesConfig })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🟢 [VirtualBookshelfService] Configurações atualizadas em lote com sucesso');
      return result;
    } catch (error) {
      console.error('🔴 [VirtualBookshelfService] Erro ao atualizar configurações em lote:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os livros ordenados
   */
  async getOrderedBooks(): Promise<any[]> {
    console.log('🔵 [VirtualBookshelfService] Obtendo livros ordenados');
    try {
      const response = await fetch('/api/virtual-bookshelf/books');
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const books = await response.json();
      console.log('🟢 [VirtualBookshelfService] Livros ordenados obtidos com sucesso');
      return books;
    } catch (error) {
      console.error('🔴 [VirtualBookshelfService] Erro ao obter livros ordenados:', error);
      throw error;
    }
  }

  /**
   * Valida um código de livro
   */
  async validateBookCode(bookCode: string): Promise<any> {
    console.log(`🔵 [VirtualBookshelfService] Validando código: ${bookCode}`);
    try {
      const response = await fetch(`/api/virtual-bookshelf/validate?bookCode=${encodeURIComponent(bookCode)}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const result = await response.json();
      console.log('🟢 [VirtualBookshelfService] Código validado com sucesso');
      return result;
    } catch (error) {
      console.error('🔴 [VirtualBookshelfService] Erro ao validar código:', error);
      throw error;
    }
  }
}

export default new VirtualBookshelfService();
