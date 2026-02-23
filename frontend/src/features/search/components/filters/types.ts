/**
 * Tipos e interfaces para filtros reutilizáveis no sistema de busca.
 * Separe os tipos de configuração (usados pelo usuário) dos tipos internos (usados pelo componente).
 */

// Tipos de filtro suportados
export type FilterType = "checkbox" | "input"; // Futuramente: "select", "range", etc.

/* ============================================================================
 * Tipos de configuração de filtros (usados pelo usuário ao definir filtros)
 * ============================================================================
 */

/**
 * Interface base para configuração de um grupo de filtros.
 */
export interface FilterGroupBaseConfig {
  key: string; // Identificador único do grupo
  label: string; // Nome exibido do grupo
  type: FilterType;
}

/**
 * Configuração de grupo de filtros do tipo checkbox.
 */
export interface CheckboxFilterGroupConfig extends FilterGroupBaseConfig {
  type: "checkbox";
  options?: string[] | ((groups: FilterGroupConfig[]) => string[]); // Função para obter opções dinamicamente (opcional)
  selected?: string[];
  setSelected?: (selected: string[]) => void;
}

/**
 * Configuração de grupo de filtros do tipo input (campo de texto).
 */
export interface InputFilterGroupConfig extends FilterGroupBaseConfig {
  type: "input";
  placeholder?: string;
  value?: string;
  setValue?: (value: string) => void;
}

/**
 * Tipo unificado para configuração de grupos de filtros.
 */
export type FilterGroupConfig = CheckboxFilterGroupConfig | InputFilterGroupConfig;


/* ============================================================================
 * Props para o painel de filtros principal
 * ============================================================================
 */

/**
 * Props para o painel de filtros principal.
 * O componente de filtros recebe FilterGroup[] (com estado).
 */
export interface FiltersPanelProps {
  filterGroups: FilterGroupConfig[];
  handleCheckboxChange: (groupKey: string, option: string) => void;
  handleInputChange: (groupKey: string, value: string) => void;
  handleClearAll: () => void;
  getOptions: (group: FilterGroupConfig) => string[] | undefined;
  drawerOpen?: boolean;
  setDrawerOpen?: (open: boolean) => void;
}