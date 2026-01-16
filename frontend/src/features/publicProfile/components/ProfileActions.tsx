import { UserPlus, UserCheck, Save, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isFollowing: boolean;
  isPublic: boolean;
  onEdit: () => void;
  onSave: () => void;
  onFollow: () => void;
  onPublicToggle: (value: boolean) => void;
}

export const ProfileActions = ({
  isOwnProfile,
  isEditing,
  isSaving,
  isFollowing,
  isPublic,
  onEdit,
  onSave,
  onFollow,
  onPublicToggle,
}: ProfileActionsProps) => {
  return (
    <div className="space-y-2">
      {!isOwnProfile ? (
        <Button
          onClick={onFollow}
          className={cn(
            "w-full",
            isFollowing
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-cm-purple text-white hover:bg-cm-purple/90"
          )}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              Seguindo
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Seguir
            </>
          )}
        </Button>
      ) : (
        <>
          {isEditing ? (
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full bg-cm-green text-white hover:bg-cm-green/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          ) : (
            <Button
              onClick={onEdit}
              className="w-full bg-cm-purple text-white hover:bg-cm-purple/90"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Editar perfil
            </Button>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-2">
            <Switch id="public" checked={isPublic} onCheckedChange={onPublicToggle} />
            <Label htmlFor="public" className="cursor-pointer">Perfil público</Label>
          </div>
        </>
      )}
    </div>
  );
};
