import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { GraduationCap, Briefcase, BookMarked, Globe } from "lucide-react";
import ProfileService from "@/services/ProfileService";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";
import { usePublicProfile } from "@/features/publicProfile/hooks/usePublicProfile";
import { useProfileEdit } from "@/features/publicProfile/hooks/useProfileEdit";
import { ProfileHeader } from "@/features/publicProfile/components/ProfileHeader";
import { ProfileTabs, TabId } from "@/features/publicProfile/components/ProfileTabs";
import { ProfileStatsCards } from "@/features/publicProfile/components/ProfileStatsCards";
import { AdvancedCyclesTab } from "@/features/publicProfile/components/tabs/AdvancedCyclesTab";
import { DisciplinesTab } from "@/features/publicProfile/components/tabs/DisciplinesTab";
import { InternationalTab } from "@/features/publicProfile/components/tabs/InternationalTab";
import { PostCMTab } from "@/features/publicProfile/components/tabs/PostCMTab";

console.log("🔵 [PublicProfilePage] Renderizando página pessoal pública");

const PublicProfilePage = () => {
  const { userId: userIdParam } = useParams();
  const { user, loading: userLoading, error: userError } = useUserProfile();
  const { isEditing, isSaving, startEditing, saveChanges } = useProfileEdit();
  const [activeTab, setActiveTab] = useState<TabId>("avancados");
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
    console.log('🔵 [PublicProfilePage] Profile atualizado:', {
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

  // All possible tabs
  const allTabs = [
    { id: "avancados" as const, label: "Ciclo Avançado", icon: GraduationCap },
    { id: "disciplinas" as const, label: "Disciplinas", icon: BookMarked },
    { id: "internacional" as const, label: "Internacional", icon: Globe },
    { id: "pos-cm" as const, label: "Pós-CM", icon: Briefcase },
  ];

  // Filter tabs based on content (show Internacional and Pós-CM only if they have data, unless in edit mode)
  const tabs = allTabs.filter(tab => {
    if (tab.id === "internacional") {
      return isEditing || (profile.experienciasInternacionais && profile.experienciasInternacionais.length > 0);
    }
    if (tab.id === "pos-cm") {
      return isEditing || (profile.posCM && profile.posCM.length > 0);
    }
    return true; // Always show avancados and disciplinas
  });

  const handleSave = () => {
    saveChanges(profile.saveProfile);
    
    // After saving, if current tab is not available anymore (empty), switch to "avancados"
    setTimeout(() => {
      const availableTabIds = tabs.map(t => t.id);
      if (!availableTabIds.includes(activeTab as any)) {
        setActiveTab("avancados");
      }
    }, 100);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await ProfileService.uploadAvatar(userId, file);
      await profile.refetch(); // Reload profile to get new avatar path
      setAvatarTimestamp(Date.now()); // Force avatar refresh
    } catch (err) {
      console.error('Erro ao fazer upload de avatar:', err);
      alert('Erro ao fazer upload de avatar');
    }
  };

  const handleDefaultAvatarSelect = async (imagePath: string) => {
    try {
      await ProfileService.selectDefaultAvatar(userId, imagePath);
      await profile.refetch(); // Reload profile to get new avatar
      setAvatarTimestamp(Date.now()); // Force avatar refresh
    } catch (err) {
      console.error('Erro ao selecionar avatar padrão:', err);
      alert('Erro ao selecionar avatar padrão');
    }
  };

  const handleBannerChange = async (bannerChoice: string) => {
    try {
      console.log('🎨 [PublicProfilePage] Atualizando banner para:', bannerChoice);
      await ProfileService.updateBanner(userId, bannerChoice);
      console.log('✅ [PublicProfilePage] Banner atualizado no backend');
      await profile.refetch(); // Reload to get new banner
      console.log('✅ [PublicProfilePage] Profile refetchado');
      const newTimestamp = Date.now();
      setBannerTimestamp(newTimestamp); // Force banner refresh
      console.log('✅ [PublicProfilePage] Timestamp atualizado:', newTimestamp);
    } catch (err) {
      console.error('❌ [PublicProfilePage] Erro ao atualizar banner:', err);
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
      console.error('Erro ao atualizar follow:', err);
      alert(err instanceof Error ? err.message : 'Erro ao atualizar follow');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-default-bg">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500">Carregando...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-default-bg">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-600">{userError || "Usuário não encontrado"}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-default-bg">
      <Navigation />

      <main className="flex-grow">
        {/* Profile Header with Banner */}
        <ProfileHeader
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

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Stats Cards - Left Side */}
            <div className="lg:w-64 flex-shrink-0">
              <ProfileStatsCards
                turma={profile.stats.turma}
                cursoOrigem={profile.stats.cursoOrigem}
                areaInteresse={profile.stats.areaInteresse}
              />
            </div>

            {/* Tabs and Content - Right Side */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Tab Content */}
                <div className="p-6" key={`tab-content-${profile.ciclosAvancados.length}-${profile.disciplinas.length}-${profile.experienciasInternacionais.length}-${profile.posCM.length}`}>
                  {activeTab === "avancados" && (
                    <AdvancedCyclesTab
                      ciclosAvancados={profile.ciclosAvancados}
                      isEditing={isEditing}
                      onAdd={profile.addAvancado}
                      onSave={profile.saveAvancado}
                      onRemove={profile.removeAvancado}
                      onUpdate={profile.updateAvancado}
                    />
                  )}

                  {activeTab === "disciplinas" && (
                    <DisciplinesTab
                      disciplinas={profile.disciplinas}
                      ciclosAvancados={profile.ciclosAvancados}
                      isEditing={isEditing}
                      onAdd={profile.addDisciplina}
                      onSave={profile.saveDisciplina}
                      onRemove={profile.removeDisciplina}
                      onUpdate={profile.updateDisciplina}
                    />
                  )}

                  {activeTab === "internacional" && (
                    <InternationalTab
                      experiencias={profile.experienciasInternacionais}
                      isEditing={isEditing}
                      onAdd={profile.addExperienciaInternacional}
                      onSave={profile.saveExperienciaInternacional}
                      onRemove={profile.removeExperienciaInternacional}
                      onUpdate={profile.updateExperienciaInternacional}
                    />
                  )}

                  {activeTab === "pos-cm" && (
                    <PostCMTab
                      posCM={Array.isArray(profile.posCM) ? profile.posCM : []}
                      isEditing={isEditing}
                      onAdd={profile.addPosCM}
                      onSave={profile.savePosCM}
                      onRemove={profile.removePosCM}
                      onUpdate={profile.updatePosCM}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicProfilePage;