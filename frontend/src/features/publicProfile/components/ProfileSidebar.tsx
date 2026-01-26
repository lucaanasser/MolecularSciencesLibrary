import { useState } from "react";
import { ProfileTag } from "@/types/publicProfile";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileActions } from "./ProfileActions";
import { TagSection } from "./TagSection";
import { FollowingList } from "./FollowingList";
import { ContactSection } from "./ContactSection";

interface ProfileSidebarProps {
  user: {
    name: string;
    profile_image?: string;
    class?: string;
  };
  isOwnProfile: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isFollowing: boolean;
  isPublic: boolean;
  tags: ProfileTag[];
  seguindo: Array<{ id: number; nome: string; turma: string; avatar: string | null }>;
  emailPublico: string;
  linkedIn: string;
  lattes: string;
  onEdit: () => void;
  onSave: () => void;
  onFollow: () => void;
  onPublicToggle: (value: boolean) => void;
  onAddTag: (label: string, category: ProfileTag["category"]) => void;
  onRemoveTag: (tagId: string) => void;
  onEmailChange: (value: string) => void;
  onLinkedInChange: (value: string) => void;
  onLattesChange: (value: string) => void;
}

export const ProfileSidebar = ({
  user,
  isOwnProfile,
  isEditing,
  isSaving,
  isFollowing,
  isPublic,
  tags,
  seguindo,
  emailPublico,
  linkedIn,
  lattes,
  onEdit,
  onSave,
  onFollow,
  onPublicToggle,
  onAddTag,
  onRemoveTag,
  onEmailChange,
  onLinkedInChange,
  onLattesChange,
}: ProfileSidebarProps) => {
  const [newTag, setNewTag] = useState("");
  const [activeCategory, setActiveCategory] = useState<"grande-area" | "area" | "subarea" | null>(null);

  const handleAddTag = () => {
    if (newTag.trim() && activeCategory) {
      onAddTag(newTag.trim(), activeCategory);
      setNewTag("");
    }
  };

  const handleSetCategory = (category: "grande-area" | "area" | "subarea") => {
    setActiveCategory(category);
    setNewTag("");
  };

  return (
    <aside className="w-80 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
        <ProfileAvatar
          name={user.name}
          profileImage={user.profile_image}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
        />

        <ProfileActions
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          isSaving={isSaving}
          isFollowing={isFollowing}
          isPublic={isPublic}
          onEdit={onEdit}
          onSave={onSave}
          onFollow={onFollow}
          onPublicToggle={onPublicToggle}
        />

        <TagSection
          category="grande-area"
          title="Grande Área"
          tags={tags}
          isEditing={isEditing}
          newTag={newTag}
          activeCategory={activeCategory}
          onAddClick={() => handleSetCategory("grande-area")}
          onRemoveTag={onRemoveTag}
          onNewTagChange={setNewTag}
          onAddTag={handleAddTag}
          onAddSuggestedTag={onAddTag}
        />

        <TagSection
          category="area"
          title="Área"
          tags={tags}
          isEditing={isEditing}
          newTag={newTag}
          activeCategory={activeCategory}
          onAddClick={() => handleSetCategory("area")}
          onRemoveTag={onRemoveTag}
          onNewTagChange={setNewTag}
          onAddTag={handleAddTag}
          onAddSuggestedTag={onAddTag}
        />

        <TagSection
          category="subarea"
          title="Subárea"
          tags={tags}
          isEditing={isEditing}
          newTag={newTag}
          activeCategory={activeCategory}
          onAddClick={() => handleSetCategory("subarea")}
          onRemoveTag={onRemoveTag}
          onNewTagChange={setNewTag}
          onAddTag={handleAddTag}
          onAddSuggestedTag={onAddTag}
        />

        <FollowingList seguindo={seguindo} isOwnProfile={isOwnProfile} />

        <ContactSection
          emailPublico={emailPublico}
          linkedIn={linkedIn}
          lattes={lattes}
          isEditing={isEditing}
          onEmailChange={onEmailChange}
          onLinkedInChange={onLinkedInChange}
          onLattesChange={onLattesChange}
        />
      </div>
    </aside>
  );
};
