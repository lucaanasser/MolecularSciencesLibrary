import LoginForm from "@/components/LoginForm";
import { useSiteMode } from "@/contexts/SiteModeContext";

// Log de início de renderização da página de login
console.log("🔵 [LoginPage] Renderizando página de login");

const LoginPage = () => {
  const { isAcademico } = useSiteMode();
  return (
    <div className="content-container">

      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col items-center">
          
          {/* Imagem de decoração */}
          <img
            src={isAcademico ? "/images/LoginAcademic.png" : "/images/LoginLibrary.png"}
            alt="Login decoration"
            className="w-full max-w-lg h-auto z-0 select-none pointer-events-none"
            style={{ position: 'relative', top: -30}}
          />
          
          {/* Card com formulário de login */}
          <div className="w-full flex justify-center" style={{ position: 'absolute', top: '50%'}}>
            <div className="relative z-10 ">
              <LoginForm />
            </div>
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
