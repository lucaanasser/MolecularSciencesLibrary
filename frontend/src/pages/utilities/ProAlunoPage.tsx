import { useState } from "react";
import { ActionGrid, useAdminToast } from "@/features/admin";
import { BorrowBook, ReturnBook } from "@/features/admin/features/loans";
import { logger } from "@/utils/logger";

// Log de início de renderização da página Pró-Aluno
logger.info("🔵 [ProAlunoPage] Renderizando página Pró-Aluno");

type OperationType = "emprestimo" | "devolucao" | "";

const ProAlunoPage = () => {
  console.log("🔵 [ProAlunoPage] Renderizando página Pró-Aluno");

  // Estados
  const [operation, setOperation] = useState<OperationType>("");
  const { showSuccess, showError } = useAdminToast();
  const resetForm = () => setOperation("");

  const contrastColor = "bg-academic-blue";

  return (
    <div className="content-container">
      <h2>Portal Pró-Aluno</h2>
      <p>Bem-vindo! Aqui você pode registrar empréstimos e devoluções de livros.</p>

      <div className="flex h-[60vh] items-center justify-center">
      {/* Sem operação: imagem centralizada + botões */}
      {!operation && (
        <div className="flex flex-col items-center gap-4">
          <img
            src="/images/ProAluno.png"
            alt="Biblioteca do CM"
            className="h-full max-h-[50vh]"
          />
          <ActionGrid
            columns={2}
            className="w-full max-w-xl"
            actions={[
              {
                label: "Empréstimo",
                onClick: () => setOperation("emprestimo"),
                color: contrastColor,
              },
              {
                label: "Devolução",
                onClick: () => setOperation("devolucao"),
                color: contrastColor,
              },
            ]}
          />
        </div>
      )}

      {/* Com operação: imagem à esquerda, formulário à direita */}
      {operation && (
        <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
          <img
            src="/images/ProAluno.png"
            alt="Biblioteca do CM"
            className="hidden md:block h-[40vh] lg:h-[50vh] w-auto"
          />
          <div className="flex-1">
            {operation === "emprestimo" && (
              <BorrowBook
                onBack={resetForm}
                onSuccess={(msg: string) => { showSuccess(msg); resetForm(); }}
                onError={(msg: string) => { showError(msg); }}
                adminMode={false}
                bgColor={contrastColor}
              />
            )}
            {operation === "devolucao" && (
              <ReturnBook
                onBack={resetForm}
                onSuccess={(msg: string) => { showSuccess(msg); resetForm(); }}
                onError={(msg: string) => { showError(msg); }}
                bgColor={contrastColor}
              />
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProAlunoPage;