import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import { useParams } from "react-router-dom";
import { GraduationCap, Briefcase, BookMarked, Globe } from "lucide-react";
import ProfileService from "@/services/ProfileService";
import { UsersService } from "@/services/UsersService";
import { usePublicProfile } from "@/features/publicProfile/hooks/usePublicProfile";
import { useProfileEdit } from "@/features/publicProfile/hooks/useProfileEdit";
import { usePublishSandbox } from "@/features/publicProfile/hooks/usePublishSandbox";
import { PublicHeader } from "@/features/profile/public/PublicHeader";
import { TabId } from "@/features/publicProfile/components/ProfileTabs";
import { PublicStats } from "@/features/profile/public/PublicStats";
import { PublicTabsCard } from "@/features/profile/public/PublicTabsCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { publish, isPublishing, publishError, publishResult, clearStatus } = usePublishSandbox();
  const [rosterOptions, setRosterOptions] = useState<string[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [selectedRosterName, setSelectedRosterName] = useState("");
  const [selectionError, setSelectionError] = useState<string | null>(null);
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

  const normalizeNameForComparison = (name: string) => {
    return String(name || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "");
  };

  useEffect(() => {
    if (!isOwnProfile || !userId) return;

    let isMounted = true;
    setRosterLoading(true);
    setRosterError(null);

    ProfileService.getSandboxRosterOptions(userId)
      .then((data) => {
        if (!isMounted) return;

        const students = Array.isArray(data?.students) ? data.students : [];
        setRosterOptions(students);

        const currentName = (profile.nome || user?.name || "").trim();
        const exactMatch = students.find(
          (studentName) =>
            normalizeNameForComparison(studentName) === normalizeNameForComparison(currentName)
        );

        setSelectedRosterName(exactMatch || "");
      })
      .catch((err) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Erro ao carregar lista de estudantes";
        setRosterError(message);
      })
      .finally(() => {
        if (isMounted) setRosterLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOwnProfile, userId, profile.nome, user?.name]);

  // Create user object from profile data for display
  const displayUser = {
    name: profile.nome || user?.name || "Usuário",
    profile_image: profile.profileImage || user?.profile_image,
    class: profile.turma || user?.class
  };

  const handleSave = () => {
    saveChanges(profile.saveProfile);
  };

  const handlePublishSandbox = async () => {
    if (!selectedRosterName) {
      setSelectionError("Selecione seu nome na lista oficial antes de publicar.");
      return;
    }

    try {
      clearStatus();
      setSelectionError(null);
      await publish(userId, selectedRosterName);
    } catch (error) {
      logger.error('🔴 [PublicProfilePage] Falha ao publicar no sandbox:', error);
    }
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

        {isOwnProfile && (
          <div className="content-container mt-4 space-y-3">
            <div className="max-w-xl space-y-2">
              <p className="text-sm font-medium text-gray-800">
                Selecione seu nome oficial na turma para vincular o perfil no CMsite
              </p>
              <Select
                value={selectedRosterName}
                onValueChange={(value) => {
                  setSelectedRosterName(value);
                  setSelectionError(null);
                }}
                disabled={rosterLoading || !!rosterError || isPublishing}
              >
                <SelectTrigger className={!selectedRosterName && !rosterLoading ? "border-red-300" : ""}>
                  <SelectValue
                    placeholder={rosterLoading ? "Carregando estudantes da turma..." : "Escolha seu nome na lista"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {rosterOptions.map((studentName) => (
                    <SelectItem key={studentName} value={studentName}>
                      {studentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                A publicação só é permitida com um nome selecionado para evitar perfil órfão no site público.
              </p>
              {rosterError && (
                <p className="text-sm text-red-600">
                  Erro ao carregar estudantes da turma: {rosterError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handlePublishSandbox}
                disabled={isPublishing || !userId || !selectedRosterName || rosterLoading || !!rosterError}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPublishing ? "Publicando no sandbox..." : "Publicar no Sandbox"}
              </Button>
              {publishResult?.prUrl && (
                <a
                  href={publishResult.prUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-700 underline"
                >
                  Abrir PR criada
                </a>
              )}
            </div>

            {publishResult?.noChanges && (
              <p className="text-sm text-amber-700">
                Nenhuma alteração detectada no perfil para abrir uma nova PR.
              </p>
            )}

            {publishError && (
              <p className="text-sm text-red-600">
                Erro na publicação: {publishError}
              </p>
            )}

            {selectionError && (
              <p className="text-sm text-red-600">
                {selectionError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;