import { GraduationCap, Briefcase, Building2, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostCMInfo, POST_CM_TYPES } from "@/types/publicProfile";

interface PostCMTabProps {
  posCM: Partial<PostCMInfo>;
  isEditing: boolean;
  onUpdate: (updates: Partial<PostCMInfo>) => void;
}

export const PostCMTab = ({ posCM, isEditing, onUpdate }: PostCMTabProps) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-cm-orange rounded-full" />
        <h2 className="text-2xl font-bebas text-gray-900">Pós-CM</h2>
      </div>

      {isEditing ? (
        <div className="space-y-6 max-w-2xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Situação atual</Label>
              <Select
                value={posCM.tipo || ""}
                onValueChange={(v) => onUpdate({ ...posCM, tipo: v as PostCMInfo["tipo"] })}
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
              <Label className="text-sm text-gray-600">Desde quando?</Label>
              <Input
                type="number"
                placeholder="Ex: 2026"
                value={posCM.anoInicio || ""}
                onChange={(e) => onUpdate({ ...posCM, anoInicio: parseInt(e.target.value) || undefined })}
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Instituição ou Empresa</Label>
            <Input
              placeholder="Ex: Instituto de Matemática e Estatística - USP"
              value={posCM.instituicao || ""}
              onChange={(e) => onUpdate({ ...posCM, instituicao: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-sm text-gray-600">Cargo ou Programa</Label>
            <Input
              placeholder="Ex: Mestrado em Ciência da Computação"
              value={posCM.cargo || ""}
              onChange={(e) => onUpdate({ ...posCM, cargo: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-sm text-gray-600">Área de atuação</Label>
            <Input
              placeholder="Ex: Inteligência Artificial aplicada à Biologia"
              value={posCM.area || ""}
              onChange={(e) => onUpdate({ ...posCM, area: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-sm text-gray-600">Descrição</Label>
            <Textarea
              placeholder="Conte mais sobre sua trajetória pós-CM..."
              value={posCM.descricao || ""}
              onChange={(e) => onUpdate({ ...posCM, descricao: e.target.value })}
              className="mt-2 min-h-[150px] resize-none"
            />
          </div>
        </div>
      ) : posCM.instituicao ? (
        <div className="max-w-3xl">
          <div className="p-8 rounded-2xl bg-cm-orange/5 border border-cm-orange/20">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-cm-orange/10 flex items-center justify-center flex-shrink-0">
                {posCM.tipo === "pos-graduacao" ? (
                  <GraduationCap className="w-8 h-8 text-cm-orange" />
                ) : (
                  <Briefcase className="w-8 h-8 text-cm-orange" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-semibold text-gray-900">{posCM.cargo}</h3>
                
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cm-orange" />
                    {posCM.instituicao}
                  </span>
                  {posCM.anoInicio && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cm-orange" />
                      Desde {posCM.anoInicio}
                    </span>
                  )}
                </div>

                {posCM.area && (
                  <div className="mt-4 inline-block px-3 py-1 bg-cm-orange/10 text-cm-orange rounded-full text-sm font-medium">
                    {posCM.area}
                  </div>
                )}

                {posCM.descricao && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mt-6 pt-6 border-t border-cm-orange/10">
                    {posCM.descricao}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhuma informação pós-CM adicionada.</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Editar perfil" para adicionar.</p>
        </div>
      )}
    </div>
  );
};
