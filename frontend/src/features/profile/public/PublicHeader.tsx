import { useState } from "react";
import { ProfileTag, SUGGESTED_TAGS } from "@/types/publicProfile";
import { AvatarSelectorModal } from "../../publicProfile/components/AvatarSelectorModal";
import { BannerSelectorModal } from "./components/BannerSelectorModal";
import { UserAvatar } from "@/features/profile/UserAvatar";
import { ContactLinks } from "./components/ContactButtons";
import { FollowingButtonPopover } from "./components/FollowingButtonPopover";
import { ContactEditor } from "./components/ContactEditor";
import { ProfileActions } from "./components/ProfileActions";
import { TagsSection } from "./components/TagsSection";

interface PublicHeaderProps {
  user: {
    name: any;
    profile_image?: any;
    class?: any;
  };
  isOwnProfile: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isFollowing: boolean;
  tags: ProfileTag[];
  seguindo: Array<{ id: number; nome: string; turma: string; avatar: string | null }>;
  emailPublico: string;
  linkedIn: string;
  lattes: string;
  github: string;
  site?: string;
  bannerChoice?: string;
  avatarTimestamp?: number;
  bannerTimestamp?: number;
  onEdit: () => void;
  onSave: () => void;
  onFollow: () => void;
  onAddTag: (label: string, category: ProfileTag["category"]) => void;
  onRemoveTag: (tagId: string) => void;
  onEmailChange: (value: string) => void;
  onLinkedInChange: (value: string) => void;
  onLattesChange: (value: string) => void;
  onGithubChange: (value: string) => void;
  onAvatarUpload?: (file: File) => Promise<void>;
  onDefaultAvatarSelect?: (imagePath: string) => Promise<void>;
  onBannerChange?: (bannerChoice: string) => Promise<void>;
}

const TAG_STYLES = {
  "grande-area": "bg-library-purple/10 text-library-purple border-library-purple/30",
  "area": "bg-cm-blue/10 text-cm-blue border-cm-blue/30",
  "subarea": "bg-cm-green/10 text-cm-green border-cm-green/30",
  "custom": "bg-cm-orange/10 text-cm-orange border-cm-orange/30",
};

export const PublicHeader = ({
  user,
  isOwnProfile,
  isEditing,
  isSaving,
  isFollowing,
  tags,
  seguindo,
  emailPublico,
  linkedIn,
  lattes,
  github,
  site,
  bannerChoice = "purple",
  avatarTimestamp,
  bannerTimestamp,
  onEdit,
  onSave,
  onFollow,
  onAddTag,
  onRemoveTag,
  onEmailChange,
  onLinkedInChange,
  onLattesChange,
  onGithubChange,
  onAvatarUpload,
  onDefaultAvatarSelect,
  onBannerChange,
}: PublicHeaderProps) => {
  const [showFollowing, setShowFollowing] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagCategory, setTagCategory] = useState<ProfileTag["category"]>("area");
  const [showBannerSelector, setShowBannerSelector] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  console.log('🔍 [ProfileHeader] bannerChoice recebido:', bannerChoice);
  console.log('🔍 [ProfileHeader] bannerTimestamp recebido:', bannerTimestamp);

  const handleSelectImage = async (imageFile: File) => {
    if (onAvatarUpload) {
      await onAvatarUpload(imageFile);
    }
  };

  const handleSelectDefault = async (imagePath: string) => {
    if (onDefaultAvatarSelect) {
      await onDefaultAvatarSelect(imagePath);
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim(), tagCategory);
      setNewTag("");
    }
  };

  const handleBannerSelect = async (bannerChoice: string) => {
    if (onBannerChange) {
      try {
        console.log('🎨 [ProfileHeader] Alterando banner para:', bannerChoice);
        await onBannerChange(bannerChoice);
        setShowBannerSelector(false);
        console.log('✅ [ProfileHeader] Banner alterado com sucesso');
      } catch (err) {
        console.error('❌ [ProfileHeader] Erro ao alterar banner:', err);
      }
    }
  };

  const BANNER_OPTIONS = [
    { name: "purple", label: "Roxo", image: "/images/background-images/purple_background.png" },
    { name: "blue", label: "Azul", image: "/images/background-images/blue_background.png" },
    { name: "green", label: "Verde", image: "/images/background-images/green_background.png" },
    { name: "red", label: "Vermelho", image: "/images/background-images/red_background.png" },
    { name: "orange", label: "Laranja", image: "/images/background-images/orange_background.png" },
    { name: "yellow", label: "Amarelo", image: "/images/background-images/yellow_background.png" },
  ];

  return (
    <div className="relative">
      
      {/* Banner */}
      <div className="h-48 sm:h-56 bg-default-bg relative overflow-hidden">
        <img
          src={`/images/background-images/${bannerChoice}_background.png?t=${bannerTimestamp || Date.now()}`}
          alt="Banner de perfil"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-32 left-0 right-0 bg-default-bg diagonal-section"/>
      </div>
      
      
      {/* Modal de edição do banner */}
      {isOwnProfile && (
        <BannerSelectorModal
          open={showBannerSelector}
          onOpenChange={setShowBannerSelector}
          bannerOptions={BANNER_OPTIONS}
          onSelect={handleBannerSelect}
        />
      )}

      {/* Conteúdo do perfil */}
      <div className="content-container -mt-28 -mb-20 relative z-10">
        
        {/* Seção de informações principais */}
        <div className="flex flex-row gap-6">
              
          {/* Avatar */}
          <UserAvatar
            name={user.name}
            profileImage={user.profile_image}
            avatarTimestamp={avatarTimestamp}
            sizeClass="w-32 h-32 sm:w-36 sm:h-36"
            fallbackClass="text-6xl sm:text-8xl"
            showEditButton={isOwnProfile}
            buttonSizeClass="w-10 h-10 p-1"
            onEditClick={handleAvatarClick}
          />

          {/* Modal de Seleção do Avatar */}
          <AvatarSelectorModal
            isOpen={showAvatarModal}
            onClose={() => setShowAvatarModal(false)}
            onSelectImage={handleSelectImage}
            onSelectDefault={handleSelectDefault}
            currentImage={user.profile_image}
          />
          
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 mt-0 sm:mt-8 items-center">  
              
              {/* Nome do usuário */}
              <h2 className="mb-0">{user.name}</h2>

              {/* Ações de seguir, editar, salvar */}
              <ProfileActions
                isOwnProfile={isOwnProfile}
                isEditing={isEditing}
                isSaving={isSaving}
                isFollowing={isFollowing}
                onEdit={onEdit}
                onSave={onSave}
                onFollow={onFollow}
              />
            </div>

            {/* Links de contato + popover de seguidores */}
            <div className="flex items-center gap-2">
              <ContactLinks
                emailPublico={emailPublico}
                linkedIn={linkedIn}
                lattes={lattes}
                github={github}
              >
                {isOwnProfile && seguindo.length > 0 && (
                  <FollowingButtonPopover
                    seguindo={seguindo}
                    open={showFollowing}
                    onOpenChange={setShowFollowing}
                  />
                )}
              </ContactLinks>

            </div>
          </div>
        </div>

        {/* Seção de tags */}
        <TagsSection
          tags={tags}
          isEditing={isEditing}
          onRemoveTag={onRemoveTag}
          onAddTag={onAddTag}
          suggestedTags={SUGGESTED_TAGS}
        />

        {/* Seção de edição de contatos */}
        <ContactEditor
          emailPublico={emailPublico}
          linkedIn={linkedIn}
          lattes={lattes}
          github={github}
          isEditing={isEditing}
          onEmailChange={onEmailChange}
          onLinkedInChange={onLinkedInChange}
          onLattesChange={onLattesChange}
          onGithubChange={onGithubChange}
        />
        
      </div>
    </div>

  );
};