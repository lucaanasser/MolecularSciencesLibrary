import { Plus, Trash2, Award, Calendar, Clock, Building2, Users, Tag, X } from "lucide-react";
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
import { AdvancedCycleInfo, ProfileTag, SUGGESTED_TAGS } from "@/types/publicProfile";
import { GraduationCap } from "lucide-react";
import { useState } from "react";

interface AdvancedCyclesTabProps {
  ciclosAvancados: (AdvancedCycleInfo & { cor?: string })[];
  isEditing: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof AdvancedCycleInfo | "cor", value: any) => void;
}

const CYCLE_COLORS = [
  { bg: "bg-gradient-to-br from-purple-50 to-purple-100", border: "border-purple-500", accent: "text-purple-600", badge: "bg-purple-500" },
  { bg: "bg-gradient-to-br from-blue-50 to-blue-100", border: "border-blue-500", accent: "text-blue-600", badge: "bg-blue-500" },
  { bg: "bg-gradient-to-br from-green-50 to-green-100", border: "border-green-500", accent: "text-green-600", badge: "bg-green-500" },
  { bg: "bg-gradient-to-br from-orange-50 to-orange-100", border: "border-orange-500", accent: "text-orange-600", badge: "bg-orange-500" },
];

export const AdvancedCyclesTab = ({
  ciclosAvancados,
  isEditing,
  onAdd,
  onRemove,
  onUpdate,
}: AdvancedCyclesTabProps) => {
  const [tagInputs, setTagInputs] = useState<Record<string, { area: string; subarea: string }>>({});

  const addTag = (avId: string, label: string, category: "area" | "subarea") => {
    const av = ciclosAvancados.find((a) => a.id === avId);
    if (!av) return;

    const tags = av.tags || [];
    const areaTags = tags.filter((t) => t.category === "area");
    const subareaTags = tags.filter((t) => t.category === "subarea");

    // Limites: 2 áreas, 3 subáreas
    if (category === "area" && areaTags.length >= 2) {
      alert("Máximo de 2 tags de área");
      return;
    }
    if (category === "subarea" && subareaTags.length >= 3) {
      alert("Máximo de 3 tags de subárea");
      return;
    }

    const newTag: ProfileTag = {
      id: `${avId}-${Date.now()}`,
      label,
      category,
    };

    onUpdate(avId, "tags", [...tags, newTag]);
    setTagInputs({ ...tagInputs, [avId]: { ...tagInputs[avId], [category]: "" } });
  };

  const removeTag = (avId: string, tagId: string) => {
    const av = ciclosAvancados.find((a) => a.id === avId);
    if (!av) return;
    const tags = (av.tags || []).filter((t) => t.id !== tagId);
    onUpdate(avId, "tags", tags);
  };

  const addCoorientador = (avId: string, nome: string) => {
    const av = ciclosAvancados.find((a) => a.id === avId);
    if (!av) return;
    const coorientadores = av.coorientadores || [];
    onUpdate(avId, "coorientadores", [...coorientadores, nome]);
  };

  const removeCoorientador = (avId: string, index: number) => {
    const av = ciclosAvancados.find((a) => a.id === avId);
    if (!av) return;
    const coorientadores = [...(av.coorientadores || [])];
    coorientadores.splice(index, 1);
    onUpdate(avId, "coorientadores", coorientadores);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-cm-blue rounded-full" />
          <h2 className="text-2xl font-bebas text-gray-900">Ciclos Avançados</h2>
        </div>
        {isEditing && (
          <Button onClick={onAdd} className="rounded-full bg-cm-blue hover:bg-cm-blue/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Avançado
          </Button>
        )}
      </div>

      {ciclosAvancados.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhum ciclo avançado adicionado.</p>
          {isEditing && (
            <Button onClick={onAdd} variant="outline" className="mt-6 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeiro avançado
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {ciclosAvancados.map((av, idx) => {
            const colorScheme = CYCLE_COLORS[idx % CYCLE_COLORS.length];
            const tags = av.tags || [];
            const areaTags = tags.filter((t) => t.category === "area");
            const subareaTags = tags.filter((t) => t.category === "subarea");
            
            return (
              <div 
                key={av.id} 
                className={`relative ${colorScheme.bg} rounded-2xl border-2 ${colorScheme.border} shadow-lg overflow-hidden`}
              >
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b-2 border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className={`w-6 h-6 ${colorScheme.accent}`} />
                    <Badge className={`${colorScheme.badge} text-white`}>Avançado {idx + 1}</Badge>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => onRemove(av.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-5">
                      <Input
                        placeholder="Tema do avançado"
                        value={av.tema}
                        onChange={(e) => onUpdate(av.id, "tema", e.target.value)}
                        className="text-lg font-medium bg-white"
                      />
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          placeholder="Nome do orientador"
                          value={av.orientador}
                          onChange={(e) => onUpdate(av.id, "orientador", e.target.value)}
                          className="bg-white"
                        />
                        <Input
                          placeholder="Instituto/Unidade (ex: IF, IQ, IME)"
                          value={av.instituto || ""}
                          onChange={(e) => onUpdate(av.id, "instituto", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <Input
                        placeholder="Universidade (opcional)"
                        value={av.universidade || ""}
                        onChange={(e) => onUpdate(av.id, "universidade", e.target.value)}
                        className="bg-white"
                      />

                      {/* Coorientadores */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Coorientadores (opcional)</label>
                        {(av.coorientadores || []).map((co, coIdx) => (
                          <div key={coIdx} className="flex gap-2">
                            <Input
                              value={co}
                              onChange={(e) => {
                                const newCo = [...(av.coorientadores || [])];
                                newCo[coIdx] = e.target.value;
                                onUpdate(av.id, "coorientadores", newCo);
                              }}
                              className="bg-white"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCoorientador(av.id, coIdx)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addCoorientador(av.id, "")}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar coorientador
                        </Button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          type="number"
                          placeholder="Número de semestres"
                          value={av.semestres}
                          onChange={(e) => onUpdate(av.id, "semestres", parseInt(e.target.value) || 4)}
                          className="bg-white"
                        />
                        <Input
                          type="number"
                          placeholder="Ano de início"
                          value={av.anoInicio || ""}
                          onChange={(e) => onUpdate(av.id, "anoInicio", parseInt(e.target.value) || undefined)}
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <Input
                          type="number"
                          placeholder="Ano de conclusão (opcional)"
                          value={av.anoConclusao || ""}
                          onChange={(e) => onUpdate(av.id, "anoConclusao", parseInt(e.target.value) || undefined)}
                          className="bg-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Se não preencher o ano de conclusão, será exibido "em andamento"
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                          Tags de Área ({areaTags.length}/2)
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {areaTags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="gap-2">
                              {tag.label}
                              <button
                                onClick={() => removeTag(av.id, tag.id)}
                                className="hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        {areaTags.length < 2 && (
                          <div className="flex gap-2">
                            <Select
                              value={tagInputs[av.id]?.area || ""}
                              onValueChange={(v) => {
                                if (v) addTag(av.id, v, "area");
                              }}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecione uma área" />
                              </SelectTrigger>
                              <SelectContent>
                                {SUGGESTED_TAGS.area.map((area) => (
                                  <SelectItem key={area} value={area}>
                                    {area}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <label className="text-sm font-medium text-gray-700 block mt-4">
                          Tags de Subárea ({subareaTags.length}/3)
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {subareaTags.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="gap-2">
                              {tag.label}
                              <button
                                onClick={() => removeTag(av.id, tag.id)}
                                className="hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        {subareaTags.length < 3 && (
                          <div className="flex gap-2">
                            <Select
                              value={tagInputs[av.id]?.subarea || ""}
                              onValueChange={(v) => {
                                if (v) addTag(av.id, v, "subarea");
                              }}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecione uma subárea" />
                              </SelectTrigger>
                              <SelectContent>
                                {SUGGESTED_TAGS.subarea.map((subarea) => (
                                  <SelectItem key={subarea} value={subarea}>
                                    {subarea}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <Textarea
                        placeholder="Descreva o projeto, metodologia, resultados..."
                        value={av.descricao}
                        onChange={(e) => onUpdate(av.id, "descricao", e.target.value)}
                        className="min-h-[120px] resize-none bg-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900">{av.tema || "Sem título"}</h3>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        {av.orientador && (
                          <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                            <Award className="w-5 h-5 text-cm-purple mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500">Orientador</p>
                              <p className="text-sm font-semibold text-gray-900">{av.orientador}</p>
                            </div>
                          </div>
                        )}
                        {av.instituto && (
                          <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                            <Building2 className="w-5 h-5 text-cm-blue mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500">Instituto</p>
                              <p className="text-sm font-semibold text-gray-900">{av.instituto}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {av.universidade && (
                        <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                          <Building2 className="w-5 h-5 text-cm-green mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Universidade</p>
                            <p className="text-sm font-semibold text-gray-900">{av.universidade}</p>
                          </div>
                        </div>
                      )}

                      {av.coorientadores && av.coorientadores.length > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                          <Users className="w-5 h-5 text-cm-green mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 mb-1">Coorientadores</p>
                            <div className="flex flex-wrap gap-2">
                              {av.coorientadores.map((co, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {co}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm">
                        {av.semestres && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full">
                            <Clock className="w-4 h-4 text-cm-blue" />
                            {av.semestres} semestres
                          </span>
                        )}
                        {(av.anoInicio || av.anoConclusao) && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full">
                            <Calendar className="w-4 h-4 text-cm-green" />
                            {av.anoInicio || "?"} – {av.anoConclusao || "em andamento"}
                          </span>
                        )}
                      </div>

                      {tags.length > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                          <Tag className="w-5 h-5 text-cm-orange mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                              {areaTags.map((tag) => (
                                <Badge key={tag.id} variant="secondary">
                                  {tag.label}
                                </Badge>
                              ))}
                              {subareaTags.map((tag) => (
                                <Badge key={tag.id} variant="outline">
                                  {tag.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {av.descricao && (
                        <div className="p-4 bg-white/70 rounded-lg">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {av.descricao}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
