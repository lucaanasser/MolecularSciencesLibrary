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
    <main className="min-h-screen flex items-center justify-center bg-default-bg px-4 md:px-16">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-5xl">
        <img
          src="/images/erro404.svg"
          alt="Cérebro com coroa"
          className="w-40 h-40 xs:w-52 xs:h-52 md:w-[22rem] md:h-[22rem] lg:w-[26rem] lg:h-[26rem] md:flex-[1.5] mb-4 md:mb-0"
        />
        <div className="text-center md:flex-[3.5] mx-auto w-full max-w-xs xs:max-w-sm md:max-w-full">
          <h1 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-library-purple mb-4">
            ERRO 404
          </h1>
          <p className="text-lg xs:text-xl md:text-2xl lg:text-3xl font-bold text-black mb-6 leading-tight">
            OOPS... ESSA PÁGINA
            <br />
            PARECE SER DE UM LIVRO
            <br />
            QUE NUNCA FOI DEVOLVIDO
          </p>
          <p className="text-sm xs:text-base md:text-lg lg:text-xl text-black mb-4">
            <a
              href="https://en.wikipedia.org/wiki/Towel"
              target="_blank"
              rel="noopener noreferrer"
              className=" hover:text-library-purple transition"
            >
              Não entre em pânico!
            </a>
            <br />
            O Carlos Magno pode te ajudar a achar
            <br />
            muitos outros livros no acervo.
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-4 py-3 text-sm xs:text-base md:text-lg bg-library-purple text-default-bg rounded-2xl transition font-semibold shadow-lg"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
