import { GraduationCap, Search, Calendar, Users, BookOpen, Lightbulb, MessageSquare } from "lucide-react";
import { logger } from "@/utils/logger";
import MolecoogleWindow from "@/features/index/components/MolecoogleWindow";
import { useState, useEffect, useRef } from "react";
import { TextSection } from "@/features/index/features/TextSection";
import { StatsSection } from "@/features/index/features/StatsSection";
import type { StatsType } from "@/features/index/components/StatsGrid";
import { FeatureSection } from "@/features/index/features/FeaturesSection";
import { HeroSection } from "@/features/index/features/HeroSection";

// Log de início de renderização da página inicial acadêmica
logger.info("🔵 [AcademicIndex] Renderizando página inicial acadêmica");


const AcademicIndexPage = () => {
  // Estados para estatísticas (placeholder por enquanto)
  const [stats, setStats] = useState<StatsType>({ users: 45, disciplines: 120, areas: 6 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      

      <HeroSection variant="academic">
        <MolecoogleWindow />
      </HeroSection>
      
      <TextSection
        title="Ciclo Avançado: sua jornada de especialização"
        paragraphs={[
          "O Ciclo Avançado do Ciências Moleculares é o momento de escolher sua área de concentração e aprofundar seus conhecimentos em disciplinas específicas de diferentes institutos da USP.",
          "Esta plataforma foi criada para ajudar você a navegar pelas opções disponíveis, montar sua grade de horários e conectar-se com outros estudantes do curso."
        ]}
        buttonText="Saiba mais"
        buttonLink="/academico/faq"
        imageSrc="/images/image.png"
        imageAlt="Ciências Moleculares"
        reverse={false}
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

      <TextSection
        title="Conheça melhor nossos números"
        paragraphs={[
          "Acreditamos que a transparência fortalece a confiança e o engajamento da comunidade. Por isso, disponibilizamos dados e estatísticas atualizadas sobre o funcionamento da biblioteca.",
          "Confira gráficos detalhados sobre empréstimos, acervo e usuários. Todos os dados são apresentados de forma agregada, sem expor informações pessoais."
        ]}
        buttonText="Biblioteca em Dados"
        buttonLink="/transparencia"
        imageSrc="/images/image.png"
        imageAlt=""
        reverse={true}
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
          },
          {
            icon: <Calendar className="h-10 w-10 text-white" />,
            title: "Monte sua grade",
            description: "Organize suas disciplinas visualmente e evite conflitos de horário.",
            buttonText: "Montar Grade",
            buttonLink: "/academico/grade",
            colorClass: "bg-cm-blue",
          },
          {
            icon: <MessageSquare className="h-10 w-10 text-white" />,
            title: "MolecOverflow",
            description: "Fórum de dúvidas sobre o curso, créditos, projetos e orientadores.",
            buttonText: "Acessar Fórum",
            buttonLink: "/forum",
            colorClass: "bg-academic-blue",
          },
          {
            icon: <GraduationCap className="h-10 w-10 text-white" />,
            title: "Tire suas dúvidas",
            description: "Encontre respostas sobre o Ciclo Avançado no nosso FAQ.",
            buttonText: "Ver FAQ",
            buttonLink: "/academico/faq",
            colorClass: "bg-cm-red",
          }
        ]}
        columns='md:grid-cols-2 lg:grid-cols-4 md:gap-12 lg:gap-8'
      />
      
      
    </div>
  );
};

export default AcademicIndexPage;
