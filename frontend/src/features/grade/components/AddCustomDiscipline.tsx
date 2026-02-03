import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SCHEDULE_COLORS } from '@/services/UserSchedulesService';
import { DIAS_SEMANA, DIA_LABELS } from '@/hooks/useGrade';

interface AddCustomDisciplineProps {
  onAdd: (data: {
    nome: string;
    codigo?: string;
    schedules: Array<{
      dia: string;
      horario_inicio: string;
      horario_fim: string;
    }>;
    creditos_aula?: number;
    creditos_trabalho?: number;
    color?: string;
  }) => Promise<any>;
  disabled?: boolean;
  colorIndex?: number;
}

/**
 * Componente para adicionar disciplinas customizadas
 * Abre um modal com formulário para preencher os dados
 */
export function AddCustomDiscipline({ onAdd, disabled, colorIndex = 0 }: AddCustomDisciplineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado do formulário
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [diasComHorarios, setDiasComHorarios] = useState<Record<string, { inicio: string; fim: string }>>({});
  const [creditosAula, setCreditosAula] = useState<string>('');
  const [creditosTrabalho, setCreditosTrabalho] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState(SCHEDULE_COLORS[colorIndex % SCHEDULE_COLORS.length]);

  // Reset do formulário
  const resetForm = () => {
    setNome('');
    setCodigo('');
    setDiasComHorarios({});
    setCreditosAula('');
    setCreditosTrabalho('');
    setSelectedColor(SCHEDULE_COLORS[colorIndex % SCHEDULE_COLORS.length]);
  };

  // Validação - verifica se tem nome e pelo menos um dia com horários completos
  const isValid = nome.trim() && Object.keys(diasComHorarios).length > 0 && 
    Object.values(diasComHorarios).every(h => h.inicio && h.fim);
  
  // Toggle dia da semana
  const toggleDia = (dia: string) => {
    setDiasComHorarios(prev => {
      const newDias = { ...prev };
      if (newDias[dia]) {
        delete newDias[dia];
      } else {
        newDias[dia] = { inicio: '', fim: '' };
      }
      return newDias;
    });
  };
  
  // Atualiza horário de um dia específico
  const updateHorario = (dia: string, tipo: 'inicio' | 'fim', valor: string) => {
    setDiasComHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [tipo]: valor
      }
    }));
  };

  // Submissão
  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      // Converte diasComHorarios para array de schedules
      const schedules = Object.entries(diasComHorarios).map(([dia, horarios]) => ({
        dia,
        horario_inicio: horarios.inicio,
        horario_fim: horarios.fim
      }));

      await onAdd({
        nome: nome.trim(),
        codigo: codigo.trim() || undefined,
        schedules,
        creditos_aula: creditosAula ? parseInt(creditosAula) : undefined,
        creditos_trabalho: creditosTrabalho ? parseInt(creditosTrabalho) : undefined,
        color: selectedColor
      });
      
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gera opções de horário
  const generateTimeOptions = () => {
    const options: string[] = [];
    for (let h = 7; h <= 23; h++) {
      options.push(`${h.toString().padStart(2, '0')}:00`);
      options.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-1.5 space-y-1.5">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="default" disabled={disabled} className="w-full h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Adicionar Manualmente
          </Button>
        </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Disciplina Manual</DialogTitle>
          <DialogDescription>
            Adicione uma disciplina que não está no sistema ou um compromisso pessoal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Estágio, IC, Monitoria..."
            />
          </div>

          {/* Código (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="codigo">Código (opcional)</Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: ESTAGIO01"
            />
          </div>

          {/* Créditos (opcional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditos-aula">Créditos Aula</Label>
              <Input
                id="creditos-aula"
                type="number"
                min="0"
                value={creditosAula}
                onChange={(e) => setCreditosAula(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditos-trabalho">Créditos Trabalho</Label>
              <Input
                id="creditos-trabalho"
                type="number"
                min="0"
                value={creditosTrabalho}
                onChange={(e) => setCreditosTrabalho(e.target.value)}
              />
            </div>
          </div>

          {/* Dias da semana com horários individuais */}
          <div className="space-y-3">
            <Label>Dias da Semana e Horários *</Label>
            <div className="space-y-2">
              {DIAS_SEMANA.map(dia => (
                <div key={dia} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`dia-${dia}`}
                      checked={!!diasComHorarios[dia]}
                      onCheckedChange={() => toggleDia(dia)}
                    />
                    <label
                      htmlFor={`dia-${dia}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      {DIA_LABELS[dia]}
                    </label>
                  </div>
                  
                  {/* Campos de horário aparecem quando o dia está selecionado */}
                  {diasComHorarios[dia] && (
                    <div className="grid grid-cols-2 gap-2 ml-6">
                      <div className="space-y-1">
                        <Label className="text-xs">Início</Label>
                        <Select 
                          value={diasComHorarios[dia].inicio} 
                          onValueChange={(v) => updateHorario(dia, 'inicio', v)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Hora" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Fim</Label>
                        <Select 
                          value={diasComHorarios[dia].fim} 
                          onValueChange={(v) => updateHorario(dia, 'fim', v)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Hora" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.filter(t => !diasComHorarios[dia].inicio || t > diasComHorarios[dia].inicio).map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {SCHEDULE_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-gray-900 dark:border-white scale-110' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              resetForm();
              setIsOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-academic-blue hover:bg-academic-blue-dark"
          >
            {isSubmitting ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
      
      {/* Link para criar página de disciplina */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        Não encontrou a disciplina?{' '}
        <Link 
          to="/academico/criar-disciplina" 
          className="text-academic-blue hover:underline font-medium"
        >
          Crie uma página para ela
        </Link>
      </div>
    </div>
  );
}

export default AddCustomDiscipline;
