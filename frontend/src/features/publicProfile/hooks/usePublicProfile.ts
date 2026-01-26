import { useState, useEffect } from "react";
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
  const addAvancado = async () => {
    try {
      const newColor = AVANCADO_COLORS[ciclosAvancados.length % AVANCADO_COLORS.length];
      const newCycle = await ProfileService.createAdvancedCycle(userId, {
        tema: "Novo Ciclo Avançado",
        orientador: "Nome do Orientador",
        descricao: "",
        semestres: 4,
        disciplinas: [],
      });
      
      console.log('✅ Novo ciclo criado:', newCycle);
      setCiclosAvancados([...ciclosAvancados, { ...newCycle, cor: newColor, id: String(newCycle.id) }]);
    } catch (err) {
      console.error('Erro ao adicionar ciclo:', err);
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
  const addDisciplina = async () => {
    try {
      const newDiscipline = await ProfileService.createDiscipline(userId, {
        codigo: "Nova Disciplina",
        nome: "Nova Disciplina",
        ano: new Date().getFullYear(),
        semestre: 1,
      });
      
      console.log('✅ Nova disciplina criada:', newDiscipline);
      setDisciplinas([...disciplinas, { ...newDiscipline, id: String(newDiscipline.id) }]);
    } catch (err) {
      console.error('Erro ao adicionar disciplina:', err);
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
  const addExperienciaInternacional = async () => {
    try {
      const newExperience = await ProfileService.createInternationalExperience(userId, {
        tipo: "intercambio",
        pais: "País",
        instituicao: "Instituição",
        anoInicio: new Date().getFullYear(),
      });
      
      console.log('✅ Nova experiência criada:', newExperience);
      setExperienciasInternacionais([...experienciasInternacionais, { ...newExperience, id: String(newExperience.id) }]);
    } catch (err) {
      console.error('Erro ao adicionar experiência:', err);
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
  const addPosCM = async () => {
    try {
      const newPostCM = await ProfileService.createPostCM(userId, {
        tipo: "pos-graduacao",
        instituicao: "Instituição",
        cargo: "",
        anoInicio: new Date().getFullYear(),
      });
      
      console.log('✅ Novo pós-CM criado:', newPostCM);
      setPosCM([...posCM, { ...newPostCM, id: String(newPostCM.id) }]);
    } catch (err) {
      console.error('Erro ao adicionar pós-CM:', err);
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

  return {
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
    removeAvancado,
    updateAvancado,
    addDisciplina,
    removeDisciplina,
    updateDisciplina,
    addExperienciaInternacional,
    removeExperienciaInternacional,
    updateExperienciaInternacional,
    addPosCM,
    removePosCM,
    updatePosCM,
    saveProfile,
    refetch,
  };
};
