import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Mail, Phone } from "lucide-react";
import { UserAvatar } from "@/features/profile/UserAvatar";

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
        <UserAvatar name={user.name} profileImage={user.profile_image} />

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
