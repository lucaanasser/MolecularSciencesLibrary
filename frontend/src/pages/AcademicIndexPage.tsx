import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, Search, Calendar, Users, BookOpen, Lightbulb } from "lucide-react";
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
type StatsType = { users: number | null, disciplines: number | null, areas: number | null };
function StatsGrid({ stats }: { stats: StatsType }) {
  const users = useCountUp(stats.users, 1200);
  const disciplines = useCountUp(stats.disciplines, 1200);
  const areas = useCountUp(stats.areas, 1200);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-cm-bg/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-cm-bg" />
          </div>
        </div>
        <div className="text-4xl font-bold text-cm-bg mb-2">{stats.users == null ? '-' : users}</div>
        <div className="text-xl text-cm-bg/90 mb-4">Alunos no Ciclo Avançado</div>
        <div className="text-cm-bg/80 text-md">
          Conectando estudantes e promovendo colaboração acadêmica.
        </div>
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-cm-bg/20 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-cm-bg" />
          </div>
        </div>
        <div className="text-4xl font-bold text-cm-bg mb-2">{stats.disciplines == null ? '-' : disciplines}</div>
        <div className="text-xl text-cm-bg/90 mb-4">Disciplinas disponíveis</div>
        <div className="text-cm-bg/80 text-md">
          Catálogo completo de disciplinas para seu planejamento.
        </div>
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-cm-bg/20 flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-cm-bg" />
          </div>
        </div>
        <div className="text-4xl font-bold text-cm-bg mb-2">{stats.areas == null ? '-' : areas}</div>
        <div className="text-xl text-cm-bg/90 mb-4">Áreas de concentração</div>
        <div className="text-cm-bg/80 text-md">
          Escolha sua especialização e trace seu caminho.
        </div>
      </div>
    </div>
  );
}

// Log de início de renderização da página inicial acadêmica
console.log("🔵 [AcademicIndex] Renderizando página inicial acadêmica");

// Perguntas ilustrativas
const SUGGESTIONS = [
  "como faço para encontrar um orientador?",
  "como faço para montar minha grade?",
  "como faço para cursar disciplinas da pós?",
  "onde encontrar os horários das disciplinas?",
  "onde encontrar os contatos dos professores?",
  "é possível me formar ou estou fadado a virar uma capivara na raia?"
];

// Sequência de digitação simulada
const TYPED_SEQUENCES = [
  { text: "como faço para", suggestions: SUGGESTIONS.filter(q => q.toLowerCase().startsWith("como faço para")).slice(0, 3) },
  { text: "onde encontrar", suggestions: SUGGESTIONS.filter(q => q.toLowerCase().startsWith("onde encontrar")).slice(0, 3) },
  { text: "é possível", suggestions: SUGGESTIONS.filter(q => q.toLowerCase().startsWith("é possível")).slice(0, 3) }
];

const AcademicIndexPage = () => {
  // Estados para digitação simulada
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState(0); // 0: "como", 1: "onde encontrar", 2: "é possível"
  const [showOptions, setShowOptions] = useState(false);

  // Efeito de digitação automática para cada sequência
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentSeq = TYPED_SEQUENCES[phase];
    if (typed.length < currentSeq.text.length) {
      // Mostra sugestões apenas após 2 letras digitadas
      if (typed.length >= 2) setShowOptions(true);
      else setShowOptions(false);
      timeout = setTimeout(() => {
        setTyped(currentSeq.text.slice(0, typed.length + 1));
      }, 140);
    } else {
      setShowOptions(true);
      timeout = setTimeout(() => {
        setShowOptions(false);
        setTyped("");
        setPhase((prev) => (prev + 1) % TYPED_SEQUENCES.length);
      }, 2200);
    }
    return () => clearTimeout(timeout);
  }, [typed, phase]);

  // Estados para estatísticas (placeholder por enquanto)
  const [stats, setStats] = useState<StatsType>({ users: 45, disciplines: 120, areas: 6 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      {/* Hero Section - Academic */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-b from-cm-academic/80 via-cm-academic/10 to-cm-bg">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-4 md:gap-8 flex-1">
          {/* Content - Janela de busca estilo Google com aba CM */}
          <div className="flex-1 flex flex-col items-center justify-center order-2 md:order-1">
            <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-2xl py-24 px-8 flex flex-col items-center border border-gray-200 relative">
              {/* Falsa abinha superior à esquerda */}
              <div className="absolute left-5 -top-8 z-0">
                <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M0 30 Q15 12 30 10 H145 Q160 10 175 30 V60 H0 Z"
                    fill="#e5e7eb"
                    stroke="#d1d5db"
                    strokeWidth="1"
                  />
                </svg>
                <div className="absolute top-3 right-6 text-sm font-semibold text-gray-400 select-none">x</div>
              </div>
              {/* Falsa barra superior */}
              <div className="absolute left-0 top-0 w-full h-12 flex items-center px-6 rounded-t-2xl bg-gray-100 border-b border-gray-300 z-10"
                   style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                {/* Setinhas fake */}
                <div className="flex items-center gap-2">
                  <span className="inline-block text-gray-400 text-lg font-bold select-none">&larr;</span>
                  <span className="inline-block px-2 text-gray-400 text-lg font-bold select-none">&rarr;</span>
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="bg-white w-full px-4 py-1 rounded text-gray-400 text-sm select-none shadow-sm border border-gray-200 text-center">
                    https://molecoogle.com
                  </span>
                </div>
              </div>
              {/* Espaço para aba */}
              <div style={{ height: "1rem" }} />
              {/* Logo fake Molecoogle */}
              <div className="flex items-center gap-1 mb-8 mt-2">
                <span className="text-3xl font-bold text-[#4285F4]">M</span>
                <span className="text-3xl font-bold text-[#EA4335]">o</span>
                <span className="text-3xl font-bold text-[#FBBC05]">l</span>
                <span className="text-3xl font-bold text-[#4285F4]">e</span>
                <span className="text-3xl font-bold text-[#34A853]">c</span>
                <span className="text-3xl font-bold text-[#EA4335]">o</span>
                <span className="text-3xl font-bold text-[#4285F4]">o</span>
                <span className="text-3xl font-bold text-[#FBBC05]">g</span>
                <span className="text-3xl font-bold text-[#34A853]">l</span>
                <span className="text-3xl font-bold text-[#EA4335]">e</span>
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full">
                  <input
                    type="text"
                    className="w-full px-6 py-4 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-cm-academic text-xl bg-gray-50"
                    value={typed}
                    readOnly
                    placeholder="Faça uma pergunta..."
                    autoComplete="off"
                  />
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-6 h-6" />
                  </span>
                  {/* Autocomplete options */}
                  {showOptions && (
                    <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                      {TYPED_SEQUENCES[phase].suggestions.map((option) => {
                        const typedLower = typed.toLowerCase();
                        const optionLower = option.toLowerCase();
                        const startIdx = optionLower.indexOf(typedLower);
                        let before = startIdx >= 0 ? option.slice(0, startIdx) : "";
                        let match = startIdx >= 0 ? option.slice(startIdx, startIdx + typed.length) : "";
                        let after = startIdx >= 0 ? option.slice(startIdx + typed.length) : option;

                        // Remove espaço extra entre bold e o restante
                        let afterWithSpace = after;
                        if (
                          afterWithSpace &&
                          match &&
                          match.length > 0 &&
                          match[match.length - 1] === " " &&
                          afterWithSpace[0] === " "
                        ) {
                          afterWithSpace = afterWithSpace.slice(1);
                        }

                        return (
                          <li key={option} className="px-6 py-3 text-gray-700">
                            {startIdx >= 0 ? (
                              <>
                                {before}
                                <span className="font-bold whitespace-nowrap">{match}</span>
                                {afterWithSpace}
                              </>
                            ) : (
                              option
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Logo */}
          <div className="flex-1 flex justify-center order-1 md:order-2 md:mb-0">
            <img
              src="/images/home.png"
              alt="Ciências Moleculares"
              className="w-80 md:w-[34rem] lg:w-[40rem] h-auto"
            />
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
                Ciclo Avançado: sua jornada de especialização
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                O Ciclo Avançado do Ciências Moleculares é o momento de escolher sua área de concentração
                e aprofundar seus conhecimentos em disciplinas específicas de diferentes institutos da USP.
              </p>
              <p className="text-gray-600 mb-8 text-lg">
                Esta plataforma foi criada para ajudar você a navegar pelas opções disponíveis,
                montar sua grade de horários e conectar-se com outros estudantes do curso.
              </p>
              <Button asChild className="bg-cm-academic hover:bg-cm-academic/90 rounded-2xl px-8 py-4 text-lg">
                <Link to="/academico/faq">Saiba mais</Link>
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
      <section className="relative py-40 bg-cm-academic">
        {/* Top Diagonal Cut */}
        <div className="absolute top-0 left-0 w-full h-24 bg-cm-bg transform -skew-y-3 origin-top-left"></div>
        {/* Bottom Diagonal Cut */}
        <div className="absolute bottom-0 right-0 w-full h-24 bg-gray-100 transform -skew-y-3 origin-bottom-right"></div>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl text-cm-bg mb-4">O Ciclo Avançado em números</h2>
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
          <h2 className="text-5xl text-center mb-16">Recursos disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Card 1 */}
            <div className="flex flex-col items-center text-center p-8 bg-cm-bg rounded-2xl shadow-md border border-gray-200">
              <div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-academic border-8 border-cm-bg">
                <Search className="h-10 w-10 text-cm-bg" />
              </div>
              <h3 className="text-2xl mb-2">Busque disciplinas</h3>
              <p className="text-gray-600 mb-4 text-base">
                Encontre disciplinas por área, instituto, horário ou palavras-chave.
              </p>
              <div className="flex flex-col items-center mb-4">
              </div>
              <Button asChild className="w-full bg-cm-academic hover:bg-cm-academic/80 text-cm-bg rounded-xl font-bold py-3 mt-auto">
                <Link to="/academico/buscar">Buscar Disciplinas</Link>
              </Button>
            </div>
            {/* Card 2 */}
            <div className="flex flex-col items-center text-center p-8 bg-cm-bg rounded-2xl shadow-md border border-gray-200">
              <div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-academic-light border-8 border-cm-bg">
                <Calendar className="h-10 w-10 text-cm-bg" />
              </div>
              <h3 className="text-2xl mb-2">Monte sua grade</h3>
              <p className="text-gray-600 mb-4 text-base">
                Organize suas disciplinas visualmente e evite conflitos de horário.
              </p>
              <div className="flex flex-col items-center mb-4">
              </div>
              <Button asChild className="w-full bg-cm-academic-light hover:bg-cm-academic-light/80 text-cm-bg rounded-xl font-bold py-3 mt-auto">
                <Link to="/academico/grade">Montar Grade</Link>
              </Button>
            </div>
            {/* Card 3 */}
            <div className="flex flex-col items-center text-center p-8 bg-cm-bg rounded-2xl shadow-md border border-gray-200">
              <div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-academic-dark border-8 border-cm-bg">
                <GraduationCap className="h-10 w-10 text-cm-bg" />
              </div>
              <h3 className="text-2xl mb-2">Tire suas dúvidas</h3>
              <p className="text-gray-600 mb-4 text-base">
                Encontre respostas sobre o Ciclo Avançado no nosso FAQ.
              </p>
              <div className="flex flex-col items-center mb-4">
              </div>
              <Button asChild className="w-full bg-cm-academic-dark hover:bg-cm-academic-dark/80 text-cm-bg rounded-xl font-bold py-3 mt-auto">
                <Link to="/academico/faq">Ver FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AcademicIndexPage;
