import { UserPlus, UserCheck, Save, Edit3, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isFollowing: boolean;
  isPublishing?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onFollow: () => void;
  onPublishClick?: () => void;
}

export const ProfileActions = ({
  isOwnProfile,
  isEditing,
  isSaving,
  isFollowing,
  isPublishing = false,
  onEdit,
  onSave,
  onFollow,
  onPublishClick,
}: ProfileActionsProps) => {
  return (
    <>
    {/* Botão de editar */}
    {isOwnProfile && isEditing ? (
      <Button
        onClick={onSave}
        disabled={isSaving}
        size="sm"
        className="bg-cm-green text-white"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? "Salvando..." : "Salvar"}
      </Button>
    ) : (
      <>
        <Button
          onClick={onEdit}
          variant="primary"
          size="sm"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Editar perfil
        </Button>
        {isOwnProfile && onPublishClick && (
          <Button
            onClick={onPublishClick}
            variant="primary"
            size="sm"
            disabled={isPublishing}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            {isPublishing ? "Publicando..." : "Publicar perfil"}
          </Button>
        )}
      </>
    )}

    {/* Botão de seguir */}
    {!isOwnProfile ? (
    <Button
      onClick={onFollow}
      size="sm"
      variant={isFollowing ? "ghost" : "primary"}
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
    ) : null}
    </>
  );
};
