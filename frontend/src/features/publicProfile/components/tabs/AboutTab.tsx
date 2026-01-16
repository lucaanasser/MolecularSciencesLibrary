import { Quote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AboutTabProps {
  bio: string;
  isEditing: boolean;
  onBioChange: (value: string) => void;
}

export const AboutTab = ({ bio, isEditing, onBioChange }: AboutTabProps) => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-cm-purple rounded-full" />
          <h2 className="text-2xl font-bebas text-gray-900">Sobre mim</h2>
        </div>
        
        {isEditing ? (
          <Textarea
            placeholder="Conte sobre você, sua trajetória, interesses e objetivos..."
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            className="min-h-[300px] text-base leading-relaxed resize-none border-gray-200 focus:border-cm-purple focus:ring-cm-purple/20"
          />
        ) : bio ? (
          <div className="relative">
            <Quote className="absolute -left-2 -top-2 w-8 h-8 text-cm-purple/10" />
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap pl-6">
              {bio}
            </p>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Quote className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400 text-lg">Nenhuma descrição adicionada.</p>
            <p className="text-gray-400 text-sm mt-1">Clique em "Editar perfil" para adicionar sua bio.</p>
          </div>
        )}
      </div>
    </div>
  );
};
