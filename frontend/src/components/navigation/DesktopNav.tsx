import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, LogIn, UserCircle, Settings, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "@/types/user";
import { ROUTES } from "@/constants/navigation";
import ModeSwitcher from "./ModeSwitcher";
import { cn } from "@/lib/utils";
import { useHeaderState } from "@/hooks/useHeaderState";

interface DesktopNavProps {
  user: User | null;
  headerState: ReturnType<typeof useHeaderState>;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ user, headerState }) => {
  const navigate = useNavigate();
  const { 
    navLinks, 
    showProAlunoHeader, 
    textColor, 
    hoverBg, 
    linkStyle,
    navigateToProfile, 
    handleLogout,
    getPageLabel,
    isRegularUser,
  } = headerState;


  return (
    <>
      { /* Logo e ModeSwitcher */ }
      <div className="flex items-center gap-4">
        <Link to={navLinks[0].to} className="flex items-center">
          <img src="/images/logos/logoHorizontal.png" alt="Logo" className="h-20 hidden lg:block" />
          <img src="/images/logos/logoCompacto.png" alt="Logo" className="h-20 block lg:hidden" />
        </Link>
        <ModeSwitcher />
      </div>

      <div className="hidden md:flex md:items-center md:space-x-4">

        { /* Links de navegação */ }
        {navLinks.map(link => (
          <Link 
            key={link.to} 
            to={link.to} 
            className={cn(linkStyle, textColor, hoverBg)}
          >
            {link.label}
          </Link>
        ))}
        {showProAlunoHeader && (
          <Link 
            to={ROUTES.PROALUNO} 
            className={cn(linkStyle, textColor, hoverBg)}
          >
            Portal Pró-Aluno
          </Link>
        )}

        { /* Menu do usuário */ }
        {user ? (
          <DropdownMenu>
            
            { /* Trigger: nome do usuário */ }
            <DropdownMenuTrigger asChild>
              <button className={cn(linkStyle, textColor, hoverBg)}>
                <UserIcon size={20} className={textColor} />
                <span className="ml-2">{user.name}</span>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className={cn("min-w-[180px]", textColor)}>
              
              { /* Itens do menu */ }
              {isRegularUser(user) && (
                <DropdownMenuItem onClick={() => navigate(ROUTES.MY_PAGE)} className="gap-2">
                  <UserCircle size={16} /> Página Pessoal
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={navigateToProfile} className="gap-2">
                <Settings size={16} /> {getPageLabel(user)}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-cm-red focus:text-cm-red focus:bg-cm-red/20">
                <LogOut size={16} /> Sair
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>
        ) : (
          <>
          { /* Link de login */ }
          <Link
            to={ROUTES.LOGIN}
            className={cn(
              "px-3 py-2 rounded-md text-white flex items-center gap-2 secondary-bg hover:primary-bg"
            )}
          >
            <LogIn size={16} /> Entrar
          </Link>
          </>
        )}

      </div>
    </>
  );
};
