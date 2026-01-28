import { Link } from "react-router-dom";
import { User, LogIn, UserCircle, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeSwitcher } from "../../components/ModeSwitcher";
import { useSiteMode } from "@/hooks/useSiteMode";

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
  const { isAcademico } = useSiteMode();
  if (!user) {
    const bgColor = isAcademico ? "bg-academic-blue-muted hover:bg-academic-blue" : "bg-library-purple-muted hover:bg-library-purple";
    return (
      <div className={isMobile ? "pt-1 pb-1 flex" : ""}>
        <Link
          to="/entrar"
          onClick={onActionClick}
          className={
            isMobile
              ? ` w-full text-left px-3 py-2 rounded-md text-white  hover:bg-white/20 flex items-center gap-2`
              : ` w-full text-left px-3 py-2 rounded-md text-white ${bgColor} flex items-center gap-2`
          }
        >
          <LogIn className="mr-2 h-4 w-4" /> Entrar
        </Link>
      </div>
    );
  }

  // Itens comuns para ambos os menus
  const items = [
    user.role !== "admin" && user.role !== "proaluno"
      ? {
          key: "pagina-pessoal",
          label: "Página Pessoal",
          icon: <UserCircle size={isMobile ? 18 : 16} />,
          onClick: () => {
            onActionClick?.();
            navigate("/minha-pagina");
          },
          className: isMobile
            ? `block w-full text-left px-3 py-2 rounded-md text-white ${hoverBg} flex items-center gap-2`
            : "hover:bg-gray-200 focus:bg-gray-200 flex items-center gap-2",
        }
      : null,
    {
      key: "minha-conta",
      label:
        user.role === "admin"
          ? isMobile ? "Painel Admin" : "Painel Admin"
          : user.role === "proaluno"
          ? isMobile ? "Portal Pró Aluno" : "Painel PróAluno"
          : "Minha Conta",
      icon: <Settings size={isMobile ? 18 : 16} />,
      onClick: () => {
        if (isMobile) onActionClick?.();
        handleProfileClick();
      },
      className: isMobile
        ? `block w-full text-left px-3 py-2 rounded-md text-white ${hoverBg} flex items-center gap-2`
        : "hover:bg-gray-200 focus:bg-gray-200 flex items-center gap-2",
    },
    {
      key: "sair",
      label: "Sair",
      icon: <LogOut className="mr-2" size={isMobile ? 18 : 16} />,
      onClick: () => {
        handleLogout();
        if (isMobile) onActionClick?.();
      },
      className: isMobile
        ? `block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-white/20 flex items-center gap-2`
        : "text-red-600 focus:bg-red-200 focus:text-red-700 flex items-center gap-2",
    },
  ].filter(Boolean);

  if (isMobile) {
    return (
      <>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={item.onClick}
            className={item.className}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
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
        {items.map((item) => (
          <DropdownMenuItem
            key={item.key}
            onClick={item.onClick}
            className={item.className}
          >
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};