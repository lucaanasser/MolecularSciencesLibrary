import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { BookOpen, Search, User, TrendingUp, Users, Clock, BookMarked, Lightbulb } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Hook para animar contagem de números
function useCountUp(target: number | null, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) return;
    let start = 0;
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(progress * (target - start) + start);
      setValue(current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);
  return value;
}

// Componente separado para animar os números
type StatsType = { users: number | null, books: number | null, subareas: number | null };
function StatsGrid({ stats }: { stats: StatsType }) {
  const users = useCountUp(stats.users, 1200);
  const subareas = useCountUp(stats.subareas, 1200);
  const books = useCountUp(stats.books, 1200);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-default-bg/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-default-bg" />
          </div>
        </div>
        <p className="bigtext mb-2 font-bold text-default-bg">
          {stats.users == null ? '-' : users}
        </p>
        <p className="bigtext text-default-bg">
          Usuários ativos
        </p>
        <p className="text-default-bg leading-tight">
          Conectando leitores e promovendo o acesso ao conhecimento.
        </p>
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-default-bg/20 flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-default-bg" />
          </div>
        </div>
        <p className="bigtext mb-2 font-bold text-default-bg">
          {stats.subareas == null ? '-' : subareas}
        </p>
        <p className="bigtext text-default-bg">
          Áreas do conhecimento
        </p>
        <p className="text-default-bg leading-tight">
          Navegue pelas disciplinas e descubra conteúdos de diversas especialidades.
        </p>
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-default-bg/20 flex items-center justify-center">
            <BookMarked className="h-8 w-8 text-default-bg" />
          </div>
        </div>
        <p className="bigtext mb-2 font-bold text-default-bg">
          {stats.books == null ? '-' : books}
        </p>
        <p className="bigtext text-default-bg">
          Exemplares disponíveis
        </p>
        <p className="text-default-bg leading-tight">
          Encontre facilmente o livro que procura no nosso acervo organizado.
        </p>
      </div>
    </div>
  );
}

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
  const [areaIndex, setAreaIndex] = useState(0);
  const [displayText, setDisplayText] = useState(HERO_AREAS[0].name);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (typing) {
      if (displayText.length < HERO_AREAS[areaIndex].name.length) {
        timeout = setTimeout(() => {
          setDisplayText(HERO_AREAS[areaIndex].name.slice(0, displayText.length + 1));
        }, 110); // Mais lento para digitar
      } else {
        timeout = setTimeout(() => setTyping(false), 1600); // Pausa maior ao final
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 70); // Mais lento para apagar
      } else {
        setAreaIndex((i) => (i + 1) % HERO_AREAS.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, typing, areaIndex]);

  useEffect(() => {
    if (typing) setDisplayText("");
  }, [areaIndex]);

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
      <div className="py-24 bg-default-bg">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <h3>
                Biblioteca: um espaço que cresce com você
              </h3>
              <p>
                A biblioteca é um lugar de encontros e descobertas. 
                Aqui, cada livro, cada conversa e cada pesquisa ajudam a abrir caminhos para novas ideias e novas possibilidades.
              </p>
              <p>
                Mas para que esse espaço continue vivo e acessível a todos, precisamos de cuidado coletivo. 
                Apoiar a biblioteca é investir no futuro do conhecimento e na oportunidade de aprender juntos.
              </p>
              <button className="primary-btn">
                <Link to="/ajude">Ajude a biblioteca</Link>
              </button>
            </div>
            <div className="relative rounded-2xl overflow-hidden flex items-center justify-center bg-white">
              <img 
                src="/images/prateleira.png" 
                alt="Ciências Moleculares" 
                className="object-contain w-full h-auto max-h-[28rem] md:max-h-[36rem]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section with Diagonal Design */}
      <section className="relative py-40 bg-library-purple">
        {/* Top Diagonal Cut */}
        <div className="absolute top-0 left-0 w-full h-24 bg-default-bg transform -skew-y-3 origin-top-left"></div>
        {/* Bottom Diagonal Cut */}
        <div className="absolute bottom-0 right-0 w-full h-24 bg-default-bg transform -skew-y-3 origin-bottom-right"></div>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-default-bg">
              A biblioteca em números
            </h2>
          </div>
          {loadingStats ? (
            <div className="text-center text-default-bg text-xl">Carregando...</div>
          ) : statsError ? (
            <div className="text-center text-red-200 text-xl">{statsError}</div>
          ) : (
            <StatsGrid stats={stats} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Card 1 */}
            <div className="flex flex-col items-center text-center p-8 bg-default-bg rounded-2xl shadow-md border border-gray-200">
              <div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-red border-8 border-default-bg">
                <Search className="h-10 w-10 text-default-bg" />
              </div>
              <h4>Encontre livros no acervo</h4>
              <p className="smalltext">
                Busque rapidamente por autor, título, tema ou área e descubra tudo o que a biblioteca oferece.
              </p>
              <div className="flex flex-col items-center mb-4">
              </div>
              <button className="wide-btn bg-cm-red">
                <Link to="/buscar">Buscar Livros</Link>
              </button>
            </div>
            {/* Card 2 */}
            <div className="flex flex-col items-center text-center p-8 bg-default-bg rounded-2xl shadow-md border border-gray-200">
              <div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-blue border-8 border-default-bg">
                <User className="h-10 w-10 text-default-bg" />
              </div>
              <h4>Acompanhe seus empréstimos</h4>
              <p className="smalltext">
                Acesse sua área pessoal para renovar livros e consultar prazos de forma simples e rápida.
              </p>
              <div className="flex flex-col items-center mb-4">
              </div>
              <button className="wide-btn bg-cm-blue">
                <Link to="/entrar">Fazer Login</Link>
              </button>
            </div>
            {/* Card 3 */}
            <div className="flex flex-col items-center text-center p-8 bg-default-bg rounded-2xl shadow-md border border-gray-200">
              <div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-green/90 border-8 border-default-bg">
                <BookOpen className="h-10 w-10 text-default-bg" />
              </div>
              <h4>Explore a estante virtual</h4>
              <p className="smalltext">
                Navegue pelo acervo de maneira visual e interativa, como se estivesse dentro da biblioteca.
              </p>
              <div className="flex flex-col items-center mb-4">
              </div>
              <button className="wide-btn bg-cm-green">
                <Link to="/estante-virtual">Explorar Estante</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
