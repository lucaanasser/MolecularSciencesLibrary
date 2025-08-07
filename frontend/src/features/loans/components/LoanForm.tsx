import * as React from "react";
import { useCreateLoan } from "../hooks/useCreateLoan";

/**
 * Formulário para registrar novo empréstimo.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

export default function LoanForm({ nusp: propNusp = "", codigoLivro: propCodigoLivro = "", senha: propSenha = "", onSuccess }: { nusp?: string; codigoLivro?: string; senha?: string; onSuccess?: () => void } = {}) {
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
        setStep(2);
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
          const result = await createLoan({ NUSP: nusp, password: senha, book_id: Number(codigoLivro) });
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
        <div className="flex flex-row items-center justify-center gap-8">
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center w-64">
            <h2 className="text-lg font-bold mb-4 text-cm-green">Empréstimo</h2>
            <button
              className="w-full bg-cm-green text-white py-2 rounded text-lg"
              onClick={() => { setOperation("emprestimo"); setStep(1); }}
            >
              Empréstimo
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center w-64">
            <h2 className="text-lg font-bold mb-4 text-cm-green">Devolução</h2>
            <button
              className="w-full bg-cm-green text-white py-2 rounded text-lg"
              onClick={() => { setOperation("devolucao"); setStep(1); }}
            >
              Devolução
            </button>
          </div>
        </div>
      )}

      {operation === "emprestimo" && step > 0 && (
        <form className="space-y-4 max-w-md" onSubmit={e => { e.preventDefault(); handleNextStep(); }}>
          <div className="mb-4">
            {step === 1 && (
              <div>
                <label className="font-medium">NUSP:</label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full mb-2"
                  value={nusp}
                  onChange={e => setNusp(e.target.value)}
                  placeholder="NUSP"
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}
            {step === 2 && (
              <div>
                <label className="font-medium">Senha:</label>
                <input
                  type="password"
                  className="border rounded px-3 py-2 w-full mb-2"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Senha"
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}
            {step === 3 && (
              <div>
                <label className="font-medium">Código do Livro:</label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full mb-2"
                  value={codigoLivro}
                  onChange={e => setCodigoLivro(e.target.value)}
                  placeholder="Código do Livro"
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded w-1/2"
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
            <button
              type="button"
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded w-1/2"
              onClick={() => {
                if (step > 1) setStep(step - 1);
              }}
              disabled={step <= 1}
            >
              Voltar
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-cm-green text-white py-2 rounded mt-2"
            disabled={loading}
          >
            {step < 3 ? "Próximo" : loading ? "Registrando..." : "Confirmar Empréstimo"}
          </button>
          {formError && <div className="text-red-600">{formError}</div>}
          {error && <div className="text-red-600">{error}</div>}
        </form>
      )}

      {operation === "devolucao" && step > 0 && (
        <form className="space-y-4 max-w-md" onSubmit={e => { e.preventDefault(); handleNextStep(); }}>
          <div className="mb-4">
            <label className="font-medium">Código do Livro:</label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full mb-2"
              value={codigoLivro}
              onChange={e => setCodigoLivro(e.target.value)}
              placeholder="Código do Livro"
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded w-1/2"
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
              type="button"
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded w-1/2"
              onClick={() => {
                if (step > 1) setStep(step - 1);
              }}
              disabled={step <= 1}
            >
              Voltar
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-cm-green text-white py-2 rounded mt-2"
            disabled={loading}
          >
            {loading ? "Processando..." : "Confirmar Devolução"}
          </button>
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