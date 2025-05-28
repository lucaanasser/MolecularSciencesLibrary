/**
 * Tipos relacionados a livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export interface BookOption {
  id: string;
  code: string;
  title: string;
  authors?: string;
  edition?: string;
  volume?: string;
  subtitle?: string;
  language?: string;
  exemplar?: number; 
  area: string;        
  subarea: string | number;
  available: boolean;
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