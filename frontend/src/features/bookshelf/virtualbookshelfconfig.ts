
// Tipos para integração com backend
export interface VirtualBookshelfBook {
  id: string | number;
  spineColor?: string;
  title?: string;
  volume?: string | number;
  author?: string;
  code?: string | number;
  available?: 'disponivel' | 'emprestado' | 'reservado';
}

// Exemplo mínimo de configuração local (apenas para desenvolvimento)
export const virtualBookshelfConfig = {
  shelves: [
    // Apenas códigos de início/fim, para integração real use backend
    { shelf_number: 1, shelf_row: 1, book_code_start: 'BIO-01.01 v.1', book_code_end: null },
    { shelf_number: 1, shelf_row: 2, book_code_start: 'BIO-01.20 v.1', book_code_end: null },
    // ...
  ]
};
