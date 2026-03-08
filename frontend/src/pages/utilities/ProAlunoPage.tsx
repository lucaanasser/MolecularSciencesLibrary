import { useState, useEffect } from "react";
import { ActionGrid, useAdminToast } from "@/features/admin";
import { BorrowBook, ReturnBook } from "@/features/admin/features/loans";
import { logger } from "@/utils/logger";


// Log de início de renderização da página Pró-Aluno
logger.info("🔵 [ProAlunoPage] Renderizando página Pró-Aluno");

type OperationType = "emprestimo" | "devolucao" | "";

const ProAlunoPageRefactored = () => {
  console.log("🔵 [ProAlunoPageRefactored] Renderizando página Pró-Aluno (refatorada)");


  // Estados
  const [operation, setOperation] = useState<OperationType>("");
  const { showSuccess, showError } = useAdminToast();


  // Reset do formulário
  const resetForm = () => {
    console.log("🔵 [ProAlunoPageRefactored] Resetando formulário");
    setOperation("");
  };

  return (
    <div className="content-container">
      
      {/* Tela inicial - Escolha de operação */}
      {!operation && (
        <>
        <h2> Portal Pró-Aluno </h2>
        <p> Bem-vindo! Aqui você pode registrar empréstimos e devoluções de livros. </p>
        <div className="flex flex-row gap-4 items-center mx-auto">
            
            { /* Seção de ações */ }
            <div className="w-full">
              <p> 
                O Carlos Magno está prontinho para te ajudar. <br/>
                O que você está procurando?
              </p>
              <ActionGrid
                columns={2}
                actions={[
                  {
                    label: "Empréstimo",
                    onClick: () => {
                      console.log("🔵 [ProAlunoPageRefactored] Selecionado: Empréstimo");
                      setOperation("emprestimo");
                    },
                    color: "bg-library-purple",
                  },
                  {
                    label: "Devolução",
                    onClick: () => {
                      console.log("🔵 [ProAlunoPageRefactored] Selecionado: Devolução");
                      setOperation("devolucao");
                    },
                    color: "bg-library-purple",
                  },
                ]}
              />
            </div>

            {/* Imagem ilustrativa */}
            <img
              src="/images/ProAluno.png"
              alt="Biblioteca do CM"
              className="max-w-2xl "
            />
          </div>
        </>
      )}

      {/* Formulário de Empréstimo */}

      {operation === "emprestimo" && (
        <BorrowBook
          onBack={resetForm} 
          onSuccess={(msg: string) => { showSuccess(msg); resetForm(); }}
          onError={(msg: string) => { showError(msg); }}
          adminMode={false}
        />
      )}

      {/* Formulário de Devolução */}

      {operation === "devolucao" && (
        <ReturnBook
          onBack={resetForm} 
          onSuccess={(msg: string) => { showSuccess(msg); resetForm(); }}
          onError={(msg: string) => { showError(msg); }}
        />
      )}

    </div>
  );
};

export default ProAlunoPageRefactored;