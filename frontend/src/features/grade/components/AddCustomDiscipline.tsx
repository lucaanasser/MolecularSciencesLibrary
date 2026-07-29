import { useState } from 'react';
import { Plus } from 'lucide-react';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
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
 * Componente para adicionar disciplinas customizadas.
 * Abre um modal com formulário para preencher os dados.
 */
export function AddCustomDiscipline({ onAdd, disabled, colorIndex = 0 }: AddCustomDisciplineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [diasComHorarios, setDiasComHorarios] = useState<Record<string, { inicio: string; fim: string }>>({});
  const [creditosAula, setCreditosAula] = useState<string>('');
  const [creditosTrabalho, setCreditosTrabalho] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState(SCHEDULE_COLORS[colorIndex % SCHEDULE_COLORS.length]);

  const resetForm = () => {
    setNome('');
    setCodigo('');
    setDiasComHorarios({});
    setCreditosAula('');
    setCreditosTrabalho('');
    setSelectedColor(SCHEDULE_COLORS[colorIndex % SCHEDULE_COLORS.length]);
  };

  const isValid = nome.trim() && Object.keys(diasComHorarios).length > 0 &&
    Object.values(diasComHorarios).every(h => h.inicio && h.fim);

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

  const updateHorario = (dia: string, tipo: 'inicio' | 'fim', valor: string) => {
    setDiasComHorarios(prev => ({
      ...prev,
      [dia]: { ...prev[dia], [tipo]: valor }
    }));
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
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
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="flex items-center gap-1 text-xs font-semibold text-academic-blue hover:text-academic-blue-muted transition-colors disabled:opacity-50"
      >
        Adicionar manualmente
        <Plus className="w-4 h-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bebas text-3xl tracking-wide text-gray-800 dark:text-white">
              Disciplina manual
            </DialogTitle>
            <DialogDescription>
              Cria uma disciplina <strong>só para você</strong> — fica salva na sua conta (estágio, IC, monitoria…).
            </DialogDescription>
          </DialogHeader>

          {/* Aviso: caminho global */}
          <div className="bg-academic-blue/10 border border-academic-blue/20 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-300">
            <p className="mb-1">Quer uma disciplina que <strong>todos</strong> os usuários veem (ex.: falta no sistema)?</p>
            <Link
              to="/academico/criar-disciplina"
              onClick={() => setIsOpen(false)}
              className="font-semibold text-academic-blue hover:underline"
            >
              É uma disciplina da pós? Adicione ela aqui →
            </Link>
          </div>

          <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Estágio, IC, Monitoria…"
                className="rounded-xl focus-visible:ring-academic-blue"
              />
            </div>

            {/* Código */}
            <div className="space-y-1.5">
              <Label htmlFor="codigo">Código (opcional)</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: ESTAGIO01"
                className="rounded-xl focus-visible:ring-academic-blue"
              />
            </div>

            {/* Créditos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="creditos-aula">Créditos aula</Label>
                <Input
                  id="creditos-aula"
                  type="number"
                  min="0"
                  value={creditosAula}
                  onChange={(e) => setCreditosAula(e.target.value)}
                  className="rounded-xl focus-visible:ring-academic-blue"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="creditos-trabalho">Créditos trabalho</Label>
                <Input
                  id="creditos-trabalho"
                  type="number"
                  min="0"
                  value={creditosTrabalho}
                  onChange={(e) => setCreditosTrabalho(e.target.value)}
                  className="rounded-xl focus-visible:ring-academic-blue"
                />
              </div>
            </div>

            {/* Dias da semana com horários individuais */}
            <div className="space-y-2">
              <Label>Dias e horários *</Label>
              <div className="space-y-1.5">
                {DIAS_SEMANA.map(dia => {
                  const active = !!diasComHorarios[dia];
                  return (
                    <div
                      key={dia}
                      className={cn(
                        "rounded-xl border p-2.5 transition-colors",
                        active ? "border-academic-blue/50 bg-academic-blue/5" : "border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`dia-${dia}`}
                          checked={active}
                          onCheckedChange={() => toggleDia(dia)}
                          className="data-[state=checked]:bg-academic-blue data-[state=checked]:border-academic-blue"
                        />
                        <label
                          htmlFor={`dia-${dia}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          {DIA_LABELS[dia]}
                        </label>
                      </div>

                      {active && (
                        <div className="grid grid-cols-2 gap-2 mt-2.5 ml-6">
                          <div className="space-y-1">
                            <Label className="text-xs">Início</Label>
                            <Select
                              value={diasComHorarios[dia].inicio}
                              onValueChange={(v) => updateHorario(dia, 'inicio', v)}
                            >
                              <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="Hora" /></SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
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
                              <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="Hora" /></SelectTrigger>
                              <SelectContent>
                                {timeOptions.filter(t => !diasComHorarios[dia].inicio || t > diasComHorarios[dia].inicio).map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      selectedColor === color
                        ? 'border-gray-800 dark:border-white scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 gap-2 items-center">
            <Button
              variant="ghost"
              onClick={() => { resetForm(); setIsOpen(false); }}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="bg-academic-blue hover:bg-academic-blue-muted text-white"
            >
              {isSubmitting ? 'Adicionando…' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddCustomDiscipline;
