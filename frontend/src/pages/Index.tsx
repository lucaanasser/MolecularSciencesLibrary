import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
          <div className="h-16 w-16 rounded-full bg-cm-bg/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-cm-bg" />
          </div>
        </div>
        <div className="text-4xl font-bold text-cm-bg mb-2">{stats.users == null ? '-' : users}</div>
        <div className="text-xl text-cm-bg/90 mb-4">Usuários ativos</div>
        <div className="text-cm-bg/80 text-md">
          Conectando leitores e promovendo o acesso ao conhecimento.
        </div>
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-cm-bg/20 flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-cm-bg" />
          </div>
        </div>
        <div className="text-4xl font-bold text-cm-bg mb-2">{stats.subareas == null ? '-' : subareas}</div>
        <div className="text-xl text-cm-bg/90 mb-4">Áreas do conhecimento</div>
        <div className="text-cm-bg/80 text-md">
          Navegue pelas disciplinas e descubra conteúdos de diversas especialidades.
        </div>
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-cm-bg/20 flex items-center justify-center">
            <BookMarked className="h-8 w-8 text-cm-bg" />
          </div>
        </div>
        <div className="text-4xl font-bold text-cm-bg mb-2">{stats.books == null ? '-' : books}</div>
        <div className="text-xl text-cm-bg/90 mb-4">Exemplares disponíveis</div>
        <div className="text-cm-bg/80 text-md">
          Encontre facilmente o livro que procura no nosso acervo organizado.
        </div>
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
  { name: "Universo", color: "text-cm-purple" },
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
      <section className="relative min-h-screen flex items-center bg-gradient-to-b from-cm-purple/80 via-cm-purple/10 to-cm-bg">
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
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
            <p className="subtexto text-xl md:text-2xl lg:text-3xl text-gray-700 max-w-2xl mb-10">
              Explore nosso acervo de livros, cuidadosamente selecionado para apoiar seu aprendizado e progresso durante o curso de Ciências Moleculares.
            </p>
            <Button asChild className="botao bg-cm-purple hover:bg-cm-purple/80 text-cm-bg rounded-2xl px-10 py-5 text-xl md:text-2xl font-bold shadow-lg">
              <Link to="/buscar">Explorar Acervo</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Fim Hero Section customizada */}

      {/* About Section */}
      <div className="py-24 bg-cm-bg">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <h2 className="text-4xl mb-6">
                Biblioteca: um espaço que cresce com você
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                A biblioteca é um lugar de encontros e descobertas. 
                Aqui, cada livro, cada conversa e cada pesquisa ajudam a abrir caminhos para novas ideias e novas possibilidades.
              </p>
              <p className="text-gray-600 mb-8 text-lg">
                Mas para que esse espaço continue vivo e acessível a todos, precisamos de cuidado coletivo. 
                Apoiar a biblioteca é investir no futuro do conhecimento e na oportunidade de aprender juntos.
              </p>
              <Button asChild className="bg-cm-purple hover:bg-cm-purple/90 rounded-2xl px-8 py-4 text-lg">
                <Link to="/404">Ajude a biblioteca</Link>
              </Button>
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
      <section className="relative py-40 bg-cm-purple">
        {/* Top Diagonal Cut */}
        <div className="absolute top-0 left-0 w-full h-24 bg-cm-bg transform -skew-y-3 origin-top-left"></div>
        {/* Bottom Diagonal Cut */}
        <div className="absolute bottom-0 right-0 w-full h-24 bg-gray-100 transform -skew-y-3 origin-bottom-right"></div>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl text-cm-bg mb-4">A biblioteca em números</h2>
          </div>
          {loadingStats ? (
            <div className="text-center text-cm-bg text-xl">Carregando...</div>
          ) : statsError ? (
            <div className="text-center text-red-200 text-xl">{statsError}</div>
          ) : (
            <StatsGrid stats={stats} />
          )}
        </div>
      </section>

      {/* Features Section */}
      <div className="py-40 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl text-center mb-16">Recursos do site</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Card 1 */}
            <div className="flex flex-col items-center text-center p-8 bg-cm-bg rounded-2xl shadow-md border border-gray-200">
              <div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-red border-8 border-cm-bg">
                <Search className="h-10 w-10 text-cm-bg" />
              </div>
              <h3 className="text-2xl mb-2">Encontre livros no acervo</h3>
              <p className="text-gray-600 mb-4 text-base">
                Busque rapidamente por autor, título, tema ou área e descubra tudo o que a biblioteca oferece.
              </p>
              <div className="flex flex-col items-center mb-4">
              </div>
              <Button asChild className="w-full bg-cm-red hover:bg-cm-red/80 text-cm-bg rounded-xl font-bold py-3 mt-auto">
                <Link to="/buscar">Buscar Livros</Link>
              </Button>
            </div>
            {/* Card 2 */}
            <div className="flex flex-col items-center text-center p-8 bg-cm-bg rounded-2xl shadow-md border border-gray-200">
              <div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-blue border-8 border-cm-bg">
                <User className="h-10 w-10 text-cm-bg" />
              </div>
              <h3 className="text-2xl mb-2">Acompanhe seus empréstimos</h3>
              <p className="text-gray-600 mb-4 text-base">
                Acesse sua área pessoal para renovar livros e consultar prazos de forma simples e rápida.
              </p>
              <div className="flex flex-col items-center mb-4">
              </div>
              <Button asChild className="w-full bg-cm-blue hover:bg-cm-blue/80 text-cm-bg rounded-xl font-bold py-3 mt-auto">
                <Link to="/entrar">Fazer Login</Link>
              </Button>
            </div>
            {/* Card 3 */}
            <div className="flex flex-col items-center text-center p-8 bg-cm-bg rounded-2xl shadow-md border border-gray-200">
              <div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-green/90 border-8 border-cm-bg">
                <BookOpen className="h-10 w-10 text-cm-bg" />
              </div>
              <h3 className="text-2xl mb-2">Explore a estante virtual</h3>
              <p className="text-gray-600 mb-4 text-base">
                Navegue pelo acervo de maneira visual e interativa, como se estivesse dentro da biblioteca.
              </p>
              <div className="flex flex-col items-center mb-4">
              </div>
              <Button asChild className="w-full bg-cm-green hover:bg-cm-green/80 text-cm-bg rounded-xl font-bold py-3 mt-auto">
                <Link to="/estante-virtual">Explorar Estante</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
