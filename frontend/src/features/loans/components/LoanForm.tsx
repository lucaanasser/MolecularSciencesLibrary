import React from "react";
import { useCreateLoan } from "../hooks/useCreateLoan";

/**
 * Formulário para registrar novo empréstimo.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function LoanForm({ nusp, codigoLivro, senha, onSuccess }: { nusp: string; codigoLivro: string; senha: string; onSuccess?: () => void }) {
  const { createLoan, loading, error, loan } = useCreateLoan();
  const [formError, setFormError] = React.useState<string>("");
  const [successMsg, setSuccessMsg] = React.useState<string>("");

  async function validarNusp(nusp: string) {
    try {
      const res = await fetch(`/api/users/${nusp}`);
      if (res.ok) {
        const usuario = await res.json();
        return !!usuario && usuario.NUSP == nusp;
      }
      return false;
    } catch {
      return false;
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

  const [showPopup, setShowPopup] = React.useState(false);
  const [loanDetails, setLoanDetails] = React.useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    if (!nusp || !senha || !codigoLivro) {
      setFormError("Preencha todos os campos.");
      return;
    }
    if (!(await validarNusp(nusp))) {
      setFormError("NUSP não encontrado ou inválido.");
      return;
    }
    if (!(await validarSenha(nusp, senha))) {
      setFormError("Senha incorreta ou usuário inválido.");
      return;
    }
    if (!(await validarLivro(codigoLivro))) {
      setFormError("Livro não encontrado ou não disponível para empréstimo.");
      return;
    }
    try {
      const result = await createLoan({ NUSP: nusp, password: senha, book_id: Number(codigoLivro) });
      setLoanDetails(result || loan);
      setShowPopup(true);
      setSuccessMsg("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError("Erro ao registrar empréstimo.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="mb-4">
          <div>
            <label className="font-medium">NUSP:</label>
            <div className="font-mono">{nusp}</div>
          </div>
          <div>
            <label className="font-medium">Código do Livro:</label>
            <div className="font-mono">{codigoLivro}</div>
          </div>
          <div>
            <label className="font-medium">Senha:</label>
            <div className="font-mono">••••••••</div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-cm-green text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Registrando..." : "Confirmar Empréstimo"}
        </button>
        {formError && <div className="text-red-600">{formError}</div>}
        {error && <div className="text-red-600">{error}</div>}
      </form>
      {showPopup && (
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
              onClick={() => setShowPopup(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}