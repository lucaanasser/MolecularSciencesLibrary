import { Area, Subarea, Status, Language } from "@/constants/books";

export interface Book {
  id: number;
  code: string;

  title: string;
  subtitle?: string;
  authors: string;

  volume?: number;  
  edition?: number;
  language: Language;

  area: Area;
  subarea: Subarea;

  status: Status;
}