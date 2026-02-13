import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import { useParams } from "react-router-dom";
import { GraduationCap, Briefcase, BookMarked, Globe } from "lucide-react";
import ProfileService from "@/services/ProfileService";
import { UsersService } from "@/services/UsersService";
import { usePublicProfile } from "@/features/publicProfile/hooks/usePublicProfile";
import { useProfileEdit } from "@/features/publicProfile/hooks/useProfileEdit";
import { PublicHeader } from "@/features/profile/public/PublicHeader";
import { TabId } from "@/features/publicProfile/components/ProfileTabs";
import { PublicStats } from "@/features/profile/public/PublicStats";
import { PublicTabsCard } from "@/features/profile/public/PublicTabsCard";

logger.info("🔵 [PublicProfilePage] Renderizando página pessoal pública");

const PublicProfilePage = () => {
  const { userId: userIdParam } = useParams();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setUserLoading(true);
    setUserError(null);
    UsersService.getProfile()
      .then((data) => {
        if (isMounted) setUser(data);
      })
      .catch((err) => {
        if (isMounted) setUserError(err.message || "Erro ao buscar perfil");
      })
      .finally(() => {
        if (isMounted) setUserLoading(false);
      });
    return () => { isMounted = false; };
  }, []);
  const { isEditing, isSaving, startEditing, saveChanges } = useProfileEdit();
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const [bannerTimestamp, setBannerTimestamp] = useState(Date.now());
  
  // Determine which user ID to use (from URL param or current user)
  const userId = userIdParam ? parseInt(userIdParam) : user?.id || 0;
  const profile = usePublicProfile(userId);

  // Update avatar timestamp when profile_image changes
  useEffect(() => {
    if (user?.profile_image) {
      setAvatarTimestamp(Date.now());
    }
  }, [user?.profile_image]);

  useEffect(() => {
    logger.info('🔵 [PublicProfilePage] Profile atualizado:', {
      ciclosAvancados: profile.ciclosAvancados.length,
      disciplinas: profile.disciplinas.length,
      experiencias: profile.experienciasInternacionais.length,
      posCM: profile.posCM.length
    });
  }, [profile.ciclosAvancados, profile.disciplinas, profile.experienciasInternacionais, profile.posCM]);

  const isOwnProfile = !userIdParam || (user && userIdParam === String(user.id));

  // Create user object from profile data for display
  const displayUser = {
    name: profile.nome || user?.name || "Usuário",
    profile_image: profile.profileImage || user?.profile_image,
    class: profile.turma || user?.class
  };

  const handleSave = () => {
    saveChanges(profile.saveProfile);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await ProfileService.uploadAvatar(userId, file);
      await profile.refetch(); // Reload profile to get new avatar path
      setAvatarTimestamp(Date.now()); // Force avatar refresh
    } catch (err) {
      logger.error('Erro ao fazer upload de avatar:', err);
      alert('Erro ao fazer upload de avatar');
    }
  };

  const handleDefaultAvatarSelect = async (imagePath: string) => {
    try {
      await ProfileService.selectDefaultAvatar(userId, imagePath);
      await profile.refetch(); // Reload profile to get new avatar
      setAvatarTimestamp(Date.now()); // Force avatar refresh
    } catch (err) {
      logger.error('Erro ao selecionar avatar padrão:', err);
      alert('Erro ao selecionar avatar padrão');
    }
  };

  const handleBannerChange = async (bannerChoice: string) => {
    try {
      logger.info('🎨 [PublicProfilePage] Atualizando banner para:', bannerChoice);
      await ProfileService.updateBanner(userId, bannerChoice);
      logger.info('✅ [PublicProfilePage] Banner atualizado no backend');
      await profile.refetch(); // Reload to get new banner
      logger.info('✅ [PublicProfilePage] Profile refetchado');
      const newTimestamp = Date.now();
      setBannerTimestamp(newTimestamp); // Force banner refresh
      logger.info('✅ [PublicProfilePage] Timestamp atualizado:', newTimestamp);
    } catch (err) {
      logger.error('❌ [PublicProfilePage] Erro ao atualizar banner:', err);
      alert('Erro ao atualizar banner');
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (profile.isFollowing) {
        await ProfileService.unfollowUser(userId);
        profile.setIsFollowing(false);
      } else {
        await ProfileService.followUser(userId);
        profile.setIsFollowing(true);
      }
      await profile.refetch(); // Reload to update counts
    } catch (err) {
      logger.error('Erro ao atualizar follow:', err);
      alert(err instanceof Error ? err.message : 'Erro ao atualizar follow');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-default-bg">
        
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500">Carregando...</div>
        </div>
        
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-default-bg">
        
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-600">{userError || "Usuário não encontrado"}</div>
        </div>
        
      </div>
    );
  }

  const activeTab = "avançado";
  return (
    <div className="min-h-screen flex flex-col bg-default-bg">
      <div className="flex-grow">

        {/* Header */}
        <PublicHeader
          user={displayUser}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          isSaving={isSaving}
          isFollowing={profile.isFollowing}
          tags={profile.tags}
          seguindo={profile.seguindo}
          emailPublico={profile.emailPublico}
          linkedIn={profile.linkedIn}
          lattes={profile.lattes}
          github={profile.github}
          site={profile.site}
          bannerChoice={profile.bannerChoice}
          avatarTimestamp={avatarTimestamp}
          bannerTimestamp={bannerTimestamp}
          onEdit={startEditing}
          onSave={handleSave}
          onFollow={handleFollowToggle}
          onAddTag={profile.addTag}
          onRemoveTag={profile.removeTag}
          onEmailChange={profile.setEmailPublico}
          onLinkedInChange={profile.setLinkedIn}
          onLattesChange={profile.setLattes}
          onGithubChange={profile.setGithub}
          onAvatarUpload={handleAvatarUpload}
          onDefaultAvatarSelect={handleDefaultAvatarSelect}
          onBannerChange={handleBannerChange}
        />

        <div className="content-container mt-0 flex flex-col lg:flex-row gap-6">
          <PublicStats
            userStats={{
              turma: profile.turma || "N/A",
              cursoOrigem: profile.stats.cursoOrigem || "N/A",
              areaInteresse: profile.stats.areaInteresse || "N/A"
            }}
          />
          <PublicTabsCard
            user={user}
            profile={profile}
            isEditing={isEditing}
            initialTabId={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;