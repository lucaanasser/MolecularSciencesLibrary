import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSiteMode } from "@/hooks/useSiteMode";
import ModeSwitcher from "./ModeSwitcher";

/**
 * Barra de navegação principal.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const Navigation: React.FC = () => {
  // Log de início de renderização
  console.log("🔵 [Navigation] Renderizando barra de navegação");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAcademico, isBiblioteca } = useSiteMode();

  // Exibe "Portal Pró-Aluno" sempre que o usuário for proaluno, independente da rota
  const showProAlunoHeader = user?.role?.toLowerCase() === "proaluno";

  // Links baseados no modo atual
  const navLinks = isAcademico
    ? [
        { to: "/academico", label: "Início" },
        { to: "/academico/buscar", label: "Buscar" },
        { to: "/academico/grade", label: "Montar Grade" },
        { to: "/academico/faq", label: "FAQ" },
      ]
    : [
        { to: "/", label: "Início" },
        { to: "/buscar", label: "Buscar" },
        { to: "/estante-virtual", label: "Estante Virtual" },
        { to: "/ajude", label: "Ajude" },
        { to: "/faq", label: "FAQ" },
      ];


  useEffect(() => {
    // Permite scroll branco na home padrão e na home acadêmica
    const isMainPage = location.pathname === "/" || location.pathname === "/academico";
    if (isMainPage) {
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        setIsScrolled(scrollTop > 0);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    console.log("🔵 [Navigation] Logout iniciado");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/entrar");
    console.log("🟢 [Navigation] Logout realizado e redirecionado para login");
  };

  const handleProfileClick = () => {
    if (user?.role === "admin") {
      console.log("🟢 [Navigation] Redirecionando para painel admin");
      navigate("/admin");
    }
    else if (user?.role === "proaluno") {
      console.log("🟢 [Navigation] Redirecionando para painel proaluno");
      navigate("/proaluno");
    }
    else {
      console.log("🟢 [Navigation] Redirecionando para perfil");
      navigate("/perfil");
    }
  };


  // Só permite transição de cor na home padrão e na home acadêmica
  const isMainPage = location.pathname === "/" || location.pathname === "/academico";
  const alwaysPurple = !isMainPage;

  // Cores baseadas no modo
  const primaryColor = isAcademico ? "cm-academic" : "cm-purple";
  const primaryColorClass = isAcademico ? "bg-cm-academic/80" : "bg-cm-purple/80";
  const drawerBgClass = isAcademico ? "bg-cm-academic" : "bg-cm-purple";

  // Navbar branca ao scrollar na home e home acadêmica
  const navbarBg = alwaysPurple ? primaryColorClass : (isScrolled ? "bg-white" : primaryColorClass);
  const textColor = alwaysPurple ? "text-black" : (isScrolled ? "text-gray-900" : "text-black");
  const brandColor = alwaysPurple ? "text-black" : (isScrolled ? `text-${primaryColor}` : "text-black");
  const hoverBg = alwaysPurple ? "hover:bg-white/20" : (isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20");
  const buttonVariant = alwaysPurple ? "ghost" : (isScrolled ? "outline" : "ghost");
  const buttonColors = alwaysPurple
    ? `border-black text-black hover:bg-${primaryColor} hover:text-white`
    : (isScrolled 
      ? `border-${primaryColor} text-${primaryColor} hover:bg-${primaryColor} hover:text-white` 
      : `border-black text-black hover:bg-${primaryColor} hover:text-white`);

  // Força cor correta quando menu mobile está aberto
  const effectiveNavbarBg = isMobileMenuOpen ? primaryColorClass : navbarBg;
  const effectiveTextColor = isMobileMenuOpen ? "text-black" : textColor;

  // Controla visibilidade do drawer para permitir transição
  useEffect(() => {
    if (isMobileMenuOpen && !isDrawerVisible) {
      // Garante que o drawer entra já com translate-x-full, depois ativa translate-x-0
      setIsDrawerVisible(true);
    }
  }, [isMobileMenuOpen]);

  // Estado para controlar a classe e duração de animação
  const [drawerOpenClass, setDrawerOpenClass] = useState('translate-x-full');
  const [drawerTransition, setDrawerTransition] = useState('duration-500'); // mais lento para abrir
  useEffect(() => {
    if (isMobileMenuOpen) {
      setDrawerTransition('duration-700'); // lento para abrir
      const timeout = setTimeout(() => setDrawerOpenClass('translate-x-0'), 10);
      return () => clearTimeout(timeout);
    } else if (isDrawerVisible) {
      setDrawerTransition('duration-500'); // um pouco mais lenta para fechar
      setDrawerOpenClass('translate-x-full');
      const timeout = setTimeout(() => setIsDrawerVisible(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [isMobileMenuOpen, isDrawerVisible]);

  return (
    <nav className={`relative ${effectiveNavbarBg} ${effectiveTextColor} sticky top-0 z-50 w-full transition-colors duration-300`}>
      {/* Fundo branco + camada colorida translúcida apenas se NÃO for index e NÃO for home acadêmica */}
      {(!isMainPage) && (
        <>
          <div className="absolute inset-0 w-full h-full bg-white z-0" />
          <div className={`absolute inset-0 w-full h-full ${primaryColorClass} z-10`} />
        </>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex justify-between h-24">
          <div className="flex items-center gap-4">
            <Link to={isAcademico ? "/academico" : "/"} className="flex items-center">
              <img src={isAcademico ? "/images/logoestendido-academic.png" : "/images/logoestendido.png"} alt="Logo" className="h-20" onError={(e) => { e.currentTarget.src = "/images/logoestendido.png"; }} />
            </Link>
            {/* Mode Switcher */}
            <ModeSwitcher />
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}>
                {link.label}
              </Link>
            ))}
            {showProAlunoHeader && (
              <Link to="/proaluno" className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}>Portal Pró-Aluno</Link>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center px-3 py-2 ${textColor} ${hoverBg}`}>
                    <User size={20} className={isScrolled ? "text-gray-900" : "text-black"} />
                    <span className="ml-2">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white text-neutral-900">
                  <DropdownMenuItem onClick={handleProfileClick} className="hover:bg-neutral-100 focus:bg-neutral-100">
                    {user.role === "admin"
                      ? "Painel Admin"
                      : user.role === "proaluno"
                      ? "Painel PróAluno"
                      : "Perfil"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant={buttonVariant} size="sm" asChild className={buttonColors}>
                <Link to="/entrar"> 
                  <LogIn className="mr-2 h-4 w-4" /> Entrar
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                console.log("🟢 [Navigation] Menu mobile toggled:", !isMobileMenuOpen);
              }}
              className={`${textColor} ${hoverBg}`}
            >
              <Menu size={24} className="text-black" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu lateral (drawer) */}
      {isDrawerVisible && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay escuro para fechar ao clicar fora */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer lateral à direita com transição suave */}
          <div
            className={
              `relative w-64 max-w-[80vw] h-full ${drawerBgClass} text-white shadow-lg ` +
              `transition-transform ease-in-out ` +
              drawerTransition + ' ' +
              drawerOpenClass
            }
            style={{ willChange: 'transform' }}
          >
            {/* Topo do drawer: botão X para fechar e ModeSwitcher */}
            <div className="flex items-center justify-between pt-6 pb-2 pl-4 pr-4">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <span className="text-3xl text-white">×</span>
              </button>
              <ModeSwitcher />
            </div>
            <div className="pt-2 pb-3 px-4 space-y-1 flex-1 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 rounded-md text-white ${hoverBg}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    console.log(`🟢 [Navigation] Menu mobile fechado (${link.label})`);
                  }}
                >
                  {link.label}
                </Link>
              ))}
              {showProAlunoHeader && (
                <Link
                  to="/proaluno"
                  className={`block px-3 py-2 rounded-md font-bold text-white ${hoverBg}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    console.log("🟢 [Navigation] Menu mobile fechado (Pró-Aluno)");
                  }}
                >
                  Portal Pró-Aluno
                </Link>
              )}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleProfileClick();
                      console.log("🟢 [Navigation] Menu mobile fechado (Perfil)");
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-white ${hoverBg}`}
                  >
                    {user.role === "admin"
                      ? "Painel Admin"
                      : user.role === "proaluno"
                      ? "Portal Pró Aluno"
                      : "Perfil"}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                      console.log("🟢 [Navigation] Menu mobile fechado (Sair)");
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-red-200 hover:bg-white/20 hover:text-red-100`}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <div className="pt-1 pb-1 pl-3 flex">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-cm-purple text-cm-purple hover:bg-cm-purple hover:text-white px-3 text-left"
                  >
                    <Link
                      to="/entrar"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        console.log("🟢 [Navigation] Menu mobile fechado (Entrar)");
                      }}
                    >
                      <LogIn className="mr-2 h-4 w-4" /> Entrar
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            {/* Divisória, logo e texto Fale Conosco fixos na parte de baixo do drawer */}
            <div className="absolute left-0 right-0 bottom-0 flex flex-col items-end">
              <hr className="w-[90%] mx-auto border-t border-white/30 mb-2 rounded" />
              <div className="w-[90%] flex justify-center items-center gap-3 mx-auto pb-4">
                <img
                  src="/images/logobiblioteca.png"
                  alt="Logo da Biblioteca"
                  className="h-16 cursor-pointer"
                  style={{ maxWidth: '160px', width: 'auto' }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/404');
                  }}
                />
                <a
                  href="mailto:bibliotecamoleculares@gmail.com"
                  className="text-gray-100 font-medium underline-offset-2 cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Fale Conosco
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
