
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/images/logoCM.png"
                alt="CM Logo"
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-bebas">Biblioteca CM</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Início
            </Link>
            <Link to="/search" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Buscar
            </Link>
            <Link to="/virtual-shelf" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Estante Virtual
            </Link>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link to="/profile" className="w-full">Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/history" className="w-full">Histórico</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      onClick={() => setIsLoggedIn(false)}
                      className="w-full text-left"
                    >
                      Sair
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Entrar
                </Link>
              </Button>
            )}
            <Button size="sm" variant="ghost">
              <Search size={20} />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden p-2">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/search"
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buscar
            </Link>
            <Link
              to="/virtual-shelf"
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Estante Virtual
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Perfil
                </Link>
                <Link
                  to="/history"
                  className="block px-3 py-2 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Histórico
                </Link>
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
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
