import { useState } from "react";
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
  const user = useCurrentUser();
  const navigate = useNavigate();

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

  return (
    <div className="p-3 md:p-4 sticky top-0 z-50"> {/* Wrapper for "floating" effect and sticky positioning */}
      <nav className="bg-cm-purple text-white rounded-full shadow-xl max-w-7xl mx-auto"> {/* Navbar styling */}
        <div className="px-4 sm:px-6 lg:px-8"> {/* Inner padding */}
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src="/images/logoCM.png"
                  alt="CM Logo"
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-xl font-bebas text-white">Biblioteca CM</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-white hover:bg-white/20">
                Início
              </Link>
              <Link to="/search" className="px-3 py-2 rounded-md text-white hover:bg-white/20">
                Buscar
              </Link>
              <Link to="/virtual-shelf" className="px-3 py-2 rounded-md text-white hover:bg-white/20">
                Estante Virtual
              </Link>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center px-3 py-2 text-white hover:bg-white/20">
                      <User size={20} className="text-white" />
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
                <Button variant="outline" size="sm" asChild className="border-white text-white hover:bg-white hover:text-cm-purple">
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Entrar
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                <Search size={20} className="text-white" />
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
                className="text-white hover:bg-white/20"
              >
                <Menu size={24} className="text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden p-2 bg-cm-purple text-white"> {/* Removed rounded-b-xl */}
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-white hover:bg-white/20"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  console.log("🟢 [Navigation] Menu mobile fechado (Início)");
                }}
              >
                Início
              </Link>
              <Link
                to="/search"
                className="block px-3 py-2 rounded-md text-white hover:bg-white/20"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  console.log("🟢 [Navigation] Menu mobile fechado (Buscar)");
                }}
              >
                Buscar
              </Link>
              <Link
                to="/virtual-shelf"
                className="block px-3 py-2 rounded-md text-white hover:bg-white/20"
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
                    className="block w-full text-left px-3 py-2 rounded-md text-white hover:bg-white/20"
                  >
                    {user.role === "admin"
                      ? "Painel Admin"
                      : user.role === "proaluno"
                      ? "Painel PróAluno"
                      : "Perfil"}
                  </button>
                  <Link
                    to="/history"
                    className="block px-3 py-2 rounded-md text-white hover:bg-white/20"
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
                    className="block w-full text-left px-3 py-2 rounded-md text-red-300 hover:bg-white/20 hover:text-red-200"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-white hover:bg-white/20"
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
    </div>
  );
};

export default Navigation;
