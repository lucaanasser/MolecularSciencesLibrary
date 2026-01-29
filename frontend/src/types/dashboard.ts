import { LucideIcon } from "lucide-react";

export interface SummaryCard {
  icon: LucideIcon;
  value: number | string;
  label: string;
  color: string;
}

export interface ChartData {
  type: 'bar' | 'pie' | 'line';
  title: string;
  data: any[];
  dataKey?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  colors?: string[];
  name?: string;
}

export interface DashboardSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  summaryCards: SummaryCard[];
  charts: ChartData[];
  summaryGridCols?: number; // Número de colunas para os cards de resumo (padrão: 3)
  chartsGridCols?: number; // Número de colunas para os gráficos (padrão: 2)
}

export interface DashboardConfig {
  title: string;
  subtitle: string;
  heroIcons: LucideIcon[];
  sections: DashboardSection[];
}