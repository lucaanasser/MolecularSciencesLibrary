import { useState } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { GraduationCap, Briefcase, BookMarked, Globe } from "lucide-react";
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
  const { userId } = useParams();
  const { user, loading: userLoading, error: userError } = useUserProfile();
  const { isEditing, isSaving, startEditing, saveChanges } = useProfileEdit();
  const [activeTab, setActiveTab] = useState<TabId>("sobre");
  
  const profile = usePublicProfile();

  const isOwnProfile = !userId || (user && userId === String(user.id));

  // Tabs definition
  const tabs = [
    { id: "avancados" as const, label: "Ciclo Avançado", icon: GraduationCap },
    { id: "disciplinas" as const, label: "Disciplinas", icon: BookMarked },
    { id: "internacional" as const, label: "Internacional", icon: Globe },
    { id: "pos-cm" as const, label: "Pós-CM", icon: Briefcase },
  ];

  const handleSave = () => {
    saveChanges(profile.saveProfile);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-cm-bg">
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
      <div className="min-h-screen flex flex-col bg-cm-bg">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-600">{userError || "Usuário não encontrado"}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cm-bg">
      <Navigation />

      <main className="flex-grow">
        {/* Profile Header with Banner */}
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          isSaving={isSaving}
          isFollowing={profile.isFollowing}
          isPublic={profile.isPublic}
          tags={profile.tags}
          seguindo={profile.seguindo}
          emailPublico={profile.emailPublico}
          linkedIn={profile.linkedIn}
          lattes={profile.lattes}
          github={profile.github}
          site={profile.site}
          onEdit={startEditing}
          onSave={handleSave}
          onFollow={() => profile.setIsFollowing(!profile.isFollowing)}
          onPublicToggle={profile.setIsPublic}
          onAddTag={profile.addTag}
          onRemoveTag={profile.removeTag}
          onEmailChange={profile.setEmailPublico}
          onLinkedInChange={profile.setLinkedIn}
          onLattesChange={profile.setLattes}
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
                <div className="p-6">
                  {activeTab === "avancados" && (
                    <AdvancedCyclesTab
                      ciclosAvancados={profile.ciclosAvancados}
                      isEditing={isEditing}
                      onAdd={profile.addAvancado}
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
                      onRemove={profile.removeDisciplina}
                      onUpdate={profile.updateDisciplina}
                    />
                  )}

                  {activeTab === "internacional" && (
                    <InternationalTab
                      experiencias={profile.experienciasInternacionais}
                      isEditing={isEditing}
                      onAdd={profile.addExperienciaInternacional}
                      onRemove={profile.removeExperienciaInternacional}
                      onUpdate={profile.updateExperienciaInternacional}
                    />
                  )}

                  {activeTab === "pos-cm" && (
                    <PostCMTab
                      posCM={Array.isArray(profile.posCM) ? profile.posCM : []}
                      isEditing={isEditing}
                      onUpdate={(arr) => profile.setPosCM(arr)}
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
