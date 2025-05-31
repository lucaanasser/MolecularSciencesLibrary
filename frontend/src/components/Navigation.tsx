import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, User, LogIn } from "lucide-react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    console.log("🔵 [Navigation] Logout iniciado");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
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
      navigate("/profile");
    }
  };

  const navbarBg = isScrolled ? "bg-cm-bg" : "bg-cm-purple/50";
  const textColor = isScrolled ? "text-gray-900" : "text-white";
  const brandColor = isScrolled ? "text-cm-purple" : "text-white";
  const hoverBg = isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20";
  const buttonVariant = isScrolled ? "outline" : "ghost";
  const buttonColors = isScrolled 
    ? "border-cm-purple text-cm-purple hover:bg-cm-purple hover:text-white" 
    : "border-white text-white hover:bg-white hover:text-cm-purple";

  return (
    <nav className={`${navbarBg} ${textColor} sticky top-0 z-50 w-full transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className={`ml-2 text-2xl font-bebas ${brandColor}`}>Biblioteca do Ciências moleculares</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}>
              Início
            </Link>
            <Link to="/search" className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}>
              Buscar
            </Link>
            <Link to="/virtual-shelf" className={`px-3 py-2 rounded-md ${textColor} ${hoverBg}`}>
              Estante Virtual
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center px-3 py-2 ${textColor} ${hoverBg}`}>
                    <User size={20} className={isScrolled ? "text-gray-900" : "text-white"} />
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
                  <DropdownMenuItem className="hover:bg-neutral-100 focus:bg-neutral-100">
                    <Link to="/history" className="w-full">Histórico</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant={buttonVariant} size="sm" asChild className={buttonColors}>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Entrar
                </Link>
              </Button>
            )}
            <Button size="sm" variant="ghost" className={`${textColor} ${hoverBg}`}>
              <Search size={20} className={isScrolled ? "text-gray-900" : "text-white"} />
            </Button>
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
              <Menu size={24} className={isScrolled ? "text-gray-900" : "text-white"} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden p-2 ${navbarBg} ${textColor}`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md ${textColor} ${hoverBg}`}
              onClick={() => {
                setIsMobileMenuOpen(false);
                console.log("🟢 [Navigation] Menu mobile fechado (Início)");
              }}
            >
              Início
            </Link>
            <Link
              to="/search"
              className={`block px-3 py-2 rounded-md ${textColor} ${hoverBg}`}
              onClick={() => {
                setIsMobileMenuOpen(false);
                console.log("🟢 [Navigation] Menu mobile fechado (Buscar)");
              }}
            >
              Buscar
            </Link>
            <Link
              to="/virtual-shelf"
              className={`block px-3 py-2 rounded-md ${textColor} ${hoverBg}`}
              onClick={() => {
                setIsMobileMenuOpen(false);
                console.log("🟢 [Navigation] Menu mobile fechado (Estante Virtual)");
              }}
            >
              Estante Virtual
            </Link>
            {user ? (
              <>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleProfileClick();
                    console.log("🟢 [Navigation] Menu mobile fechado (Perfil)");
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md ${textColor} ${hoverBg}`}
                >
                  {user.role === "admin"
                    ? "Painel Admin"
                    : user.role === "proaluno"
                    ? "Painel PróAluno"
                    : "Perfil"}
                </button>
                <Link
                  to="/history"
                  className={`block px-3 py-2 rounded-md ${textColor} ${hoverBg}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    console.log("🟢 [Navigation] Menu mobile fechado (Histórico)");
                  }}
                >
                  Histórico
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                    console.log("🟢 [Navigation] Menu mobile fechado (Sair)");
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md ${isScrolled ? "text-red-600 hover:bg-red-50" : "text-red-300 hover:bg-white/20 hover:text-red-200"}`}
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`block px-3 py-2 rounded-md ${textColor} ${hoverBg}`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  console.log("🟢 [Navigation] Menu mobile fechado (Entrar)");
                }}
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
