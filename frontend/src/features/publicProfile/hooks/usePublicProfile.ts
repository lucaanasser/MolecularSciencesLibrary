import { useState } from "react";
import {
  ProfileTag,
  AdvancedCycleInfo,
  DisciplinaAvancado,
  PostCMInfo,
  InternationalExperience,
} from "@/types/publicProfile";

// Dados mockados para visualização
const MOCK_DATA = {
  bio: `Sou estudante do Curso de Ciências Moleculares da USP, apaixonado por entender os mecanismos fundamentais da vida através de uma perspectiva interdisciplinar.

Meu interesse principal está na interface entre biologia computacional e neurociência, buscando desenvolver modelos que nos ajudem a compreender melhor o funcionamento do cérebro.

Acredito que a ciência é mais poderosa quando quebramos as barreiras entre disciplinas tradicionais. O CCM me proporcionou exatamente essa visão integrada do conhecimento científico.`,
  
  citacao: "A ciência não é apenas uma coleção de fatos, mas uma forma de pensar sobre o mundo.",
  citacaoAutor: "Carl Sagan",
  
  ciclosAvancados: [
    {
      id: "av-1",
      tema: "Modelagem Computacional de Redes Neurais Biológicas",
      orientador: "Prof. Dr. Antonio Carlos Roque da Silva Filho",
      descricao: "Desenvolvimento de modelos computacionais para simular o comportamento de redes neurais biológicas, com foco em circuitos do hipocampo envolvidos em memória espacial. Utilizamos o simulador NEURON e análise de dados eletrofisiológicos.",
      semestres: 4,
      anoInicio: 2024,
      anoConclusao: 2025,
      disciplinas: ["disc-1", "disc-2", "disc-3", "disc-4"],
      cor: "cm-blue",
    },
    {
      id: "av-2",
      tema: "Bioinformática Estrutural de Proteínas",
      orientador: "Profa. Dra. Heloisa Ferreira Benedetti",
      descricao: "Análise estrutural e funcional de proteínas utilizando ferramentas de bioinformática. Foco em predição de estruturas 3D e docking molecular para descoberta de novos fármacos.",
      semestres: 2,
      anoInicio: 2025,
      disciplinas: ["disc-5", "disc-6"],
      cor: "cm-green",
    },
  ] as (AdvancedCycleInfo & { cor?: string })[],
  
  disciplinas: [
    { id: "disc-1", codigo: "MAC0110", nome: "Introdução à Computação", professor: "Yoshiko Wakabayashi", ano: 2024, semestre: 1, avancadoId: "av-1" },
    { id: "disc-2", codigo: "BMM0220", nome: "Neurociência Celular", professor: "Koichi Sameshima", ano: 2024, semestre: 1, avancadoId: "av-1" },
    { id: "disc-3", codigo: "MAP2210", nome: "Métodos Numéricos", professor: "Junior Barrera", ano: 2024, semestre: 2, avancadoId: "av-1" },
    { id: "disc-4", codigo: "FFI0421", nome: "Física Computacional", professor: "Ricardo Galvão", ano: 2024, semestre: 2, avancadoId: "av-1" },
    { id: "disc-5", codigo: "QBQ0315", nome: "Bioquímica Estrutural", professor: "Shaker Chuck Farah", ano: 2025, semestre: 1, avancadoId: "av-2" },
    { id: "disc-6", codigo: "BIO0301", nome: "Biologia Molecular", professor: "Carlos Menck", ano: 2025, semestre: 1, avancadoId: "av-2" },
    { id: "disc-7", codigo: "MAT0120", nome: "Cálculo I", professor: "Oscar João Abdounur", ano: 2023, semestre: 1 },
    { id: "disc-8", codigo: "FIS0131", nome: "Mecânica Clássica", professor: "Henrique Fleming", ano: 2023, semestre: 1 },
    { id: "disc-9", codigo: "QFL0343", nome: "Química Orgânica", professor: "Luiz Humberto Catalani", ano: 2023, semestre: 2 },
  ] as DisciplinaAvancado[],
  
  tags: [
    { id: "t1", label: "Ciências Exatas e da Terra", category: "grande-area" as const },
    { id: "t2", label: "Ciências Biológicas", category: "grande-area" as const },
    { id: "t3", label: "Neurociência", category: "area" as const },
    { id: "t4", label: "Bioinformática", category: "area" as const },
    { id: "t5", label: "Ciência da Computação", category: "area" as const },
    { id: "t6", label: "Modelagem Computacional", category: "subarea" as const },
    { id: "t7", label: "Redes Neurais", category: "subarea" as const },
    { id: "t8", label: "Machine Learning", category: "subarea" as const },
    { id: "t9", label: "Biologia Estrutural", category: "subarea" as const },
  ],
  
  posCM: [
    {
      id: "poscm-1",
      tipo: "pos-graduacao",
      instituicao: "Instituto de Matemática e Estatística - USP",
      cargo: "Mestrado em Ciência da Computação",
      orientador: "Prof. Dr. Fulano de Tal",
      areas: [
        { id: "t10", label: "Inteligência Artificial", category: "area" },
        { id: "t11", label: "Biologia Computacional", category: "area" }
      ],
      anoInicio: 2026,
      descricao: "Continuação da pesquisa em modelagem computacional de sistemas biológicos, agora com foco em aplicações de deep learning para análise de dados de neuroimagem."
    },
    {
      id: "poscm-2",
      tipo: "trabalho",
      instituicao: "Empresa X",
      cargo: "Cientista de Dados",
      areas: [
        { id: "t12", label: "Data Science", category: "area" }
      ],
      anoInicio: 2027,
      anoFim: 2028,
      descricao: "Atuação em projetos de análise de dados biomédicos."
    }
  ],

  experienciasInternacionais: [
    {
      id: "int-1",
      tipo: "intercambio" as const,
      pais: "Alemanha",
      instituicao: "Max Planck Institute for Brain Research",
      programa: "DAAD RISE Program",
      descricao: "Pesquisa em neurociência computacional, desenvolvendo modelos de aprendizado por reforço para entender tomada de decisão em mamíferos.",
      anoInicio: 2024,
      anoFim: 2024,
      duracao: "3 meses",
    },
    {
      id: "int-2",
      tipo: "curso" as const,
      pais: "Estados Unidos",
      instituicao: "MIT",
      programa: "Summer School in Computational Biology",
      descricao: "Curso intensivo sobre técnicas modernas de biologia computacional e análise de dados genômicos.",
      anoInicio: 2025,
      duracao: "6 semanas",
    },
  ] as InternationalExperience[],
  
  seguindo: [
    { id: 1, nome: "Maria Silva", turma: "2023A", avatar: null },
    { id: 2, nome: "João Santos", turma: "2024A", avatar: null },
    { id: 3, nome: "Ana Costa", turma: "2022B", avatar: null },
    { id: 4, nome: "Pedro Lima", turma: "2024A", avatar: null },
    { id: 5, nome: "Julia Ferreira", turma: "2023B", avatar: null },
  ],
  
  links: {
    email: "teste.aluno@usp.br",
    linkedin: "https://linkedin.com/in/testealuno",
    lattes: "http://lattes.cnpq.br/1234567890",
    github: "https://github.com/testealuno",
    site: "https://testealuno.github.io",
  },
};

const AVANCADO_COLORS = ["cm-blue", "cm-green", "cm-orange", "cm-purple", "cm-academic"];

export const usePublicProfile = () => {
  const [bio, setBio] = useState(MOCK_DATA.bio);
  const [citacao, setCitacao] = useState(MOCK_DATA.citacao);
  const [citacaoAutor, setCitacaoAutor] = useState(MOCK_DATA.citacaoAutor);
  const [ciclosAvancados, setCiclosAvancados] = useState<(AdvancedCycleInfo & { cor?: string })[]>(MOCK_DATA.ciclosAvancados);
  const [disciplinas, setDisciplinas] = useState<DisciplinaAvancado[]>(MOCK_DATA.disciplinas);
  const [experienciasInternacionais, setExperienciasInternacionais] = useState<InternationalExperience[]>(MOCK_DATA.experienciasInternacionais);
  const [posCM, setPosCM] = useState<PostCMInfo[]>(MOCK_DATA.posCM);
  const [tags, setTags] = useState<ProfileTag[]>(MOCK_DATA.tags);
  const [isPublic, setIsPublic] = useState(true);
  const [emailPublico, setEmailPublico] = useState(MOCK_DATA.links.email);
  const [linkedIn, setLinkedIn] = useState(MOCK_DATA.links.linkedin);
  const [lattes, setLattes] = useState(MOCK_DATA.links.lattes);
  const [github, setGithub] = useState(MOCK_DATA.links.github);
  const [site, setSite] = useState(MOCK_DATA.links.site);
  const [seguindo, setSeguindo] = useState(MOCK_DATA.seguindo);
  const [isFollowing, setIsFollowing] = useState(false);

  // Tag operations
  const addTag = (label: string, category: ProfileTag["category"]) => {
    if (!tags.find((t) => t.label.toLowerCase() === label.toLowerCase())) {
      setTags([...tags, { id: `tag-${Date.now()}`, label, category }]);
    }
  };

  const removeTag = (tagId: string) => {
    setTags(tags.filter((t) => t.id !== tagId));
  };

  // Advanced cycle operations
  const addAvancado = () => {
    const newColor = AVANCADO_COLORS[ciclosAvancados.length % AVANCADO_COLORS.length];
    setCiclosAvancados([...ciclosAvancados, {
      id: `av-${Date.now()}`,
      tema: "",
      orientador: "",
      descricao: "",
      semestres: 4,
      disciplinas: [],
      cor: newColor,
    }]);
  };

  const removeAvancado = (id: string) => {
    setCiclosAvancados(ciclosAvancados.filter((a) => a.id !== id));
    setDisciplinas(disciplinas.map((d) => ({ ...d, avancadoId: d.avancadoId === id ? undefined : d.avancadoId })));
  };

  const updateAvancado = (id: string, field: keyof AdvancedCycleInfo | "cor", value: any) => {
    setCiclosAvancados(ciclosAvancados.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  // Discipline operations
  const addDisciplina = () => {
    setDisciplinas([...disciplinas, {
      id: `disc-${Date.now()}`,
      codigo: "",
      nome: "",
      semestre: "",
    }]);
  };

  const removeDisciplina = (id: string) => {
    setDisciplinas(disciplinas.filter((d) => d.id !== id));
  };

  const updateDisciplina = (id: string, field: keyof DisciplinaAvancado, value: any) => {
    setDisciplinas(disciplinas.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  // International experience operations
  const addExperienciaInternacional = () => {
    setExperienciasInternacionais([...experienciasInternacionais, {
      id: `int-${Date.now()}`,
      tipo: "intercambio",
      pais: "",
      instituicao: "",
      anoInicio: new Date().getFullYear(),
    }]);
  };

  const removeExperienciaInternacional = (id: string) => {
    setExperienciasInternacionais(experienciasInternacionais.filter((e) => e.id !== id));
  };

  const updateExperienciaInternacional = (id: string, field: keyof InternationalExperience, value: any) => {
    setExperienciasInternacionais(experienciasInternacionais.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  // Save profile
  const saveProfile = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // TODO: Implement API call
  };

  // Estatísticas do perfil (mock data)
  const stats = {
    turma: "2026",
    cursoOrigem: "Ciências Moleculares",
    areaInteresse: "Neurociência e IA",
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
    saveProfile,
  };
};
