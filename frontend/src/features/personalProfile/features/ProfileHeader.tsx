import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, X, Mail, Phone } from "lucide-react";

const PROFILE_IMAGES = [
  ...["bio", "cmp", "fis", "mat", "qui", "def"].map(img => `/images/avatars/${img}.png`)
];

export interface ProfileHeaderProps {
  user: any;
  onShowImageSelector: () => void;
}
export function ProfileHeader({ user, onShowImageSelector }: ProfileHeaderProps) {
  return (
    <div className="mt-8 mb-8">
      
      {/* Aba colorida acima do card */}
      <div className="flex mb-[-12px] z-10 relative">
        <div className="h-3 w-1/5 rounded-tl-2xl bg-cm-red" />
        <div className="h-3 w-1/5 bg-cm-orange" />
        <div className="h-3 w-1/5 bg-cm-yellow" />
        <div className="h-3 w-1/5 bg-cm-green" />
        <div className="h-3 w-1/5 rounded-tr-2xl bg-cm-blue" />
      </div>
      
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-gray-100">
        
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-20 sm:w-24 h-auto ring-4 ring-gray-200">
            {user.profile_image ? (
              <AvatarImage 
                src={user.profile_image.includes('/images/user-images/') 
                  ? `${user.profile_image}?t=${Date.now()}` 
                  : user.profile_image} 
                alt="Foto de perfil" 
              />
            ) : null}
            <AvatarFallback className="bg-library-purple text-white text-2xl sm:text-3xl font-bebas">
              {user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <Button
            onClick={onShowImageSelector}
            variant="primary"
            size="icon"
            className="absolute -bottom-4 -right-4"
            title="Alterar foto"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        {/* Nome, turma e NUSP */}
        <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-center sm:text-left">
            <h3>{user.name}</h3>
            <p className="prose-sm mt-1 mb-0 flex flex-row gap-4 justify-center sm:justify-start">
              {user.class && <span>Turma {user.class}</span>}
              {user.NUSP !== undefined && <span>NUSP {user.NUSP}</span>}
            </p>
          </div>

          {/* Contato - canto direito em telas grandes */}
          <div className="hidden sm:flex flex-col text-gray-500 min-w-[140px] pl-0">
            <div className="mb-1">
              <span className="font-bold text-gray-700">Email</span>
            </div>
            <span className="flex items-center gap-1 mb-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </span>
            {user.phone && (
              <>
                <div className="mb-1">
                  <span className="font-bold text-gray-700">Telefone</span>
                </div>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {user.phone}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ProfileImageSelectorProps {
  show: boolean;
  onClose: () => void;
  onSelect: (img: string) => void;
  selectedImage: string | null;
}
export function ProfileImageSelector({ show, onClose, onSelect, selectedImage }: ProfileImageSelectorProps) {
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
          {PROFILE_IMAGES.map((img) => (
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
