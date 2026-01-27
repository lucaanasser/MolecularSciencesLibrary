import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { GraduationCap, Search, Calendar, Users, BookOpen, Lightbulb, MessageSquare } from "lucide-react";
import MolecoogleWindow from "@/features/index/MolecoogleWindow";
import { useState, useEffect, useRef } from "react";
import { AboutSection } from "@/features/index/AboutSection";
import { StatsGrid, StatsType } from "@/features/index/StatsGrid";
import { FeatureCards, FeatureCardType } from "@/features/index/FeatureCards";

// Log de início de renderização da página inicial acadêmica
console.log("🔵 [AcademicIndex] Renderizando página inicial acadêmica");


const AcademicIndexPage = () => {
  // Estados para estatísticas (placeholder por enquanto)
  const [stats, setStats] = useState<StatsType>({ users: 45, disciplines: 120, areas: 6 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      {/* Hero Section - Academic */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-b from-academic-blue-muted via-academic-blue/10 to-default-bg">
        <div className="container mx-auto px-1 flex flex-col md:flex-row items-center gap-2 md:gap-4 flex-1">
          {/* Content - Janela de busca estilo Google com aba CM */}
          <div className="flex-1 flex flex-col items-center justify-center order-2 md:order-1">
            <MolecoogleWindow />
          </div>
          {/* Foto Carlos Magno */}
          <div className="flex-[0_0_35%] max-w-[40%] min-w-[180px] flex justify-center order-1 md:order-2 md:mb-0">
            <img
              src="/images/academic1.png"
              alt="Foto Carlos Magno"
              className="w-full h-auto object-contain max-h-[420px]"
            />
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <AboutSection
        title="Ciclo Avançado: sua jornada de especialização"
        paragraphs={[
          "O Ciclo Avançado do Ciências Moleculares é o momento de escolher sua área de concentração e aprofundar seus conhecimentos em disciplinas específicas de diferentes institutos da USP.",
          "Esta plataforma foi criada para ajudar você a navegar pelas opções disponíveis, montar sua grade de horários e conectar-se com outros estudantes do curso."
        ]}
        buttonText="Saiba mais"
        buttonLink="/academico/faq"
        buttonClass="primary-btn-academic"
        imageSrc="/images/prateleira.png"
        imageAlt="Ciências Moleculares"
      />

      {/* Statistics Section with Diagonal Design */}
      <section className="relative py-40 bg-academic-blue">
        {/* Top Diagonal Cut */}
        <div className="absolute top-0 left-0 w-full h-24 bg-default-bg transform -skew-y-3 origin-top-left"></div>
        {/* Bottom Diagonal Cut */}
        <div className="absolute bottom-0 right-0 w-full h-24 bg-gray-100 transform -skew-y-3 origin-bottom-right"></div>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-white">
              O Ciclo Avançado em números
            </h2>
          </div>
          {loadingStats ? (
            <div className="text-center text-white text-xl">Carregando...</div>
          ) : statsError ? (
            <div className="text-center text-red-200 text-xl">{statsError}</div>
          ) : (
            <StatsGrid stats={stats} order={["users", "disciplines", "areas"]} />
          )}
        </div>
      </section>

      {/* Features Section */}
      <div className="py-40 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-16">Recursos disponíveis</h2>
          <FeatureCards
            columns={4}
            cards={[
              {
                icon: <Search className="h-10 w-10 text-white" />,
                title: "Busque disciplinas",
                description: "Encontre disciplinas por área, instituto, horário ou palavras-chave.",
                buttonText: "Buscar Disciplinas",
                buttonLink: "/academico/buscar",
                colorClass: "bg-cm-green",
                buttonClass: "bg-cm-green hover:bg-cm-green/70"
              },
              {
                icon: <Calendar className="h-10 w-10 text-white" />,
                title: "Monte sua grade",
                description: "Organize suas disciplinas visualmente e evite conflitos de horário.",
                buttonText: "Montar Grade",
                buttonLink: "/academico/grade",
                colorClass: "bg-cm-blue",
                buttonClass: "bg-cm-blue hover:bg-cm-blue/70"
              },
              {
                icon: <MessageSquare className="h-10 w-10 text-white" />,
                title: "MolecOverflow",
                description: "Fórum de dúvidas sobre o curso, créditos, projetos e orientadores.",
                buttonText: "Acessar Fórum",
                buttonLink: "/forum",
                colorClass: "bg-academic-blue",
                buttonClass: "bg-academic-blue hover:bg-academic-blue/70"
              },
              {
                icon: <GraduationCap className="h-10 w-10 text-white" />,
                title: "Tire suas dúvidas",
                description: "Encontre respostas sobre o Ciclo Avançado no nosso FAQ.",
                buttonText: "Ver FAQ",
                buttonLink: "/academico/faq",
                colorClass: "bg-cm-red",
                buttonClass: "bg-cm-red hover:bg-cm-red/70"
              }
            ]}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AcademicIndexPage;
