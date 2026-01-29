import Navigation from "@/components/Header";
// import Footer from "@/components/Footer";
import { GraduationCap, Search, Calendar, Users, BookOpen, Lightbulb, MessageSquare } from "lucide-react";
import MolecoogleWindow from "@/features/index/helpers/MolecoogleWindow";
import { useState, useEffect, useRef } from "react";
import { AboutSection } from "@/features/index/sections/AboutSection";
import { StatsSection } from "@/features/index/sections/StatsSection";
import type { StatsType } from "@/features/index/helpers/StatsGrid";
import { FeatureSection } from "@/features/index/sections/FeatureSection";
import { HeroSection } from "@/features/index/sections/HeroSection";

// Log de início de renderização da página inicial acadêmica
console.log("🔵 [AcademicIndex] Renderizando página inicial acadêmica");


const AcademicIndexPage = () => {
  // Estados para estatísticas (placeholder por enquanto)
  const [stats, setStats] = useState<StatsType>({ users: 45, disciplines: 120, areas: 6 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      

      {/* Hero Section customizada */}
      <HeroSection variant="academic">
        <MolecoogleWindow />
      </HeroSection>
      
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

      <StatsSection
        stats={stats}
        order={["users", "disciplines", "areas"]}
        title="O Ciclo Avançado em números"
        loading={loadingStats}
        error={statsError}
        bgClass="bg-academic-blue"
        textClass="text-white"
      />

      <FeatureSection
        title="Recursos disponíveis"
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
        columns={4}
        bgClass="bg-gray-100"
      />
      
      {/* Footer removido, agora está no layout global */}
    </div>
  );
};

export default AcademicIndexPage;
