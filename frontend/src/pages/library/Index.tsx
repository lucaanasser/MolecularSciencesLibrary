import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { BookOpen, Search, User, TrendingUp, Users, BookMarked, Lightbulb } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTypewriterAreas } from "@/features/index/useTypewriterAreas";
import { AboutSection } from "@/features/index/AboutSection";
import { StatsGrid } from "@/features/index/StatsGrid";
import { FeatureCards } from "@/features/index/FeatureCards";

// ...existing code...

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
  const { scrollYProgress } = useScroll();
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -50]);
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      {/* Hero Section - Custom */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-b from-library-purple-muted via-library-purple/10 to-default-bg">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-4 md:gap-8 flex-1">
          {/* Logo */}
          <div className="flex-1 flex justify-center md:mb-0">
            <img
              src="/images/home.png"
              alt="Ciências Moleculares"
              className="w-80 md:w-[34rem] lg:w-[40rem] h-auto"
            />
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col items-start">
            <h1>
              Abra um livro,<br />
              {(() => {
                const artigo =
                  HERO_AREAS[areaIndex].name === "Universo" ? "o " : "a ";
                return (
                  <>
                    desvende {artigo} 
                    <span
                      className={`destaque border-r-2 border-current pr-2 transition-colors duration-500 ${HERO_AREAS[areaIndex].color}`}
                    >
                      {displayText}
                    </span>
                  </>
                );
              })()}
            </h1>
            <p className="bigtext">
              Explore nosso acervo de livros, cuidadosamente selecionado para apoiar seu aprendizado e progresso durante o curso de Ciências Moleculares.
            </p>
            <button className="primary-btn text-2xl">
              <Link to="/buscar">Explorar Acervo</Link>
            </button>
          </div>
        </div>
      </section>
      {/* Fim Hero Section customizada */}

      {/* About Section */}
      <AboutSection
        title="Biblioteca: um espaço que cresce com você"
        paragraphs={[
          "A biblioteca é um lugar de encontros e descobertas. Aqui, cada livro, cada conversa e cada pesquisa ajudam a abrir caminhos para novas ideias e novas possibilidades.",
          "Mas para que esse espaço continue vivo e acessível a todos, precisamos de cuidado coletivo. Apoiar a biblioteca é investir no futuro do conhecimento e na oportunidade de aprender juntos."
        ]}
        buttonText="Ajude a biblioteca"
        buttonLink="/ajude"
        imageSrc="/images/prateleira.png"
        imageAlt="Ciências Moleculares"
      />

      {/* Statistics Section with Diagonal Design */}
      <section className="relative py-40 bg-library-purple">
        {/* Top Diagonal Cut */}
        <div className="absolute top-0 left-0 w-full h-24 bg-default-bg transform -skew-y-3 origin-top-left"></div>
        {/* Bottom Diagonal Cut */}
        <div className="absolute bottom-0 right-0 w-full h-24 bg-default-bg transform -skew-y-3 origin-bottom-right"></div>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-white">
              A biblioteca em números
            </h2>
          </div>
          {loadingStats ? (
            <div className="text-center text-white text-xl">Carregando...</div>
          ) : statsError ? (
            <div className="text-center text-red-200 text-xl">{statsError}</div>
          ) : (
            <StatsGrid stats={stats} order={["users", "subareas", "books"]} />
          )}
        </div>
      </section>

      {/* Portal da Transparência Section */}
      <div className="py-24 bg-default-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden flex items-center justify-center bg-gray-100 p-12">
              <TrendingUp className="h-48 w-48 text-cm-blue opacity-20" />
            </div>
            <div>
              <h3>
                Conheça melhor nossos números
              </h3>
              <p>
                Acreditamos que a transparência fortalece a confiança e o engajamento da comunidade. 
                Por isso, disponibilizamos dados e estatísticas atualizadas sobre o funcionamento da biblioteca.
              </p>
              <p>
                Confira gráficos detalhados sobre empréstimos, acervo e usuários. 
                Todos os dados são apresentados de forma agregada, sem expor informações pessoais.
              </p>
              <button className="primary-btn">
                <Link to="/transparencia">Biblioteca em Dados</Link>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-40 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-16">Recursos do site</h2>
          <FeatureCards
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
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
