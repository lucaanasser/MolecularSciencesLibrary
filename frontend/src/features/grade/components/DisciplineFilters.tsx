import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface DisciplineFiltersProps {
  campus: string;
  unidade: string;
  onCampusChange: (value: string) => void;
  onUnidadeChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Filtros para busca de disciplinas (campus, unidade, etc)
 */
export function DisciplineFilters({
  campus,
  unidade,
  onCampusChange,
  onUnidadeChange,
  disabled
}: DisciplineFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Filtros</span>
      </div>
      
      <div className="space-y-2">
        {/* Campus */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Campus</label>
          <Select value={campus} onValueChange={onCampusChange} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="São Paulo">São Paulo</SelectItem>
              <SelectItem value="São Carlos">São Carlos</SelectItem>
              <SelectItem value="Ribeirão Preto">Ribeirão Preto</SelectItem>
              <SelectItem value="Piracicaba">Piracicaba</SelectItem>
              <SelectItem value="Bauru">Bauru</SelectItem>
              <SelectItem value="Lorena">Lorena</SelectItem>
              <SelectItem value="Pirassununga">Pirassununga</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Unidade */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Unidade</label>
          <Select value={unidade} onValueChange={onUnidadeChange} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="FCM">FCM - Ciências Moleculares</SelectItem>
              <SelectItem value="IME">IME - Matemática e Estatística</SelectItem>
              <SelectItem value="IF">IF - Física</SelectItem>
              <SelectItem value="IQ">IQ - Química</SelectItem>
              <SelectItem value="IB">IB - Biociências</SelectItem>
              <SelectItem value="IO">IO - Oceanografia</SelectItem>
              <SelectItem value="IAG">IAG - Astronomia e Geofísica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default DisciplineFilters;
