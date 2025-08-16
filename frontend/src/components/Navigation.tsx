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


  useEffect(() => {
    if (location.pathname === "/") {
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        setIsScrolled(scrollTop > 0);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(false); // sempre roxo nas outras páginas
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


  // Só permite transição de cor na home, nas demais páginas sempre roxo
  const alwaysPurple = location.pathname !== "/";
  const navbarBg = alwaysPurple ? "bg-cm-purple/80" : (isScrolled ? "bg-cm-bg" : "bg-cm-purple/80");
  const textColor = alwaysPurple ? "text-black" : (isScrolled ? "text-gray-900" : "text-black");
  const brandColor = alwaysPurple ? "text-black" : (isScrolled ? "text-cm-purple" : "text-black");
  const hoverBg = alwaysPurple ? "hover:bg-white/20" : (isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20");
  const buttonVariant = alwaysPurple ? "ghost" : (isScrolled ? "outline" : "ghost");
  const buttonColors = alwaysPurple
    ? "border-black text-black hover:bg-cm-purple hover:text-white"
    : (isScrolled 
      ? "border-cm-purple text-cm-purple hover:bg-cm-purple hover:text-white" 
      : "border-black text-black hover:bg-cm-purple hover:text-white");

  // Força cor roxa correta quando menu mobile está aberto
  const effectiveNavbarBg = isMobileMenuOpen ? "bg-cm-purple/80" : navbarBg;
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
      {/* Fundo branco + camada roxa translúcida apenas se NÃO for index */}
      {location.pathname !== "/" && (
        <>
          <div className="absolute inset-0 w-full h-full bg-white z-0" />
          <div className="absolute inset-0 w-full h-full bg-cm-purple/80 z-10" />
        </>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img  src="images/logoestendido.png" alt="Logo da Biblioteca" className="h-20" />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}>
              Início
            </Link>
            <Link to="/buscar" className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}> 
              Buscar
            </Link>
            <Link to="/estante-virtual" className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}> 
              Estante Virtual
            </Link>
            <Link to="/faq" className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}> 
              FAQ
            </Link>
            {/*
            <Link to="/ajude" className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}>
              Ajude a Biblioteca
            </Link>
            */}
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
              `relative w-64 max-w-[80vw] h-full bg-cm-purple text-white shadow-lg ` +
              `transition-transform ease-in-out ` +
              drawerTransition + ' ' +
              drawerOpenClass
            }
            style={{ willChange: 'transform' }}
          >
            {/* Topo do drawer: botão X para fechar */}
            <div className="flex items-center justify-start pt-6 pb-2 pl-4 pr-2">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <span className="text-3xl text-white">×</span>
              </button>
            </div>
            <div className="pt-2 pb-3 px-4 space-y-1 flex-1 flex flex-col">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-white ${hoverBg}`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  console.log("🟢 [Navigation] Menu mobile fechado (Início)");
                }}
              >
                Início
              </Link>
              <Link
                to="/buscar"
                className={`block px-3 py-2 rounded-md text-white ${hoverBg}`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  console.log("🟢 [Navigation] Menu mobile fechado (Buscar)");
                }}
              >
                Buscar
              </Link>
              <Link
                to="/estante-virtual"
                className={`block px-3 py-2 rounded-md text-white ${hoverBg}`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  console.log("🟢 [Navigation] Menu mobile fechado (Estante Virtual)");
                }}
              >
                Estante Virtual
              </Link>
              <Link
                to="/ajude"
                className={`block px-3 py-2 rounded-md text-white ${hoverBg}`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  console.log("🟢 [Navigation] Menu mobile fechado (Ajude)");
                }}
              >
                Ajude a Biblioteca
              </Link>
              <Link
                to="/faq"
                className={`block px-3 py-2 rounded-md text-white ${hoverBg}`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  console.log("🟢 [Navigation] Menu mobile fechado (FAQ)");
                }}
              >
                FAQ
              </Link>
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
                      ? "Painel PróAluno"
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
                  src="/images/LogoBrancoBiblioteca.png"
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
