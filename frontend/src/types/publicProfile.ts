/**
 * Tipos relacionados ao perfil público do usuário.
 */

// Tag estilo Lattes (Grande área, Área, Subárea)
export interface ProfileTag {
  id: string;
  label: string;
  category?: "grande-area" | "area" | "subarea" | "custom";
}

// Informações do Ciclo Avançado (pode ter múltiplos)
export interface AdvancedCycleInfo {
  id: string;
  orientador: string;
  coorientadores?: string[]; // Opcional, pode ter múltiplos
  tema: string;
  descricao: string;
  instituto?: string; // Instituto/Unidade/Faculdade
  universidade?: string; // Universidade (opcional, além do instituto)
  semestres: number; // Quantos semestres durou
  anoInicio?: number;
  anoConclusao?: number;
  disciplinas: string[]; // IDs das disciplinas associadas a este avançado
  tags?: ProfileTag[]; // Limitado a 5 tags (2 área + 3 subárea)
}

// Disciplina cursada no ciclo avançado
export interface DisciplinaAvancado {
  id: string;
  codigo: string;
  nome: string;
  professor?: string;
  ano: number; // Ex: 2024
  semestre: 1 | 2; // 1 ou 2
  nota?: string;
  avancadoId?: string; // ID do avançado ao qual pertence
}

// Informações pós-CM
export interface PostCMInfo {
  id: string;
  tipo: "trabalho" | "pos-graduacao" | "nova-graduacao" | "retorno-curso-origem" | "outro";
  instituicao: string;
  cargo?: string;
  orientador?: string;
  areas?: ProfileTag[];
  descricao?: string;
  anoInicio?: number;
  anoFim?: number;
}

// Experiência Internacional durante o CM
export interface InternationalExperience {
  id: string;
  tipo: "intercambio" | "estagio" | "pesquisa" | "curso" | "outro";
  pais: string;
  instituicao: string;
  programa?: string; // Nome do programa (ex: "Ciência sem Fronteiras", "Erasmus+")
  orientador?: string; // Orientador durante a experiência (opcional)
  descricao?: string;
  anoInicio: number;
  anoFim?: number; // Se não preenchido, ainda está em andamento
  duracaoNumero?: number; // Quantidade de tempo
  duracaoUnidade?: "dias" | "semanas" | "meses" | "anos"; // Unidade de tempo
}

// Perfil público completo
export interface PublicProfile {
  id: number;
  userId: number;
  nome: string;
  turma?: string;
  profileImage?: string;
  bio?: string;
  tags: ProfileTag[];
  ciclosAvancados: AdvancedCycleInfo[]; // Array de avançados
  disciplinas: DisciplinaAvancado[]; // Disciplinas do(s) avançado(s)
  experienciasInternacionais?: InternationalExperience[]; // Experiências internacionais
  posCM?: PostCMInfo[]; // Agora é array
  isPublic: boolean;
  emailPublico?: string;
  linkedIn?: string;
  lattes?: string;
  seguindo: number[]; // IDs dos usuários que esta pessoa segue
  createdAt?: string;
  updatedAt?: string;
}

// Sugestões de tags predefinidas (estilo Lattes)
export const SUGGESTED_TAGS = {
  grandeArea: [
    "Ciências Exatas e da Terra",
    "Ciências Biológicas",
    "Engenharias",
    "Ciências da Saúde",
    "Ciências Humanas",
    "Ciências Sociais Aplicadas",
    "Multidisciplinar"
  ],
  area: [
    "Matemática",
    "Física",
    "Química",
    "Biologia",
    "Computação",
    "Estatística",
    "Neurociência",
    "Bioquímica",
    "Genética",
    "Ecologia",
    "Astronomia",
    "Geologia"
  ],
  subarea: [
    "Álgebra",
    "Análise",
    "Geometria",
    "Topologia",
    "Física Teórica",
    "Física Experimental",
    "Mecânica Quântica",
    "Relatividade",
    "Química Orgânica",
    "Química Inorgânica",
    "Biologia Molecular",
    "Microbiologia",
    "Machine Learning",
    "Inteligência Artificial",
    "Ciência de Dados",
    "Criptografia"
  ]
};

// Post-CM tipos
export const POST_CM_TYPES = [
  { value: "trabalho", label: "Trabalhando" },
  { value: "pos-graduacao", label: "Pós-graduação" },
  { value: "outro", label: "Outro" }
] as const;
