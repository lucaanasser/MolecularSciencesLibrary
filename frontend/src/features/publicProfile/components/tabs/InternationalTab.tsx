import { Plus, Trash2, Globe, MapPin, Building2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InternationalExperience } from "@/types/publicProfile";

interface InternationalTabProps {
  experiencias: InternationalExperience[];
  isEditing: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof InternationalExperience, value: any) => void;
}

const EXPERIENCE_TYPES = [
  { value: "intercambio", label: "Intercâmbio acadêmico", color: "bg-blue-500" },
  { value: "estagio", label: "Estágio", color: "bg-green-500" },
  { value: "pesquisa", label: "Pesquisa", color: "bg-purple-500" },
  { value: "curso", label: "Curso/Workshop", color: "bg-orange-500" },
  { value: "outro", label: "Outro", color: "bg-gray-500" },
];

export const InternationalTab = ({
  experiencias,
  isEditing,
  onAdd,
  onRemove,
  onUpdate,
}: InternationalTabProps) => {
  const getTypeConfig = (tipo: string) => {
    return EXPERIENCE_TYPES.find((t) => t.value === tipo) || EXPERIENCE_TYPES[4];
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-cm-blue rounded-full" />
          <h2 className="text-2xl font-bebas text-gray-900">Experiências Internacionais</h2>
        </div>
        {isEditing && (
          <Button onClick={onAdd} className="rounded-full bg-cm-blue hover:bg-cm-blue/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Experiência
          </Button>
        )}
      </div>

      {experiencias.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Globe className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhuma experiência internacional adicionada.</p>
          {isEditing && (
            <Button onClick={onAdd} variant="outline" className="mt-6 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeira experiência
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {experiencias.map((exp) => {
            const typeConfig = getTypeConfig(exp.tipo);
            return (
              <div 
                key={exp.id} 
                className="relative p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                {isEditing && (
                  <button
                    onClick={() => onRemove(exp.id)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Select
                        value={exp.tipo}
                        onValueChange={(v) => onUpdate(exp.id, "tipo", v as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de experiência" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="País"
                        value={exp.pais}
                        onChange={(e) => onUpdate(exp.id, "pais", e.target.value)}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        placeholder="Instituição"
                        value={exp.instituicao}
                        onChange={(e) => onUpdate(exp.id, "instituicao", e.target.value)}
                      />
                      <Input
                        placeholder="Programa (opcional)"
                        value={exp.programa || ""}
                        onChange={(e) => onUpdate(exp.id, "programa", e.target.value)}
                      />
                    </div>

                    <Input
                      placeholder="Orientador (opcional)"
                      value={exp.orientador || ""}
                      onChange={(e) => onUpdate(exp.id, "orientador", e.target.value)}
                    />

                    <div className="grid sm:grid-cols-3 gap-4">
                      <Input
                        type="number"
                        placeholder="Ano de início"
                        value={exp.anoInicio || ""}
                        onChange={(e) => onUpdate(exp.id, "anoInicio", parseInt(e.target.value) || new Date().getFullYear())}
                      />
                      <Input
                        type="number"
                        placeholder="Ano de término (opcional)"
                        value={exp.anoFim || ""}
                        onChange={(e) => onUpdate(exp.id, "anoFim", e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                      <Input
                        placeholder="Duração (ex: 6 meses)"
                        value={exp.duracao || ""}
                        onChange={(e) => onUpdate(exp.id, "duracao", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 -mt-2">
                      💡 Se não preencher o ano de término, será exibido "em andamento"
                    </p>

                    <Textarea
                      placeholder="Descrição da experiência..."
                      value={exp.descricao || ""}
                      onChange={(e) => onUpdate(exp.id, "descricao", e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {typeConfig.label}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {exp.instituicao}
                        </h3>
                        {exp.programa && (
                          <p className="text-sm text-cm-blue font-medium">{exp.programa}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cm-orange" />
                        {exp.pais}
                      </span>
                      {exp.orientador && (
                        <span className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-cm-blue" />
                          {exp.orientador}
                        </span>
                      )}
                      {exp.duracao && (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cm-purple" />
                          {exp.duracao}
                        </span>
                      )}
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cm-green" />
                        {exp.anoInicio} – {exp.anoFim || "em andamento"}
                      </span>
                    </div>

                    {exp.descricao && (
                      <p className="text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                        {exp.descricao}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
