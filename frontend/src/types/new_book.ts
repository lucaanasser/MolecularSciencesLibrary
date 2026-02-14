import { AREAS, SUBAREAS, STATUS, LANGUAGES } from "@/constants/books";

export interface Book {
  id: number;
  code: string;

  area: Area;
  subarea: Subarea;

  title: string;
  subtitle?: string;
  authors: string;

  edition: number;
  volume: number;  
  language: Language;

  status: Status;
}

export type Area = typeof AREAS[number];
export type Subarea<A extends Area = Area> = typeof SUBAREAS[A][number];
export type Status = typeof STATUS[number];
export type Language = typeof LANGUAGES[number];