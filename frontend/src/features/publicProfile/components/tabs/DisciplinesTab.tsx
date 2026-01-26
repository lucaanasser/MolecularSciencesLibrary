import { Plus, Trash2, BookMarked, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DisciplinaAvancado, AdvancedCycleInfo } from "@/types/publicProfile";
import { cn } from "@/lib/utils";

interface DisciplinesTabProps {
  disciplinas: DisciplinaAvancado[];
  ciclosAvancados: (AdvancedCycleInfo & { cor?: string })[];
  isEditing: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof DisciplinaAvancado, value: any) => void;
}

const BADGE_COLORS = [
  "bg-cm-purple/10 text-cm-purple border-cm-purple/20",
  "bg-cm-blue/10 text-cm-blue border-cm-blue/20",
  "bg-cm-green/10 text-cm-green border-cm-green/20",
  "bg-cm-orange/10 text-cm-orange border-cm-orange/20",
];

export const DisciplinesTab = ({
  disciplinas,
  ciclosAvancados,
  isEditing,
  onAdd,
  onRemove,
  onUpdate,
}: DisciplinesTabProps) => {

  // Agrupar por ano e semestre
  const groupedDisciplinas = disciplinas.reduce((acc, disc) => {
    const key = disc.ano && disc.semestre ? `${disc.ano}.${disc.semestre}` : "Sem semestre";
    if (!acc[key]) acc[key] = [];
    acc[key].push(disc);
    return acc;
  }, {} as Record<string, DisciplinaAvancado[]>);

  // Ordenar por ano e semestre decrescente
  const sortedSemesters = Object.keys(groupedDisciplinas)
    .sort((a, b) => {
      if (a === "Sem semestre") return 1;
      if (b === "Sem semestre") return -1;
      const [aAno, aSem] = a.split(".").map(Number);
      const [bAno, bSem] = b.split(".").map(Number);
      if (aAno !== bAno) return bAno - aAno;
      return bSem - aSem;
    });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-cm-academic rounded-full" />
          <h2 className="text-2xl font-bebas text-gray-900">Disciplinas Cursadas</h2>
          <span className="text-sm text-gray-500">({disciplinas.length} disciplinas)</span>
        </div>
        {isEditing && (
          <Button onClick={onAdd} className="rounded-full bg-cm-academic hover:bg-cm-academic/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Disciplina
          </Button>
        )}
      </div>

      {disciplinas.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <BookMarked className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhuma disciplina adicionada.</p>
          {isEditing && (
            <Button onClick={onAdd} variant="outline" className="mt-6 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeira disciplina
            </Button>
          )}
        </div>
      ) : isEditing ? (
        <div className="space-y-3">
          {disciplinas.map((disc) => (
            <div key={disc.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <Input
                  placeholder="Código"
                  value={disc.codigo}
                  onChange={(e) => onUpdate(disc.id, "codigo", e.target.value)}
                  className="sm:col-span-1"
                />
                <Input
                  placeholder="Nome da disciplina"
                  value={disc.nome}
                  onChange={(e) => onUpdate(disc.id, "nome", e.target.value)}
                  className="sm:col-span-2"
                />
                <Input
                  type="number"
                  placeholder="Ano (ex: 2024)"
                  value={disc.ano || ""}
                  onChange={(e) => onUpdate(disc.id, "ano", parseInt(e.target.value) || 0)}
                  className="sm:col-span-1"
                  min={2000}
                  max={2100}
                />
                <Select
                  value={disc.semestre ? String(disc.semestre) : ""}
                  onValueChange={(v) => onUpdate(disc.id, "semestre", parseInt(v) as 1 | 2)}
                >
                  <SelectTrigger className="sm:col-span-1">
                    <SelectValue placeholder="Semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={() => onRemove(disc.id)}
                  className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors sm:col-span-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3">
                <Input
                  placeholder="Professor (opcional)"
                  value={disc.professor || ""}
                  onChange={(e) => onUpdate(disc.id, "professor", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedSemesters.map((semester) => (
            <div 
              key={semester}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Header do Semestre */}
              <div className="bg-cm-purple/5 px-6 py-4 border-b-2 border-gray-200 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cm-purple" />
                <h3 className="text-xl font-bold text-gray-900">{semester}</h3>
                <span className="ml-auto text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full">
                  {groupedDisciplinas[semester].length} {groupedDisciplinas[semester].length === 1 ? 'disciplina' : 'disciplinas'}
                </span>
              </div>

              {/* Grade de Disciplinas */}
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                {groupedDisciplinas[semester].map((disc) => {
                  const avancadoIndex = ciclosAvancados.findIndex((a) => a.id === disc.avancadoId);
                  return (
                    <div 
                      key={disc.id} 
                      className={cn(
                        "p-4 rounded-xl border-l-4 bg-white shadow-sm hover:shadow-md transition-all",
                        !disc.avancadoId && "border-l-gray-300",
                        disc.avancadoId && avancadoIndex === 0 && "border-l-cm-purple",
                        disc.avancadoId && avancadoIndex === 1 && "border-l-cm-blue",
                        disc.avancadoId && avancadoIndex === 2 && "border-l-cm-green",
                        disc.avancadoId && avancadoIndex >= 3 && "border-l-cm-orange"
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-cm-purple bg-cm-purple/10 px-2 py-1 rounded">
                          {disc.codigo}
                        </span>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {disc.ano}.{disc.semestre}
                        </span>
                        {disc.avancadoId && (
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] border", BADGE_COLORS[avancadoIndex % BADGE_COLORS.length])}
                          >
                            Av. {avancadoIndex + 1}
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-2">
                        {disc.nome}
                      </h4>
                      {disc.professor && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{disc.professor}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
