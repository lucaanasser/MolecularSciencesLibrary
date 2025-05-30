import { useLocation } from "react-router-dom";
import { useEffect } from "react";

// Log de início de renderização da página 404
console.log("🔵 [NotFound] Renderizando página 404");

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-16">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-5xl">
        <img
          src="/images/brain-404.svg"
          alt="Cérebro com coroa"
          className="w-[18rem] h-[18rem] md:w-[22rem] md:h-[22rem] lg:w-[26rem] lg:h-[26rem] md:flex-[1.5]"
        />
        <div className="text-center md:flex-[3.5] mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cm-purple mb-4">
            ERRO 404
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-black mb-6 leading-tight">
            OOPS... ESSA PÁGINA
            <br />
            PARECE SER DE UM LIVRO
            <br />
            QUE NUNCA FOI DEVOLVIDO
          </p>
          <p className="text-base md:text-lg lg:text-xl text-black mb-4">
            MAS NÃO ENTRE EM PÂNICO!
            <br />
            O CARLOS MAGNO PODE TE AJUDAR A ACHAR
            <br />
            MUITOS OUTROS LIVROS NO ACERVO
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-4 py-3 text-base md:text-lg bg-cm-purple text-white rounded-2xl transition font-semibold shadow-lg"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
