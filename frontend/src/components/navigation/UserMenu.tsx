import { Link } from "react-router-dom";
import { User, LogIn, UserCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: any;
  textColor: string;
  hoverBg: string;
  buttonVariant: "ghost" | "outline";
  buttonColors: string;
  isScrolled: boolean;
  isMobile?: boolean;
  onActionClick?: () => void;
  handleProfileClick: () => void;
  handleLogout: () => void;
  navigate: (path: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  textColor,
  hoverBg,
  buttonVariant,
  buttonColors,
  isScrolled,
  isMobile = false,
  onActionClick,
  handleProfileClick,
  handleLogout,
  navigate
}) => {
  if (user) {
    if (isMobile) {
      return (
        <>
          {user.role !== "admin" && user.role !== "proaluno" && (
            <button
              onClick={() => {
                onActionClick?.();
                navigate("/minha-pagina");
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-white ${hoverBg} flex items-center gap-2`}
            >
              <UserCircle size={18} />
              Página Pessoal
            </button>
          )}
          <button
            onClick={() => {
              onActionClick?.();
              handleProfileClick();
            }}
            className={`block w-full text-left px-3 py-2 rounded-md text-white ${hoverBg} flex items-center gap-2`}
          >
            <Settings size={18} />
            {user.role === "admin"
              ? "Painel Admin"
              : user.role === "proaluno"
              ? "Portal Pró Aluno"
              : "Minha Conta"}
          </button>
          <button
            onClick={() => {
              handleLogout();
              onActionClick?.();
            }}
            className={`block w-full text-left px-3 py-2 rounded-md hover:bg-white/20`}
          >
            Sair
          </button>
        </>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={`flex items-center px-3 py-2 ${textColor} ${hoverBg}`}>
            <User size={20} className={isScrolled ? "text-gray-900" : "text-black"} />
            <span className="ml-2">{user.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white text-neutral-900 min-w-[180px]">
          {user.role !== "admin" && user.role !== "proaluno" && (
            <DropdownMenuItem 
              onClick={() => navigate("/minha-pagina")}
              className="hover:bg-neutral-100 focus:bg-neutral-100 flex items-center gap-2"
            >
              <UserCircle size={16} />
              Página Pessoal
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={handleProfileClick} 
            className="hover:bg-neutral-100 focus:bg-neutral-100 flex items-center gap-2"
          >
            <Settings size={16} />
            {user.role === "admin"
              ? "Painel Admin"
              : user.role === "proaluno"
              ? "Painel PróAluno"
              : "Minha Conta"}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700"
          >
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={isMobile ? "pt-1 pb-1 pl-3 flex" : ""}>
      <Button variant={buttonVariant} size="sm" asChild className={buttonColors}>
        <Link to="/entrar" onClick={onActionClick}>
          <LogIn className="mr-2 h-4 w-4" /> Entrar
        </Link>
      </Button>
    </div>
  );
};