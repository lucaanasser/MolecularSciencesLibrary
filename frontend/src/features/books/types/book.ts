export interface BookOption {
  id: string;
  title: string;
  subtitle?: string; 
  authors?: string;
  edition?: string;
  volume?: string;
  code: string;
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

// Adicione esta definição de tipo que estava faltando
export type AddBookType = "novo" | "exemplar" | "volume" | null;

// Adicione estas definições de tipos que estão sendo usadas em useBookOptions.ts e AreaSelection.tsx
export interface AreaCode {
  [key: string]: string;
}

export interface SubareaCode {
  [key: string]: { [key: string]: string | number };
}