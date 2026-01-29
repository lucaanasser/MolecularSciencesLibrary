// import Navigation from "@/components/Navigation";

import { Link } from "react-router-dom";
import { BookOpen, Search, User, TrendingUp, Users, BookMarked, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { useTypewriterAreas } from "@/hooks/useTypewriterAreas";
import { TextSection } from "@/features/index/sections/TextSection";
import { StatsSection } from "@/features/index/sections/StatsSection";
import { FeatureSection } from "@/features/index/sections/FeaturesSection";
import { HeroSection } from "@/features/index/sections/HeroSection";
import { LibraryHeroText } from "@/features/index/helpers/LibraryHeroText";

// Log de início de renderização da página inicial
console.log("🔵 [Index] Renderizando página inicial");

const HERO_AREAS = [
  { name: "Matemática", color: "text-cm-red" },
  { name: "Física", color: "text-cm-orange" },
  { name: "Química", color: "text-cm-yellow" },
  { name: "Biologia", color: "text-cm-green" },
  { name: "Computação", color: "text-cm-blue" },
  { name: "Universo", color: "text-library-purple" },
];

const Index = () => {
  const { areaIndex, displayText } = useTypewriterAreas(HERO_AREAS);

  // Estados para estatísticas
  const [stats, setStats] = useState({ users: null, books: null, subareas: null });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    setLoadingStats(true);
    setStatsError(null);
    Promise.all([
      fetch("/api/users").then(r => r.json()),
      fetch("/api/books").then(r => r.json())
    ])
      .then(([users, books]) => {
        // Conta subáreas únicas
        const subareasSet = new Set();
        books.forEach(b => {
          if (b.area && b.subarea !== undefined && b.subarea !== null) {
            subareasSet.add(`${b.area}-${b.subarea}`);
          }
        });
        setStats({
          users: users.length,
          books: books.length,
          subareas: subareasSet.size
        });
      })
      .catch((err) => {
        setStatsError("Erro ao carregar estatísticas");
      })
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <>
      <HeroSection variant="library">
        <h1><LibraryHeroText /></h1>
        <p className="prose-lg">
          Explore nosso acervo de livros, cuidadosamente selecionado para apoiar seu aprendizado e progresso durante o curso de Ciências Moleculares.
        </p>
        <a className="btn-primary prose-lg" href="/buscar">
          Explorar Acervo
        </a>
      </HeroSection>

      <TextSection
        title="Biblioteca: um espaço que cresce com você"
        paragraphs={[
          "A biblioteca é um lugar de encontros e descobertas. Aqui, cada livro, cada conversa e cada pesquisa ajudam a abrir caminhos para novas ideias e novas possibilidades.",
          "Mas para que esse espaço continue vivo e acessível a todos, precisamos de cuidado coletivo. Apoiar a biblioteca é investir no futuro do conhecimento e na oportunidade de aprender juntos."
        ]}
        buttonText="Ajude a biblioteca"
        buttonLink="/ajude"
        buttonClass="btn-primary"
        imageSrc="/images/prateleira.png"
        imageAlt="Ciências Moleculares"
        reverse={true}
      />
      
      <StatsSection
        stats={stats}
        order={["users", "subareas", "books"]}
        title="A biblioteca em números"
        loading={loadingStats}
        error={statsError}
        bgClass="bg-library-purple"
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
        buttonClass="btn-primary"
        imageSrc="/images/image.png"
        imageAlt=""
        reverse={false}
      />
      
      <FeatureSection
        title="Recursos do site"
        cards={[
          {
            icon: <Search className="h-10 w-10 text-white" />,
            title: "Encontre livros no acervo",
            description: "Busque rapidamente por autor, título, tema ou área e descubra tudo o que a biblioteca oferece.",
            buttonText: "Buscar Livros",
            buttonLink: "/buscar",
            colorClass: "bg-cm-red"
          },
          {
            icon: <User className="h-10 w-10 text-white" />,
            title: "Acompanhe seus empréstimos",
            description: "Acesse sua área pessoal para renovar livros e consultar prazos de forma simples e rápida.",
            buttonText: "Fazer Login",
            buttonLink: "/entrar",
            colorClass: "bg-cm-blue"
          },
          {
            icon: <BookOpen className="h-10 w-10 text-white" />,
            title: "Explore a estante virtual",
            description: "Navegue pelo acervo de maneira visual e interativa, como se estivesse dentro da biblioteca.",
            buttonText: "Explorar Estante",
            buttonLink: "/estante-virtual",
            colorClass: "bg-cm-green"
          }
        ]}
        columns='md:grid-cols-3 md:gap-8 lg:gap-12'
      />
    </>
  );
};

export default Index;
