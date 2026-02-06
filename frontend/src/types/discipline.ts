
export interface Discipline {
  id?: number;
  codigo?: string;
  nome?: string;
  unidade?: string | null;
  campus?: string | null;
  creditos_aula?: number;
  creditos_trabalho?: number;
  has_valid_classes?: boolean;
  is_postgrad?: boolean;
  ementa?: string | null;
  objetivos?: string | null;
  conteudo_programatico?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DisciplineClass {
  id: number;
  discipline_id: number;
  codigo_turma: string;
  codigo_turma_teorica: string | null;
  tipo: string | null;
  inicio: string | null;
  fim: string | null;
  observacoes: string | null;
  schedules: ClassSchedule[];
  professors: string[];
}

export interface ClassSchedule {
  id: number;
  class_id: number;
  dia: string;
  horario_inicio: string;
  horario_fim: string;
  professor_nome?: string;
}

export interface FullDiscipline extends Discipline {
  turmas: DisciplineClass[];
}

export interface DisciplineFilters {
  campus?: string;
  unidade?: string;
  search?: string;
  hasValidClasses?: boolean;
  isPostgrad?: boolean;
  limit?: number;
  offset?: number;
}

export interface DisciplineStats {
  total: number;
  with_valid_classes: number;
  campi: { campus: string; count: number }[];
  unidades: { unidade: string; count: number }[];
}