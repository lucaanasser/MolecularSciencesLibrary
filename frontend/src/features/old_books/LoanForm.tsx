/* DEPRECATED */ 

import * as React from "react";
import { useCreateLoan } from "./useCreateLoan";

/**
 * Formulário para registrar novo empréstimo.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

export default function LoanForm({ nusp: propNusp = "", codigoLivro: propCodigoLivro = "", senha: propSenha = "", isAdminMode = false, onSuccess }: { nusp?: string; codigoLivro?: string; senha?: string; isAdminMode?: boolean; onSuccess?: () => void }) {
  const { createLoan, loading, error, loan } = useCreateLoan();
  const [formError, setFormError] = React.useState<string>("");
  const [successMsg, setSuccessMsg] = React.useState<string>("");
  const [nusp, setNusp] = React.useState<string>(propNusp);
  const [codigoLivro, setCodigoLivro] = React.useState<string>(propCodigoLivro);
  const [senha, setSenha] = React.useState<string>(propSenha);
  const [showPopup, setShowPopup] = React.useState(false);
  const [loanDetails, setLoanDetails] = React.useState<any>(null);
  const [step, setStep] = React.useState<number>(0); // 0: escolha, 1+: wizard
  const [operation, setOperation] = React.useState<"emprestimo" | "devolucao" | "">("");
  const [returnSuccess, setReturnSuccess] = React.useState(false);


  async function buscarUsuarioPorNusp(nusp: string) {
 
    try {
      const res = await fetch(`/api/users`);
      if (res.ok) {
        const usuarios = await res.json();
        return usuarios.find((u: any) => String(u.NUSP) === String(nusp));
      }
      return null;
    } catch {
      return null;
    }
  }

  async function validarSenha(nusp: string, senha: string) {

    try {
      const res = await fetch(`/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NUSP: nusp, password: senha })
      });
      if (res.ok) {
        const data = await res.json();
        return !!data && data.token;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function validarLivro(codigoLivro: string) {
    // ...existing code...
    try {
      const res = await fetch(`/api/books/${codigoLivro}`);
      if (res.ok) {
        const livro = await res.json();
        return !!livro && livro.available !== false;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function processarDevolucao(codigoLivro: string) {
    try {
      // Chama a API de devolução real
      const res = await fetch(`/api/loans/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: Number(codigoLivro) })
      });
      if (res.ok) {
        setReturnSuccess(true);
        setShowPopup(true);
      } else {
        const data = await res.json();
        setFormError(data?.error || "Erro ao processar devolução.");
      }
    } catch {
      setFormError("Erro ao processar devolução.");
    }
  }

  // Handler para cada step
  const handleNextStep = async () => {
    setFormError("");
    if (operation === "emprestimo") {
      if (step === 1) {
        if (!nusp) {
          setFormError("Informe o NUSP.");
          return;
        }
        const usuario = await buscarUsuarioPorNusp(nusp);
        if (!usuario) {
          setFormError("NUSP não encontrado ou inválido.");
          return;
        }
        // Se for admin, pula a validação de senha
        if (isAdminMode) {
          setStep(3);
        } else {
          setStep(2);
        }
      } else if (step === 2) {
        if (!senha) {
          setFormError("Informe a senha.");
          return;
        }
        if (!(await validarSenha(nusp, senha))) {
          setFormError("Senha incorreta ou usuário inválido.");
          return;
        }
        setStep(3);
      } else if (step === 3) {
        if (!codigoLivro) {
          setFormError("Informe o código do livro.");
          return;
        }
        if (!(await validarLivro(codigoLivro))) {
          setFormError("Livro não encontrado ou não disponível para empréstimo.");
          return;
        }
        // Confirmação do empréstimo
        try {
          let result;
          if (isAdminMode) {
            // Usa rota de admin (sem senha)
            const res = await fetch("/api/loans/admin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ NUSP: nusp, book_id: Number(codigoLivro) }),
            });
            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.error || "Erro ao criar empréstimo");
            }
            result = await res.json();
          } else {
            // Usa rota normal (com senha)
            result = await createLoan({ NUSP: nusp, password: senha, book_id: Number(codigoLivro) });
          }
          setLoanDetails(result || loan);
          setShowPopup(true);
          setSuccessMsg("");
          if (onSuccess) onSuccess();
        } catch (err: any) {
          if (err?.message?.includes("EmailService.sendNotificationEmail is not a function")) {
            setFormError("Empréstimo registrado, mas houve um erro ao enviar a notificação por email. Informe o administrador.");
            setShowPopup(true);
          } else {
            setFormError("Erro ao registrar empréstimo.");
          }
        }
      }
    } else if (operation === "devolucao") {
      if (step === 1) {
        if (!codigoLivro) {
          setFormError("Informe o código do livro.");
          return;
        }
        await processarDevolucao(codigoLivro);
      }
    }
  };

  return (
    <>
      {step === 0 && (
        <div className="flex items-center justify-center w-full bg-transparent px-4">
          <div className="bg-white flex flex-col items-center mx-4 min-w-[350px] max-w-2xl w-full">
            <img
              src="/images/loan.png"
              alt="Biblioteca do CM"
              className="mb-6 w-96 object-contain"
            />
            <div className="flex flex-row gap-4 w-full">
              <button
                className="w-full bg-library-purple text-white py-4 rounded-xl text-lg font-bold"
                onClick={() => { setOperation("emprestimo"); setStep(1); }}
                aria-label="Iniciar Empréstimo"
              >
                Empréstimo
              </button>
              <button
                className="w-full bg-library-purple text-white py-4 rounded-xl text-lg font-bold"
                onClick={() => { setOperation("devolucao"); setStep(1); }}
                aria-label="Iniciar Devolução"
              >
                Devolução
              </button>
            </div>
          </div>
        </div>
      )}

      {operation === "emprestimo" && step > 0 && (
        <form className="mt-12 space-y-4 max-w-md" onSubmit={e => { e.preventDefault(); handleNextStep(); }}>
          <div className="mb-4">
            {step === 1 && (
              <div>
                <label className="font-medium ml-2">Número USP:</label>
                <input
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full mb-2"
                  value={nusp}
                  onChange={e => setNusp(e.target.value)}
                  placeholder="ex: 123456789"
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}
            {step === 2 && !isAdminMode && (
              <div>
                <label className="font-medium ml-2">Senha:</label>
                <input
                  type="password"
                  className="border rounded-xl px-3 py-2 w-full mb-2"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="ex: minhaSenha123"
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}
            {step === 3 && (
              <div>
                <label className="font-medium ml-2">Código do Livro:</label>
                <input
                  type="text"
                  className="border rounded-xl px-3 py-2 w-full mb-2"
                  value={codigoLivro}
                  onChange={e => setCodigoLivro(e.target.value)}
                  placeholder="Escaneie ou digite o código de barras"
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-xl w-1/2"
              onClick={() => {
                if (step > 1) {
                  // Se for admin e está no step 3, volta pro step 1 (pula o 2)
                  if (isAdminMode && step === 3) {
                    setStep(1);
                  } else {
                    setStep(step - 1);
                  }
                }
              }}
              disabled={step <= 1}
            >
              Voltar
            </button>
            <button
              type="submit"
              className="bg-cm-green text-white py-2 px-4 rounded-xl w-1/2"
              disabled={loading}
            >
              {step < 3 ? "Próximo" : loading ? "Registrando..." : "Confirmar Empréstimo"}
            </button>
          </div>
          <button
            type="button"
            className="w-full bg-cm-red text-white py-2 rounded-xl mt-2"
            onClick={() => {
              setStep(0);
              setOperation("");
              setNusp("");
              setSenha("");
              setCodigoLivro("");
              setFormError("");
              setLoanDetails(null);
            }}
          >
            Cancelar
          </button>
          {formError && <div className="text-red-600">{formError}</div>}
          {error && <div className="text-red-600">{error}</div>}
        </form>
      )}

      {operation === "devolucao" && step > 0 && (
        <form className="mt-12 space-y-4 max-w-md" onSubmit={e => { e.preventDefault(); handleNextStep(); }}>
          <div className="mb-4">
            <label className="font-medium ml-2">Código do Livro:</label>
            <input
              type="text"
              className="border rounded-xl px-3 py-2 w-full mb-2"
              value={codigoLivro}
              onChange={e => setCodigoLivro(e.target.value)}
              placeholder="Escaneie ou digite o código de barras"
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-cm-red text-white py-2 px-4 rounded-xl w-1/2"
              onClick={() => {
                setStep(0);
                setOperation("");
                setCodigoLivro("");
                setFormError("");
                setReturnSuccess(false);
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-cm-green text-white py-2 px-4 rounded-xl w-1/2"
              disabled={loading}
            >
              {loading ? "Processando..." : "Confirmar"}
            </button>
          </div>
          {formError && <div className="text-red-600">{formError}</div>}
        </form>
      )}

      {showPopup && operation === "emprestimo" && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bebas mb-4 text-cm-green">Empréstimo Confirmado!</h3>
            <div className="mb-2">
              <strong>NUSP:</strong> {nusp}
            </div>
            <div className="mb-2">
              <strong>Código do Livro:</strong> {codigoLivro}
            </div>
            {loanDetails && (
              <div className="mb-2">
                <strong>ID do Empréstimo:</strong> {loanDetails.id || loanDetails.loan_id}
              </div>
            )}
            <button
              className="mt-4 w-full bg-cm-green text-white py-2 rounded"
              onClick={() => { setShowPopup(false); setStep(0); setOperation(""); setNusp(""); setSenha(""); setCodigoLivro(""); setLoanDetails(null); }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showPopup && operation === "devolucao" && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bebas mb-4 text-cm-green">Devolução Confirmada!</h3>
            <div className="mb-2">
              <strong>Código do Livro:</strong> {codigoLivro}
            </div>
            <button
              className="mt-4 w-full bg-cm-green text-white py-2 rounded"
              onClick={() => { setShowPopup(false); setStep(0); setOperation(""); setCodigoLivro(""); setReturnSuccess(false); }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}