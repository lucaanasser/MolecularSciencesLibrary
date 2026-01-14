import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  BookOpen,
  Star,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  MessageSquare,
  ThumbsUp,
  ChevronLeft,
  Award,
  Target,
  Lightbulb,
  BarChart3,
  GraduationCap,
  FileText,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos
interface DisciplineInfo {
  id: string;
  codigo: string;
  nome: string;
  instituto: string;
  creditos_aula: number;
  creditos_trabalho: number;
  carga_horaria: number;
  ementa: string;
  objetivos: string;
  programa: string;
  turmas: Array<{
    codigo: string;
    professores: string[];
    horarios: string;
    vagas: number;
  }>;
}

interface Rating {
  geral: number;
  dificuldade: number;
  carga_trabalho: number;
  professores: number;
  clareza: number;
  utilidade: number;
  organizacao: number;
}

interface Review {
  id: number;
  usuario: string;
  turma: string;
  semestre: string;
  rating: Rating;
  comentario: string;
  likes: number;
  data: string;
}

const DisciplinePage: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "avaliacoes">("info");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Mock data - substituir por API
  const disciplina: DisciplineInfo = {
    id: "1",
    codigo: "ACH1033",
    nome: "Ecologia",
    instituto: "EACH",
    creditos_aula: 3,
    creditos_trabalho: 1,
    carga_horaria: 75,
    ementa: "A disciplina apresentará a fundamentação teórica necessária para o entendimento básico dos processos organizadores da natureza na presença e ausência de perturbações antrópicas e nos diversos níveis de organização biológica.",
    objetivos: "Apresentar aos futuros Gestores Ambientais os conceitos e procedimentos mais relevantes em Ecologia, enfatizando processos gerais e integrados ao longo dos diversos níveis de organização biológica.",
    programa: "Parte teórica: O que é e como se estuda a ecologia; níveis de organização biológica; conceitos, propriedades e processos operando em cada nível de organização biológica.",
    turmas: [
      {
        codigo: "01",
        professores: ["Prof. João Silva", "Prof. Maria Santos"],
        horarios: "Seg 14h-16h, Qua 14h-16h",
        vagas: 45,
      },
    ],
  };

  const mediaAvaliacoes: Rating = {
    geral: 4.3,
    dificuldade: 3.2,
    carga_trabalho: 3.5,
    professores: 4.5,
    clareza: 4.0,
    utilidade: 4.2,
    organizacao: 4.1,
  };

  const totalAvaliacoes = 28;

  const reviews: Review[] = [
    {
      id: 1,
      usuario: "Ana Silva",
      turma: "Turma 33",
      semestre: "2025.2",
      rating: {
        geral: 5,
        dificuldade: 3,
        carga_trabalho: 4,
        professores: 5,
        clareza: 4,
        utilidade: 5,
        organizacao: 4,
      },
      comentario: "Disciplina excelente! Os professores são muito atenciosos e o conteúdo é muito relevante. As aulas práticas de campo são o ponto alto.",
      likes: 12,
      data: "2025-12-10",
    },
    {
      id: 2,
      usuario: "Carlos Mendes",
      turma: "Turma 32",
      semestre: "2025.1",
      rating: {
        geral: 4,
        dificuldade: 4,
        carga_trabalho: 3,
        professores: 4,
        clareza: 4,
        utilidade: 4,
        organizacao: 4,
      },
      comentario: "Boa disciplina, mas exige bastante dedicação. As provas são bem elaboradas e os trabalhos práticos são desafiadores.",
      likes: 8,
      data: "2025-07-15",
    },
  ];

  const criterios = [
    { key: "dificuldade" as keyof Rating, label: "Dificuldade", icon: TrendingUp, color: "cm-red" },
    { key: "carga_trabalho" as keyof Rating, label: "Carga de Trabalho", icon: BarChart3, color: "cm-orange" },
    { key: "professores" as keyof Rating, label: "Professores", icon: Users, color: "cm-blue" },
    { key: "clareza" as keyof Rating, label: "Clareza", icon: Lightbulb, color: "cm-yellow" },
    { key: "utilidade" as keyof Rating, label: "Utilidade", icon: Target, color: "cm-green" },
    { key: "organizacao" as keyof Rating, label: "Organização", icon: Award, color: "cm-purple" },
  ];

  const tabs = [
    { id: "info" as const, label: "Informações", shortLabel: "Info", icon: Info },
    { id: "avaliacoes" as const, label: "Avaliações", shortLabel: "Avaliações", icon: MessageSquare },
  ];

  const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-cm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Botão Voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-cm-academic -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar à busca
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
            {/* Ícone */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-cm-academic flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-cm-academic/10 text-cm-academic font-mono text-sm rounded-lg font-semibold">
                  {disciplina.codigo}
                </span>
                <span className="text-sm text-gray-500">{disciplina.instituto}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bebas text-gray-900">{disciplina.nome}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {disciplina.creditos_aula} créditos aula
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {disciplina.creditos_trabalho} créditos trabalho
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {disciplina.carga_horaria}h totais
                </span>
              </div>
            </div>
          </div>

          {/* Layout Principal */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar - Avaliações Resumidas */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Card Avaliação Geral */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-500 mb-2">Avaliação Geral</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-5xl font-bold text-gray-900">{mediaAvaliacoes.geral.toFixed(1)}</span>
                      <div className="flex flex-col items-start">
                        <StarRating rating={Math.round(mediaAvaliacoes.geral)} size="md" />
                        <span className="text-xs text-gray-400 mt-1">{totalAvaliacoes} avaliações</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    {criterios.map((criterio) => {
                      const Icon = criterio.icon;
                      const valor = mediaAvaliacoes[criterio.key];
                      return (
                        <div key={criterio.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg bg-${criterio.color}/10 flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 text-${criterio.color}`} />
                            </div>
                            <span className="text-sm text-gray-700">{criterio.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`bg-${criterio.color} rounded-full h-1.5`}
                                style={{ width: `${(valor / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-6 text-right">{valor.toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botão Avaliar - Mobile também */}
                <Button
                  onClick={() => {
                    setActiveTab("avaliacoes");
                    setShowReviewForm(true);
                  }}
                  className="w-full bg-cm-academic hover:bg-cm-academic/90 text-white rounded-xl font-bold py-3"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Avaliar Disciplina
                </Button>
              </div>
            </aside>

            {/* Conteúdo Principal */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-gray-200 mb-0 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 flex items-center gap-2 rounded-t-xl",
                        activeTab === tab.id
                          ? "text-white border-cm-academic bg-cm-academic"
                          : "text-gray-600 border-transparent hover:text-cm-academic hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      {tab.id === "avaliacoes" && (
                        <span className={cn(
                          "ml-1 px-2 py-0.5 text-xs rounded-full",
                          activeTab === tab.id ? "bg-white/20" : "bg-gray-100"
                        )}>
                          {totalAvaliacoes}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="border border-gray-200 border-t-0 rounded-b-2xl bg-white shadow-sm p-4 sm:p-6">
                {activeTab === "info" && (
                  <div className="space-y-6">
                    {/* Ementa */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-3">Ementa</h2>
                      <p className="text-gray-600 leading-relaxed">{disciplina.ementa}</p>
                    </motion.div>

                    {/* Objetivos */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-3">Objetivos</h2>
                      <p className="text-gray-600 leading-relaxed">{disciplina.objetivos}</p>
                    </motion.div>

                    {/* Turmas */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-4">Turmas Oferecidas</h2>
                      <div className="space-y-3">
                        {disciplina.turmas.map((turma) => (
                          <div
                            key={turma.codigo}
                            className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-gray-900">Turma {turma.codigo}</span>
                              <span className="px-3 py-1 bg-cm-green/10 text-cm-green text-sm rounded-full font-medium">
                                {turma.vagas} vagas
                              </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-start gap-2">
                                <Users className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                <span>{turma.professores.join(", ")}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                <span>{turma.horarios}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}

                {activeTab === "avaliacoes" && (
                  <div className="space-y-6">
                    {/* Formulário de Avaliação */}
                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 bg-cm-academic/5 rounded-xl border border-cm-academic/20"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sua Avaliação</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Compartilhe sua experiência para ajudar outros alunos
                        </p>
                        <Textarea
                          placeholder="Escreva seu comentário sobre a disciplina..."
                          rows={4}
                          className="resize-none mb-4"
                        />
                        <div className="flex gap-2">
                          <Button className="bg-cm-academic hover:bg-cm-academic/90">
                            Publicar Avaliação
                          </Button>
                          <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {!showReviewForm && (
                      <Button
                        onClick={() => setShowReviewForm(true)}
                        variant="outline"
                        className="w-full border-dashed border-cm-academic text-cm-academic hover:bg-cm-academic/5"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Escrever uma avaliação
                      </Button>
                    )}

                    {/* Lista de Reviews */}
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-cm-purple/10 flex items-center justify-center">
                                <span className="text-cm-purple font-semibold">
                                  {review.usuario.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{review.usuario}</p>
                                <p className="text-xs text-gray-500">{review.turma} • {review.semestre}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating.geral} size="sm" />
                              <span className="font-semibold text-gray-900">{review.rating.geral}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            {review.comentario}
                          </p>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-cm-academic transition-colors">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{review.likes} acharam útil</span>
                            </button>
                            <span className="text-xs text-gray-400">
                              {new Date(review.data).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DisciplinePage;
