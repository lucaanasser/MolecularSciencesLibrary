import { useLocation, Link } from "react-router-dom";
import { logger } from "@/utils/logger";
import { useEffect } from "react";
import { useSiteMode } from "@/contexts/SiteModeContext";
import { Button } from "@/components/ui/button";

// Log de início de renderização da página 404
logger.info("🔵 [PageNotFound] Renderizando página 404");


const PageNotFound = () => {
  const location = useLocation();
  const { isAcademico } = useSiteMode();
  const accentClass = isAcademico ? "academic-blue" : "library-purple";

  useEffect(() => {
    logger.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="content-container flex flex-col md:flex-row items-center gap-4">
        
        <img
          src="/images/NotFound.png"
          alt="Carlos Magno no deserto"
          className="w-auto md:w-full"
        />

        <div className="text-center md:mx-20">
          <h1 className={`text-${accentClass}`}> ERRO 404 </h1>
          <p className="prose-lg text-black font-semibold">
            Uau, está um deserto por aqui...
          </p>
          <p>
             O Carlos Magno procurou e procurou, mas não foi capaz de encontrar a página que você buscava. Talvez ela pertença a um livro que nunca foi devolvido...
          </p>
          <Button 
            asChild
            variant="primary" 
            className={`mt-4 bg-${accentClass}`}>
            <Link to={isAcademico ? "/academico" : "/"}>
              Voltar para a página inicial
            </Link>
          </Button>
        </div>

      </div>
    </main>
  );
};

export default PageNotFound;