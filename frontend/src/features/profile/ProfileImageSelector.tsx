import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { IMAGE_PATHS } from "@/constants/users";


export interface ProfileImageSelectorProps {
  show: boolean;
  onClose: () => void;
  onSelect: (img: string) => void;
}
export function ProfileImageSelector({ show, onClose, onSelect }: ProfileImageSelectorProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h4>Escolha sua foto</h4>
          <Button 
            variant="ghost"
            onClick={onClose}
            size="icon"
          >
            <X className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {IMAGE_PATHS.map((img) => (
            <button
              key={img}
              className={`aspect-square rounded-xl overflow-hidden transition-all hover:ring-4 hover:ring-gray-200 hover:scale-105 `}
              onClick={() => onSelect(img)}
            >
              <img 
                src={img} 
                alt="Opção de avatar" 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        <Button 
          variant="wide"
          className="bg-gray-400 mt-6"
          onClick={onClose}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
