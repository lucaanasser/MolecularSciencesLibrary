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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [publishFormError, setPublishFormError] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showPhotoPreviewDialog, setShowPhotoPreviewDialog] = useState(false);
  const [isUpdatingBeforePublish, setIsUpdatingBeforePublish] = useState(false);
  const [includePhotoInPublish, setIncludePhotoInPublish] = useState(false);
  const [photoActionMessage, setPhotoActionMessage] = useState<string | null>(null);
  const [selectedAdvancedPdfIds, setSelectedAdvancedPdfIds] = useState<string[]>([]);
  const [advancedPdfLinks, setAdvancedPdfLinks] = useState<Record<string, { url: string; fileName: string }>>({});
  const [publishForm, setPublishForm] = useState({
    bio: "",
    citacao: "",
    citacaoAutor: "",
    turma: "",
    cursoOrigem: "",
    areaInteresse: "",
    emailPublico: "",
    linkedIn: "",
    lattes: "",
    github: "",
    site: "",
  });
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const [bannerTimestamp, setBannerTimestamp] = useState(Date.now());
  
  // Determine which user ID to use (from URL param or current user)
  const userId = userIdParam ? parseInt(userIdParam) : user?.id || 0;
  const profile = usePublicProfile(userId);

  // Update avatar timestamp when profile_image changes
  useEffect(() => {
    if (user?.profile_image || profile.profileImage !== undefined) {
      setAvatarTimestamp(Date.now());
    }
  }, [user?.profile_image, profile.profileImage]);

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

  const resolvedProfileImage = profile.profileImage !== undefined
    ? profile.profileImage
    : user?.profile_image;

  // Create user object from profile data for display
  const displayUser = {
    name: profile.nome || user?.name || "Usuário",
    profile_image: resolvedProfileImage,
    class: profile.turma || user?.class
  };

  const hasCustomProfilePhoto = Boolean(
    displayUser.profile_image && String(displayUser.profile_image).includes('/images/user-images/')
  );

  const handleSave = () => {
    saveChanges(profile.saveProfile);
  };

  const fillPublishFormFromProfile = () => {
    setPublishForm({
      bio: profile.bio || "",
      citacao: profile.citacao || "",
      citacaoAutor: profile.citacaoAutor || "",
      turma: profile.stats.turma || profile.turma || "",
      cursoOrigem: profile.stats.cursoOrigem || "",
      areaInteresse: profile.stats.areaInteresse || "",
      emailPublico: profile.emailPublico || "",
      linkedIn: profile.linkedIn || "",
      lattes: profile.lattes || "",
      github: profile.github || "",
      site: profile.site || "",
    });
  };

  const handleOpenPublishDialog = () => {
    clearStatus();
    setSelectionError(null);
    setPublishFormError(null);
    setPhotoActionMessage(null);
    fillPublishFormFromProfile();
    setIncludePhotoInPublish(hasCustomProfilePhoto);
    setSelectedAdvancedPdfIds([]);
    setAdvancedPdfLinks({});
    setShowPublishDialog(true);
  };

  const handleTryAddPhoto = () => {
    setPhotoActionMessage(
      "Para adicionar foto no envio da PR, faca upload de uma foto personalizada no Public Profile Page (icone da camera no avatar) e depois volte aqui."
    );
  };

  const handlePublishSandbox = async () => {
    if (!selectedRosterName) {
      setSelectionError("Selecione seu nome na lista oficial antes de publicar.");
      return;
    }

    if (!publishForm.turma.trim()) {
      setPublishFormError("A turma e obrigatoria para publicar no sandbox.");
      return;
    }

    try {
      clearStatus();
      setSelectionError(null);
      setPublishFormError(null);
      setIsUpdatingBeforePublish(true);
      await ProfileService.updateProfile(userId, {
        bio: publishForm.bio,
        citacao: publishForm.citacao,
        citacao_autor: publishForm.citacaoAutor,
        turma: publishForm.turma,
        curso_origem: publishForm.cursoOrigem,
        area_interesse: publishForm.areaInteresse,
        email_publico: publishForm.emailPublico,
        linkedin: publishForm.linkedIn,
        lattes: publishForm.lattes,
        github: publishForm.github,
        site_pessoal: publishForm.site,
      });
      await profile.refetch();
      await publish(userId, selectedRosterName, includePhotoInPublish, selectedAdvancedPdfIds);
      setShowPublishDialog(false);
    } catch (error) {
      logger.error('🔴 [PublicProfilePage] Falha ao publicar no sandbox:', error);
    } finally {
      setIsUpdatingBeforePublish(false);
    }
  };

  const isPublishingFlowLoading = isPublishing || isUpdatingBeforePublish;

  const advancedCycles = Array.isArray(profile.ciclosAvancados) ? profile.ciclosAvancados : [];
  const hasAdvancedCycles = advancedCycles.length > 0;

  const toggleAdvancedPdfSelection = (cycleId: string) => {
    setSelectedAdvancedPdfIds((prev) =>
      prev.includes(cycleId) ? prev.filter((id) => id !== cycleId) : [...prev, cycleId]
    );
  };

  const handleGenerateAdvancedPdf = async (cycleId: string) => {
    if (!selectedRosterName) {
      setSelectionError("Selecione seu nome na lista oficial antes de gerar o PDF.");
      return;
    }

    try {
      const { blob, fileName } = await ProfileService.getAdvancedCyclePDF(
        userId,
        cycleId,
        selectedRosterName
      );
      const url = URL.createObjectURL(blob);

      setAdvancedPdfLinks((prev) => ({
        ...prev,
        [cycleId]: { url, fileName }
      }));

      setSelectedAdvancedPdfIds((prev) =>
        prev.includes(cycleId) ? prev : [...prev, cycleId]
      );
    } catch (error) {
      logger.error('🔴 [PublicProfilePage] Falha ao gerar PDF do avancado:', error);
    }
  };

  const getAdvancedCycleLabel = (cycle: { tema?: string; descricao?: string }, index: number) => {
    return cycle.tema || cycle.descricao || `Avancado ${index + 1}`;
  };

  useEffect(() => {
    if (showPublishDialog) return;

    Object.values(advancedPdfLinks).forEach((entry) => URL.revokeObjectURL(entry.url));
    setAdvancedPdfLinks({});
  }, [showPublishDialog, advancedPdfLinks]);

  const handleAvatarUpload = async (file: File, rosterName?: string) => {
    try {
      await ProfileService.uploadAvatar(userId, file, rosterName);
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

  const handleAvatarRemove = async () => {
    try {
      await ProfileService.removeAvatar(userId);
      setUser((prev) => (prev ? { ...prev, profile_image: null } : prev));
      await profile.refetch(); // Reload profile to clear avatar
      setAvatarTimestamp(Date.now());
    } catch (err) {
      logger.error('Erro ao remover avatar:', err);
      alert('Erro ao remover avatar');
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
          userId={userId}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          isSaving={isSaving}
          isPublishing={isPublishingFlowLoading}
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
          onAvatarRemove={handleAvatarRemove}
          onBannerChange={handleBannerChange}
          onPublishClick={handleOpenPublishDialog}
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
          <div className="content-container mt-4 space-y-2">
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
          </div>
        )}

        <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Publicar perfil no sandbox</DialogTitle>
              <DialogDescription>
                Revise os dados que serao enviados. O formulario ja vem preenchido com as informacoes atuais do seu perfil.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-900">Foto enviada na PR</h4>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {hasCustomProfilePhoto ? (
                    <button
                      type="button"
                      onClick={() => setShowPhotoPreviewDialog(true)}
                      className="cursor-zoom-in"
                      title="Abrir preview maior"
                    >
                      <img
                        src={`${displayUser.profile_image}?t=${avatarTimestamp}`}
                        alt="Foto que pode ser enviada"
                        className={`h-28 w-28 rounded-xl object-cover border border-gray-300 ${includePhotoInPublish ? "" : "opacity-60"}`}
                      />
                    </button>
                  ) : (
                    <div className="h-28 w-28 rounded-xl border border-gray-300 bg-gray-200 text-gray-600 flex items-center justify-center text-5xl font-bebas">
                      {String(displayUser.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-2">
                    {hasCustomProfilePhoto ? (
                      <>
                        <p className="text-sm text-gray-700">
                          {includePhotoInPublish
                            ? "Essa foto personalizada sera enviada no PR."
                            : "Foto personalizada detectada, mas excluida deste envio."}
                        </p>
                        <Button
                          variant={includePhotoInPublish ? "ghost" : "primary"}
                          size="sm"
                          onClick={() => setIncludePhotoInPublish((prev) => !prev)}
                          disabled={isPublishingFlowLoading}
                        >
                          {includePhotoInPublish ? "Excluir foto do envio" : "Incluir foto no envio"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700">
                          Voce nao tem foto personalizada ativa. Apenas avatares padrao nao sao enviados como foto no PR.
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleTryAddPhoto}
                          disabled={isPublishingFlowLoading}
                        >
                          Add foto
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {photoActionMessage && (
                  <p className="text-sm text-amber-700">
                    {photoActionMessage}
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-700">
                Campos obrigatorios: <span className="text-red-600 font-semibold">Nome oficial da turma*</span> e <span className="text-red-600 font-semibold">Turma*</span>.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  Nome oficial na turma <span className="text-red-600">*</span>
                </label>
                <Select
                  value={selectedRosterName}
                  onValueChange={(value) => {
                    setSelectedRosterName(value);
                    setSelectionError(null);
                  }}
                  disabled={rosterLoading || !!rosterError || isPublishingFlowLoading}
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
                  Essa selecao evita perfis orfaos no site publico.
                </p>
                {rosterError && (
                  <p className="text-sm text-red-600">
                    Erro ao carregar estudantes da turma: {rosterError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">Turma <span className="text-red-600">*</span></label>
                  <Input
                    value={publishForm.turma}
                    readOnly
                    placeholder="Ex: 2018"
                    className={`mb-0 bg-gray-100 cursor-not-allowed ${!publishForm.turma.trim() ? "border-red-300" : ""}`}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    A turma e definida pelo seu perfil e nao pode ser alterada neste formulario.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">Curso de origem</label>
                  <Input
                    value={publishForm.cursoOrigem}
                    onChange={(e) => setPublishForm((prev) => ({ ...prev, cursoOrigem: e.target.value }))}
                    placeholder="Ex: Fisica"
                    className="mb-0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-800">Area de interesse</label>
                  <Input
                    value={publishForm.areaInteresse}
                    onChange={(e) => setPublishForm((prev) => ({ ...prev, areaInteresse: e.target.value }))}
                    placeholder="Ex: Computacao, Matematica Aplicada"
                    className="mb-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">Bio</label>
                <Textarea
                  value={publishForm.bio}
                  onChange={(e) => setPublishForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Resumo do seu perfil"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">Citacao</label>
                  <Input
                    value={publishForm.citacao}
                    onChange={(e) => setPublishForm((prev) => ({ ...prev, citacao: e.target.value }))}
                    placeholder="Frase que aparece no perfil"
                    className="mb-0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">Autor da citacao</label>
                  <Input
                    value={publishForm.citacaoAutor}
                    onChange={(e) => setPublishForm((prev) => ({ ...prev, citacaoAutor: e.target.value }))}
                    placeholder="Autor"
                    className="mb-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">Email publico</label>
                  <Input
                    value={publishForm.emailPublico}
                    onChange={(e) => setPublishForm((prev) => ({ ...prev, emailPublico: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className="mb-0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">LinkedIn</label>
                  <Input
                    value={publishForm.linkedIn}
                    onChange={(e) => setPublishForm((prev) => ({ ...prev, linkedIn: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className="mb-0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">Lattes</label>
                  <Input
                    value={publishForm.lattes}
                    onChange={(e) => setPublishForm((prev) => ({ ...prev, lattes: e.target.value }))}
                    placeholder="URL do curriculo Lattes"
                    className="mb-0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">GitHub</label>
                  <Input
                    value={publishForm.github}
                    onChange={(e) => setPublishForm((prev) => ({ ...prev, github: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="mb-0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-800">Site pessoal</label>
                  <Input
                    value={publishForm.site}
                    onChange={(e) => setPublishForm((prev) => ({ ...prev, site: e.target.value }))}
                    placeholder="https://seusite.com"
                    className="mb-0"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-900">PDFs do avancado</h4>

                {hasAdvancedCycles ? (
                  <div className="space-y-3">
                    {advancedCycles.map((cycle, index) => {
                      const cycleId = String(cycle.id);
                      const isSelected = selectedAdvancedPdfIds.includes(cycleId);
                      const label = getAdvancedCycleLabel(cycle, index);
                      const downloadEntry = advancedPdfLinks[cycleId];

                      return (
                        <div key={cycleId} className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{label}</p>
                            <p className="text-xs text-gray-600">
                              O PDF inclui disciplinas e experiencias internacionais vinculadas a este ciclo.
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <Button
                              type="button"
                              variant={isSelected ? "ghost" : "primary"}
                              size="sm"
                              onClick={() => handleGenerateAdvancedPdf(cycleId)}
                              disabled={isPublishingFlowLoading}
                            >
                              {isSelected ? "Gerar novamente" : "Gerar PDF do avancado"}
                            </Button>
                            {downloadEntry && (
                              <a
                                href={downloadEntry.url}
                                download={downloadEntry.fileName}
                                className="text-xs text-blue-700 underline"
                              >
                                Baixar PDF
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">
                    Crie seu primeiro avancado e associe a ele disciplinas e experiencias internacionais para poder gerar e uppar o PDF dele no site do CECM.
                  </p>
                )}

                {hasAdvancedCycles && (
                  <p className="text-xs text-gray-600">
                    Os PDFs sao gerados durante a publicacao e nao ficam armazenados no sistema.
                  </p>
                )}
              </div>

              {selectionError && (
                <p className="text-sm text-red-600">
                  {selectionError}
                </p>
              )}

              {publishFormError && (
                <p className="text-sm text-red-600">
                  {publishFormError}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={() => setShowPublishDialog(false)}
                variant="ghost"
                disabled={isPublishingFlowLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePublishSandbox}
                disabled={isPublishingFlowLoading || !userId || !selectedRosterName || rosterLoading || !!rosterError}
                variant="primary"
              >
                {isPublishingFlowLoading ? "Publicando no sandbox..." : "Salvar e publicar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPhotoPreviewDialog} onOpenChange={setShowPhotoPreviewDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Preview da foto</DialogTitle>
              <DialogDescription>
                Visualizacao ampliada da foto que pode ser enviada na PR.
              </DialogDescription>
            </DialogHeader>

            {hasCustomProfilePhoto && (
              <div className="w-full flex items-center justify-center">
                <img
                  src={`${displayUser.profile_image}?t=${avatarTimestamp}`}
                  alt="Preview ampliado da foto"
                  className="max-h-[75vh] w-auto rounded-xl border border-gray-300 object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PublicProfilePage;