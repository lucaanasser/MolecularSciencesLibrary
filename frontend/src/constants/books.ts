/*
 * Este arquivo foi gerado automaticamente a partir do backend.
 * NÃO EDITE MANUALMENTE!
 * 
 * Para atualizar as áreas e subáreas, edite o arquivo bookValidAreas.js no backend 
 * e execute o script de geração novamente.
 */

export const AREAS = [
  "Física",
  "Química",
  "Biologia",
  "Matemática",
  "Computação",
  "Variados"
] as const;

export type Area = typeof AREAS[number];

export const SUBAREAS: Record<Area, string[]> = {
  "Física": [
    "Física Geral",
    "Mecânica",
    "Termodinâmica",
    "Eletromagnetismo",
    "Física Moderna",
    "Física Matemática",
    "Astronomia e Astrofísica"
  ],
  "Química": [
    "Química Geral",
    "Fisico-Química",
    "Química Inorgânica",
    "Química Orgânica",
    "Química Experimental"
  ],
  "Biologia": [
    "Bioquímica",
    "Biologia Molecular e Celular",
    "Genética e Evolução",
    "Biologia de Sistemas",
    "Desenvolvimento",
    "Ecologia",
    "Botânica"
  ],
  "Matemática": [
    "Cálculo",
    "Geometria Analítica",
    "Álgebra Linear",
    "Análise",
    "Álgebra Abstrata",
    "Topologia e Geometria",
    "Lógica e Fundamentos",
    "Equações Diferenciais",
    "Funções Complexas"
  ],
  "Computação": [
    "Fundamentos de Computação",
    "Algoritmos e Estruturas de Dados",
    "Análise Numérica",
    "Probabilidade e Estatística",
    "Teoria da Computação",
    "Programação",
    "Sistemas e Redes"
  ],
  "Variados": [
    "Divulgação Científica",
    "História e Filosofia da Ciência",
    "Interdisciplinares",
    "Literatura"
  ]
} as const;

export const STATUS = [
  "disponível",
  "emprestado",
  "reservado",
  "indisponível"
] as const;

export type Status = typeof STATUS[number];

export const LANGUAGES = [
  "Português",
  "Inglês",
  "Espanhol",
  "Outro"
] as const;

export type Language = typeof LANGUAGES[number];
