import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    dia: string;
    horario_inicio: string;
    horario_fim: string;
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
  const [dia, setDia] = useState<string>('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [selectedColor, setSelectedColor] = useState(SCHEDULE_COLORS[colorIndex % SCHEDULE_COLORS.length]);

  // Reset do formulário
  const resetForm = () => {
    setNome('');
    setCodigo('');
    setDia('');
    setHorarioInicio('');
    setHorarioFim('');
    setSelectedColor(SCHEDULE_COLORS[colorIndex % SCHEDULE_COLORS.length]);
  };

  // Validação
  const isValid = nome.trim() && dia && horarioInicio && horarioFim;

  // Submissão
  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        nome: nome.trim(),
        codigo: codigo.trim() || undefined,
        dia,
        horario_inicio: horarioInicio,
        horario_fim: horarioFim,
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
    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-1.5">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={disabled} className="w-full h-7 text-xs">
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

          {/* Dia da semana */}
          <div className="space-y-2">
            <Label>Dia da Semana *</Label>
            <Select value={dia} onValueChange={setDia}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {DIAS_SEMANA.map(d => (
                  <SelectItem key={d} value={d}>
                    {DIA_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início *</Label>
              <Select value={horarioInicio} onValueChange={setHorarioInicio}>
                <SelectTrigger>
                  <SelectValue placeholder="Horário" />
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
            
            <div className="space-y-2">
              <Label>Fim *</Label>
              <Select value={horarioFim} onValueChange={setHorarioFim}>
                <SelectTrigger>
                  <SelectValue placeholder="Horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.filter(t => t > horarioInicio).map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            className="bg-cm-academic hover:bg-cm-academic-dark"
          >
            {isSubmitting ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddCustomDiscipline;
