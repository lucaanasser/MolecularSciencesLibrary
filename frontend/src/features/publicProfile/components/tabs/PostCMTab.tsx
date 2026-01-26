import { GraduationCap, Briefcase, Building2, MapPin, Calendar, Plus, Trash2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PostCMInfo } from "@/types/publicProfile";

interface PostCMTabProps {
  posCM: PostCMInfo[];
  isEditing: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof PostCMInfo, value: any) => void;
}

export const PostCMTab = ({ posCM, isEditing, onAdd, onRemove, onUpdate }: PostCMTabProps) => {
  // Opções de tipo
  const POST_CM_TYPES = [
    { value: "trabalho", label: "Trabalho" },
    { value: "pos-graduacao", label: "Pós-graduação" },
    { value: "nova-graduacao", label: "Nova graduação" },
    { value: "retorno-curso-origem", label: "Retorno ao curso de origem" },
    { value: "outro", label: "Outro" },
  ];

  // Funções para tags de área - mantidas por enquanto mas precisarão de backend integration
  const addAreaTag = (idx: number, label: string) => {
    const entry = posCM[idx];
    const tag: any = { id: `${Date.now()}`, label, category: "area" };
    const updatedAreas = [...(entry.areas || []), tag];
    onUpdate(entry.id!, "areas" as any, updatedAreas);
  };
  
  const removeAreaTag = (idx: number, tagId: string) => {
    const entry = posCM[idx];
    const updatedAreas = (entry.areas || []).filter((t) => t.id !== tagId);
    onUpdate(entry.id!, "areas" as any, updatedAreas);
  };

  const handleUpdate = (idx: number, updates: Partial<PostCMInfo>) => {
    const entry = posCM[idx];
    Object.entries(updates).forEach(([field, value]) => {
      onUpdate(entry.id!, field as keyof PostCMInfo, value);
    });
  };

  const handleRemove = (idx: number) => {
    const entry = posCM[idx];
    onRemove(entry.id!);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-cm-orange rounded-full" />
        <h2 className="text-2xl font-bebas text-gray-900">Pós-CM</h2>
        {isEditing && (
          <button onClick={onAdd} className="ml-4 flex items-center gap-2 px-3 py-1 rounded-full bg-cm-orange/80 text-white hover:bg-cm-orange">
            <Plus className="w-4 h-4" /> Adicionar Pós-CM
          </button>
        )}
      </div>

      {posCM.length === 0 && !isEditing && (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhuma informação pós-CM adicionada.</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Editar perfil" para adicionar.</p>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6 max-w-2xl">
          {posCM.map((item, idx) => (
            <div key={item.id} className="p-4 mb-6 rounded-xl border border-cm-orange/30 bg-cm-orange/5 relative">
              <button onClick={() => handleRemove(idx)} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Situação atual</Label>
                  <Select
                    value={item.tipo || ""}
                    onValueChange={(v) => handleUpdate(idx, { tipo: v as PostCMInfo["tipo"] })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_CM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Ano de início</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 2026"
                    value={item.anoInicio || ""}
                    onChange={(e) => handleUpdate(idx, { anoInicio: parseInt(e.target.value) || undefined })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Ano de fim (opcional)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 2028"
                    value={item.anoFim || ""}
                    onChange={(e) => handleUpdate(idx, { anoFim: parseInt(e.target.value) || undefined })}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se não preencher, será exibido "em andamento"</p>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm text-gray-600">Instituição ou Empresa</Label>
                <Input
                  placeholder="Ex: Instituto de Matemática e Estatística - USP"
                  value={item.instituicao || ""}
                  onChange={(e) => handleUpdate(idx, { instituicao: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="mt-4">
                <Label className="text-sm text-gray-600">Cargo ou Programa</Label>
                <Input
                  placeholder="Ex: Mestrado em Ciência da Computação"
                  value={item.cargo || ""}
                  onChange={(e) => handleUpdate(idx, { cargo: e.target.value })}
                  className="mt-2"
                />
              </div>
              {item.tipo === "pos-graduacao" && (
                <div className="mt-4">
                  <Label className="text-sm text-gray-600">Orientador (opcional)</Label>
                  <Input
                    placeholder="Nome do orientador"
                    value={item.orientador || ""}
                    onChange={(e) => handleUpdate(idx, { orientador: e.target.value })}
                    className="mt-2"
                  />
                </div>
              )}
              <div className="mt-4">
                <Label className="text-sm text-gray-600">Áreas de atuação (tags)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(item.areas || []).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="gap-2">
                      {tag.label}
                      <button onClick={() => removeAreaTag(idx, tag.id)} className="hover:text-red-600 ml-1">
                        <Tag className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Adicionar nova área..."
                  value={""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      addAreaTag(idx, e.currentTarget.value.trim());
                      e.currentTarget.value = "";
                    }
                  }}
                  className="mt-2"
                />
              </div>
              <div className="mt-4">
                <Label className="text-sm text-gray-600">Link para GitHub (opcional)</Label>
                <Input
                  placeholder="https://github.com/seuusuario"
                  value={item.github || ""}
                  onChange={(e) => handleUpdate(idx, { github: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="mt-4">
                <Label className="text-sm text-gray-600">Descrição</Label>
                <Textarea
                  placeholder="Conte mais sobre sua trajetória pós-CM..."
                  value={item.descricao || ""}
                  onChange={(e) => handleUpdate(idx, { descricao: e.target.value })}
                  className="mt-2 min-h-[100px] resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {posCM.map((item) => (
            <div key={item.id} className="p-8 rounded-2xl bg-cm-orange/5 border border-cm-orange/20 mb-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-cm-orange/10 flex items-center justify-center flex-shrink-0">
                  {item.tipo === "pos-graduacao" ? (
                    <GraduationCap className="w-8 h-8 text-cm-orange" />
                  ) : (
                    <Briefcase className="w-8 h-8 text-cm-orange" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-semibold text-gray-900">{item.cargo}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cm-orange" />
                      {item.instituicao}
                    </span>
                    {item.anoInicio && (
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cm-orange" />
                        {item.anoInicio} – {item.anoFim || "em andamento"}
                      </span>
                    )}
                  </div>
                  {item.orientador && item.tipo === "pos-graduacao" && (
                    <div className="mt-2 text-sm text-cm-orange">
                      <span className="font-medium">Orientador:</span> {item.orientador}
                    </div>
                  )}
                  {(item.areas && item.areas.length > 0) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.areas.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.github && (
                    <div className="mt-4">
                      <a href={item.github} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 bg-gray-100 text-cm-orange rounded-full text-sm font-medium hover:underline">
                        GitHub
                      </a>
                    </div>
                  )}
                  {item.descricao && (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mt-6 pt-6 border-t border-cm-orange/10">
                      {item.descricao}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
