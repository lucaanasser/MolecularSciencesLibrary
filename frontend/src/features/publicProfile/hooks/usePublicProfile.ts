import { useState, useEffect, useMemo } from "react";
import {
  ProfileTag,
  AdvancedCycleInfo,
  DisciplinaAvancado,
  PostCMInfo,
  InternationalExperience,
} from "@/types/publicProfile";
import ProfileService from "@/services/ProfileService";

const AVANCADO_COLORS = ["cm-blue", "cm-green", "cm-orange", "cm-purple", "cm-academic"];

export const usePublicProfile = (userId: number) => {
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Profile data states
  const [bio, setBio] = useState("");
  const [citacao, setCitacao] = useState("");
  const [citacaoAutor, setCitacaoAutor] = useState("");
  const [ciclosAvancados, setCiclosAvancados] = useState<(AdvancedCycleInfo & { cor?: string })[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaAvancado[]>([]);
  const [experienciasInternacionais, setExperienciasInternacionais] = useState<InternationalExperience[]>([]);
  const [posCM, setPosCM] = useState<PostCMInfo[]>([]);
  const [tags, setTags] = useState<ProfileTag[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [emailPublico, setEmailPublico] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [lattes, setLattes] = useState("");
  const [github, setGithub] = useState("");
  const [site, setSite] = useState("");
  const [bannerChoice, setBannerChoice] = useState("purple");
  const [nome, setNome] = useState("");
  const [turma, setTurma] = useState("");
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [seguindo, setSeguindo] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    turma: "",
    cursoOrigem: "",
    areaInteresse: "",
  });

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profile = await ProfileService.getProfile(userId);
        console.log('🔍 [usePublicProfile] Profile completo recebido:', profile);
        console.log('🔍 [usePublicProfile] banner_choice do backend:', profile.banner_choice);
        
        // Set basic profile data
        setBio(profile.bio || "");
        setCitacao(profile.citacao || "");
        setCitacaoAutor(profile.citacao_autor || "");
        setIsPublic(profile.is_public ?? true);
        setEmailPublico(profile.email_publico || "");
        setLinkedIn(profile.linkedin || "");
        setLattes(profile.lattes || "");
        setGithub(profile.github || "");
        setSite(profile.site_pessoal || "");
        setBannerChoice(profile.banner_choice || "purple");
        setNome(profile.nome || "");
        setTurma(profile.turma || "");
        setProfileImage(profile.profileImage);
        console.log('🔍 [usePublicProfile] Banner choice carregado:', profile.banner_choice);
        
        // Set stats
        setStats({
          turma: profile.turma || "",
          cursoOrigem: profile.curso_origem || "",
          areaInteresse: profile.area_interesse || "",
        });
        
        // Set arrays from backend
        setCiclosAvancados(profile.advanced_cycles || []);
        setDisciplinas(profile.disciplines || []);
        setExperienciasInternacionais(profile.international_experiences || []);
        setPosCM(profile.post_cm || []);
        setTags(profile.tags || []);
        setIsFollowing(profile.is_following || false);
        
        // Fetch following list
        const following = await ProfileService.getFollowing(userId);
        setSeguindo(following);
        
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Refetch function to reload profile
  const refetch = async () => {
    try {
      setLoading(true);
      const profile = await ProfileService.getProfile(userId);
      
      setBio(profile.bio || "");
      setCitacao(profile.citacao || "");
      setCitacaoAutor(profile.citacao_autor || "");
      setIsPublic(profile.is_public ?? true);
      setEmailPublico(profile.email_publico || "");
      setLinkedIn(profile.linkedin || "");
      setLattes(profile.lattes || "");
      setGithub(profile.github || "");
      setSite(profile.site_pessoal || "");
      setBannerChoice(profile.banner_choice || "purple");
      setNome(profile.nome || "");
      setTurma(profile.turma || "");
      setProfileImage(profile.profileImage);
      setStats({
        turma: profile.turma || "",
        cursoOrigem: profile.curso_origem || "",
        areaInteresse: profile.area_interesse || "",
      });
      setCiclosAvancados(profile.advanced_cycles || []);
      setDisciplinas(profile.disciplines || []);
      setExperienciasInternacionais(profile.international_experiences || []);
      setPosCM(profile.post_cm || []);
      setTags(profile.tags || []);
      setIsFollowing(profile.is_following || false);
      
      const following = await ProfileService.getFollowing(userId);
      setSeguindo(following);
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao recarregar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro ao recarregar perfil');
      setLoading(false);
    }
  };

  // Tag operations
  const addTag = async (label: string, category: ProfileTag["category"]) => {
    try {
      if (tags.find((t) => t.label.toLowerCase() === label.toLowerCase())) {
        return; // Tag already exists
      }
      
      await ProfileService.addProfileTag(userId, label, category);
      
      // Optimistic update
      const newTag = { id: `temp-${Date.now()}`, label, category };
      setTags([...tags, newTag]);
      
      // Refetch to get real ID
      await refetch();
    } catch (err) {
      console.error('Erro ao adicionar tag:', err);
      throw err;
    }
  };

  const removeTag = async (tagId: string) => {
    try {
      const tagIdNum = parseInt(tagId);
      if (isNaN(tagIdNum)) return;
      
      await ProfileService.removeProfileTag(userId, tagIdNum);
      
      // Optimistic update
      setTags(tags.filter((t) => t.id !== tagId));
    } catch (err) {
      console.error('Erro ao remover tag:', err);
      // Revert on error
      await refetch();
      throw err;
    }
  };

  // Advanced cycle operations
  const addAvancado = () => {
    // Retorna um ID temporário para o novo card (será criado no DB apenas quando salvar)
    return `temp-${Date.now()}`;
  };

  const saveAvancado = async (data: Partial<AdvancedCycleInfo & { id?: string; cor?: string }>) => {
    try {
      console.log('🔵 [usePublicProfile] Salvando ciclo avançado');
      
      // Check if it's an edit (has ID) or create (no ID)
      if (data.id) {
        const cycleId = parseInt(data.id);
        if (isNaN(cycleId)) {
          throw new Error('ID inválido');
        }
        
        // Update existing cycle
        const { id, cor, ...updateData } = data;
        const updatedCycle = await ProfileService.updateAdvancedCycle(userId, cycleId, updateData);
        
        console.log('✅ Ciclo atualizado pelo backend:', updatedCycle);
        
        // Update local state
        setCiclosAvancados(ciclosAvancados.map((c) => 
          c.id === data.id ? { ...updatedCycle, id: String(updatedCycle.id), cor: c.cor } : c
        ));
        
        return { ...updatedCycle, id: String(updatedCycle.id), cor };
      } else {
        // Create new cycle
        const newColor = AVANCADO_COLORS[ciclosAvancados.length % AVANCADO_COLORS.length];
        const newCycle = await ProfileService.createAdvancedCycle(userId, data);
        
        console.log('✅ Novo ciclo criado pelo backend:', newCycle);
        const cycleWithColor = { ...newCycle, cor: newColor, id: String(newCycle.id) };
        
        const updatedCycles = [...ciclosAvancados, cycleWithColor];
        setCiclosAvancados(updatedCycles);
        console.log('✅ Estado atualizado');
        
        return cycleWithColor;
      }
    } catch (err) {
      console.error('🔴 Erro ao salvar ciclo:', err);
      throw err;
    }
  };

  const removeAvancado = async (id: string) => {
    try {
      const cycleId = parseInt(id);
      if (isNaN(cycleId)) return;
      
      await ProfileService.deleteAdvancedCycle(userId, cycleId);
      
      // Optimistic update
      setCiclosAvancados(ciclosAvancados.filter((a) => a.id !== id));
      setDisciplinas(disciplinas.map((d) => ({ ...d, avancadoId: d.avancadoId === id ? undefined : d.avancadoId })));
    } catch (err) {
      console.error('Erro ao remover ciclo:', err);
      await refetch();
      throw err;
    }
  };

  const updateAvancado = async (id: string, field: keyof AdvancedCycleInfo | "cor", value: any) => {
    try {
      // Optimistic update
      setCiclosAvancados(ciclosAvancados.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
      
      // If it's just color, don't send to backend (frontend only)
      if (field === "cor") return;
      
      const cycleId = parseInt(id);
      if (isNaN(cycleId)) return;
      
      await ProfileService.updateAdvancedCycle(userId, cycleId, { [field]: value });
    } catch (err) {
      console.error('Erro ao atualizar ciclo:', err);
      await refetch();
      throw err;
    }
  };

  // Discipline operations
  const addDisciplina = () => {
    // Retorna um ID temporário para o novo card (será criado no DB apenas quando salvar)
    return `temp-${Date.now()}`;
  };

  const saveDisciplina = async (data: Partial<DisciplinaAvancado & { id?: string }>) => {
    try {
      console.log('🔵 [usePublicProfile] Salvando disciplina');
      
      // Check if it's an edit (has ID) or create (no ID)
      if (data.id) {
        const disciplineId = parseInt(data.id);
        if (isNaN(disciplineId)) {
          throw new Error('ID inválido');
        }
        
        // Update existing discipline
        const { id, ...updateData } = data;
        const updatedDiscipline = await ProfileService.updateDiscipline(userId, disciplineId, updateData);
        
        console.log('✅ Disciplina atualizada pelo backend:', updatedDiscipline);
        
        // Update local state
        setDisciplinas(disciplinas.map((d) => 
          d.id === data.id ? { ...updatedDiscipline, id: String(updatedDiscipline.id) } : d
        ));
        
        return { ...updatedDiscipline, id: String(updatedDiscipline.id) };
      } else {
        // Create new discipline
        const newDiscipline = await ProfileService.createDiscipline(userId, data);
        
        console.log('✅ Nova disciplina criada pelo backend:', newDiscipline);
        const disciplineWithId = { ...newDiscipline, id: String(newDiscipline.id) };
        
        const updatedDisciplines = [...disciplinas, disciplineWithId];
        setDisciplinas(updatedDisciplines);
        console.log('✅ Estado atualizado');
        
        return disciplineWithId;
      }
    } catch (err) {
      console.error('🔴 Erro ao salvar disciplina:', err);
      throw err;
    }
  };

  const removeDisciplina = async (id: string) => {
    try {
      const disciplineId = parseInt(id);
      if (isNaN(disciplineId)) return;
      
      await ProfileService.deleteDiscipline(userId, disciplineId);
      
      // Optimistic update
      setDisciplinas(disciplinas.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Erro ao remover disciplina:', err);
      await refetch();
      throw err;
    }
  };

  const updateDisciplina = async (id: string, field: keyof DisciplinaAvancado, value: any) => {
    try {
      // Optimistic update
      setDisciplinas(disciplinas.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
      
      const disciplineId = parseInt(id);
      if (isNaN(disciplineId)) return;
      
      await ProfileService.updateDiscipline(userId, disciplineId, { [field]: value });
    } catch (err) {
      console.error('Erro ao atualizar disciplina:', err);
      await refetch();
      throw err;
    }
  };

  // International experience operations
  const addExperienciaInternacional = () => {
    // Retorna um ID temporário para o novo card (será criado no DB apenas quando salvar)
    return `temp-${Date.now()}`;
  };

  const saveExperienciaInternacional = async (data: Partial<InternationalExperience & { id?: string }>) => {
    try {
      console.log('🔵 [usePublicProfile] Salvando experiência internacional');
      
      // Check if it's an edit (has ID) or create (no ID)
      if (data.id) {
        const experienceId = parseInt(data.id);
        if (isNaN(experienceId)) {
          throw new Error('ID inválido');
        }
        
        // Update existing experience
        const { id, ...updateData } = data;
        const updatedExperience = await ProfileService.updateInternationalExperience(userId, experienceId, updateData);
        
        console.log('✅ Experiência atualizada pelo backend:', updatedExperience);
        
        // Update local state
        setExperienciasInternacionais(experienciasInternacionais.map((e) => 
          e.id === data.id ? { ...updatedExperience, id: String(updatedExperience.id) } : e
        ));
        
        return { ...updatedExperience, id: String(updatedExperience.id) };
      } else {
        // Create new experience
        const newExperience = await ProfileService.createInternationalExperience(userId, data);
        
        console.log('✅ Nova experiência criada pelo backend:', newExperience);
        const experienceWithId = { ...newExperience, id: String(newExperience.id) };
        
        const updatedExperiences = [...experienciasInternacionais, experienceWithId];
        setExperienciasInternacionais(updatedExperiences);
        console.log('✅ Estado atualizado');
        
        return experienceWithId;
      }
    } catch (err) {
      console.error('🔴 Erro ao salvar experiência:', err);
      throw err;
    }
  };

  const removeExperienciaInternacional = async (id: string) => {
    try {
      const experienceId = parseInt(id);
      if (isNaN(experienceId)) return;
      
      await ProfileService.deleteInternationalExperience(userId, experienceId);
      
      // Optimistic update
      setExperienciasInternacionais(experienciasInternacionais.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Erro ao remover experiência:', err);
      await refetch();
      throw err;
    }
  };

  const updateExperienciaInternacional = async (id: string, field: keyof InternationalExperience, value: any) => {
    try {
      // Optimistic update
      setExperienciasInternacionais(experienciasInternacionais.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
      
      const experienceId = parseInt(id);
      if (isNaN(experienceId)) return;
      
      await ProfileService.updateInternationalExperience(userId, experienceId, { [field]: value });
    } catch (err) {
      console.error('Erro ao atualizar experiência:', err);
      await refetch();
      throw err;
    }
  };

  // PostCM operations
  const addPosCM = () => {
    // Retorna um ID temporário para o novo card (será criado no DB apenas quando salvar)
    return `temp-${Date.now()}`;
  };

  const savePosCM = async (data: Partial<PostCMInfo & { id?: string }>) => {
    try {
      console.log('🔵 [usePublicProfile] Salvando pós-CM');
      
      // Check if it's an edit (has ID) or create (no ID)
      if (data.id) {
        const postCmId = parseInt(data.id);
        if (isNaN(postCmId)) {
          throw new Error('ID inválido');
        }
        
        // Update existing post-CM
        const { id, ...updateData } = data;
        const updatedPostCM = await ProfileService.updatePostCM(userId, postCmId, updateData);
        
        console.log('✅ Pós-CM atualizado pelo backend:', updatedPostCM);
        
        // Update local state
        setPosCM(posCM.map((p) => 
          p.id === data.id ? { ...updatedPostCM, id: String(updatedPostCM.id) } : p
        ));
        
        return { ...updatedPostCM, id: String(updatedPostCM.id) };
      } else {
        // Create new post-CM
        const newPostCM = await ProfileService.createPostCM(userId, data);
        
        console.log('✅ Novo pós-CM criado pelo backend:', newPostCM);
        const postCMWithId = { ...newPostCM, id: String(newPostCM.id) };
        
        const updatedPostCM = [...posCM, postCMWithId];
        setPosCM(updatedPostCM);
        console.log('✅ Estado atualizado');
        
        return postCMWithId;
      }
    } catch (err) {
      console.error('🔴 Erro ao salvar pós-CM:', err);
      throw err;
    }
  };

  const removePosCM = async (id: string) => {
    try {
      const postCmId = parseInt(id);
      if (isNaN(postCmId)) return;
      
      await ProfileService.deletePostCM(userId, postCmId);
      
      // Optimistic update
      setPosCM(posCM.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Erro ao remover pós-CM:', err);
      await refetch();
      throw err;
    }
  };

  const updatePosCM = async (id: string, field: keyof PostCMInfo, value: any) => {
    try {
      // Optimistic update
      setPosCM(posCM.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
      
      const postCmId = parseInt(id);
      if (isNaN(postCmId)) return;
      
      await ProfileService.updatePostCM(userId, postCmId, { [field]: value });
    } catch (err) {
      console.error('Erro ao atualizar pós-CM:', err);
      await refetch();
      throw err;
    }
  };

  // Save profile (basic info)
  const saveProfile = async () => {
    try {
      setSaving(true);
      await ProfileService.updateProfile(userId, {
        bio,
        citacao,
        citacao_autor: citacaoAutor,
        turma: stats.turma,
        curso_origem: stats.cursoOrigem,
        area_interesse: stats.areaInteresse,
        email_publico: emailPublico,
        linkedin: linkedIn,
        lattes,
        github,
        site_pessoal: site,
        is_public: isPublic,
      });
      
      console.log('✅ Perfil salvo com sucesso');
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return useMemo(() => ({
    // State
    bio,
    citacao,
    citacaoAutor,
    ciclosAvancados,
    disciplinas,
    experienciasInternacionais,
    posCM,
    tags,
    isPublic,
    emailPublico,
    linkedIn,
    lattes,
    github,
    site,
    bannerChoice,
    nome,
    turma,
    profileImage,
    seguindo,
    isFollowing,
    stats,
    loading,
    error,
    saving,
    
    // Setters
    setBio,
    setCitacao,
    setCitacaoAutor,
    setPosCM,
    setIsPublic,
    setEmailPublico,
    setLinkedIn,
    setLattes,
    setGithub,
    setSite,
    setIsFollowing,
    
    // Operations
    addTag,
    removeTag,
    addAvancado,
    saveAvancado,
    removeAvancado,
    updateAvancado,
    addDisciplina,
    saveDisciplina,
    removeDisciplina,
    updateDisciplina,
    addExperienciaInternacional,
    saveExperienciaInternacional,
    removeExperienciaInternacional,
    updateExperienciaInternacional,
    addPosCM,
    savePosCM,
    removePosCM,
    updatePosCM,
    saveProfile,
    refetch,
  }), [
    bio, citacao, citacaoAutor, ciclosAvancados, disciplinas, 
    experienciasInternacionais, posCM, tags, isPublic, emailPublico,
    linkedIn, lattes, github, site, seguindo, isFollowing, stats,
    loading, error, saving,
    bannerChoice, nome, turma, profileImage
  ]);
};
