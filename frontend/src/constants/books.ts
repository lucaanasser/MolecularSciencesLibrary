/* Áreas e subáreas dos livros */
export type Area =
  | "Matemática"
  | "Física"
  | "Química"
  | "Biologia"
  | "Computação"
  | "Variados";
  
export const SubareasByArea = {
  Matemática: 
  [
    "Cálculo",
    "Geometria Analítica",
    "Álgebra Linear",
    "Análise",
    "Álgebra Abstrata",
    "Topologia e Geometria",
    "Lógica e Fundamentos"
  ],
  Física: 
  [
    "Física Geral", 
    "Mecânica", 
    "Termodinâmica",
    "Eletromagnetismo",
    "Física Moderna",
    "Física Matemática", 
    "Astronomia e Astrofísica"
  ],
  Química: 
  [
    "Química Geral", 
    "Fisico-Química", 
    "Química Inorgânica",
    "Química Orgânica",
    "Química Experimental" 
  ],
  Biologia: 
  [
    "Bioquímica", 
    "Biologia Molecular e Celular", 
    "Genética e Evolução",
    "Biologia de Sistemas",
    "Desenvolvimento",
    "Ecologia",
    "Botânica"
  ],
  Computação: 
  [
    "Fundamentos de Computação",
    "Algorítmos e Estruturas de Dados",
    "Análise Numérica",
    "Probabilidade e Estatística", 
    "Teoria da Computação",
    "Programação",
    "Sistemas e Redes"
  ],
  Variados: 
  [
    "Divulgação Científica",
    "Filosofia e História da Ciência",
    "Handbooks e Manuais",
    "Interdisciplinares",
    "Miscelânea", 
  ],
} as const;

export type Subarea<A extends Area = Area> =
  typeof SubareasByArea[A][number];

/* Status dos livros */
export type Status =
  | "disponível"
  | "emprestado"
  | "reservado"
  | "atrasado"
  | "perdido";

/* Idiomas dos livros */
export type Language = 
  | "Português" 
  | "Inglês" 
  | "Espanhol" 
  | "Outro";