import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

// Log de início de renderização da página Pró-Aluno
logger.info("🔵 [ProAlunoPage] Renderizando página Pró-Aluno");

// Implementar lógica de autenticação/autorização para garantir
// que apenas usuários "Pró-Aluno" possam acessar esta página.



const ProAlunoLoanManagement = () => (
  <>
    <div className="flex justify-center">
      <></>
    </div>
  </>
);

const ProAlunoPage = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Simula o carregamento da página
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  if (!isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando página Pró-Aluno...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="flex-grow bg-default-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bebas text-cm-black">Portal Pró-Aluno</h1>
            <p className="text-lg text-gray-700 mt-2">
              Bem-vindo! Aqui você pode gerenciar empréstimos e devoluções.
            </p>
          </div>

          {/* Seção de Gerenciamento de Empréstimos para Pró-Aluno */}
          <ProAlunoLoanManagement />

        </div>
      </div>
      
    </div>
  );
};

export default ProAlunoPage;