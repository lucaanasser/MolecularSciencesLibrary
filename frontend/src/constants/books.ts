/*
 * Este arquivo contém as constantes relacionadas aos livros, como áreas, subáreas, status e idiomas.
 * Essas constantes são usadas para garantir consistência em todo o aplicativo e facilitar a manutenção.
 * 
 * ATENÇÃO:
 * Para adicionar ou modificar áreas/subáreas, é preciso atualizar tanto este arquivo 
 * quanto o arquivo de validação e mapeamento correspondente no backend. 
 * (backend/src/utils/bookValidAreas.js)
 */

export { AREAS, SUBAREAS, STATUS, LANGUAGES };

const AREAS = [
  "Matemática",
  "Física",
  "Química",
  "Biologia",
  "Computação",
  "Variados",
]

import { Area } from "@/types/new_book";
const SUBAREAS: Record<Area, string[]> = {
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
};

const STATUS = [
  "disponível",    // Disponível para empréstimo
  "emprestado",    // Empréstimo ativo cadastrado
  "reservado",     // Reserva didática
  "indisponível"   // Livro danificado ou perdido
]

const LANGUAGES = [
  "Português",
  "Inglês",
  "Espanhol",
  "Outro"
]