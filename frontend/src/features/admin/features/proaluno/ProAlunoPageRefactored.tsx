import { useState } from "react";
import { useAdminToast } from "@/features/admin";
import ActionGrid from "@/features/admin/components/ActionGrid";
import BorrowBookForm from "@/features/admin/features/loans/BorrowBookForm";
import ReturnBookForm from "@/features/admin/features/loans/ReturnBookForm";

/**
 * Página Pró-Aluno refatorada com componentes separados.
 * 
 * Componentes:
 * - LoanForm: formulário de empréstimo
 * - ReturnForm: formulário de devolução
 * - SuccessPopup: popup de sucesso unificado
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

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
        <BorrowBookForm 
          onBack={resetForm} 
          onSuccess={(msg: string) => { showSuccess(msg); resetForm(); }}
          onError={(msg: string) => { showError(msg); }}
          adminMode={false}
        />
      )}

      {/* Formulário de Devolução */}

      {operation === "devolucao" && (
        <ReturnBookForm 
          onBack={resetForm} 
          onSuccess={(msg: string) => { showSuccess(msg); resetForm(); }}
          onError={(msg: string) => { showError(msg); }}
        />
      )}

    </div>
  );
};

export default ProAlunoPageRefactored;