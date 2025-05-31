import { useState } from "react";
import { useReturnLoan } from "../hooks/useReturnLoan";

/**
 * Formulário para registrar devolução de empréstimo.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function ReturnLoanForm({ onSuccess }: { onSuccess?: () => void }) {
  const [bookId, setBookId] = useState("");
  const { returnLoan, loading, error, success } = useReturnLoan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) {
      console.warn("🟡 [ReturnLoanForm] Campo obrigatório não preenchido");
      return;
    }
    try {
      console.log("🔵 [ReturnLoanForm] Registrando devolução para Livro:", bookId);
      await returnLoan({ book_id: Number(bookId) });
      if (onSuccess) {
        console.log("🟢 [ReturnLoanForm] Devolução registrada com sucesso");
        onSuccess();
      }
    } catch (err) {
      console.error("🔴 [ReturnLoanForm] Erro ao registrar devolução:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block font-medium">ID do Livro</label>
        <input
          type="number"
          value={bookId}
          onChange={e => setBookId(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Registrando..." : "Registrar Devolução"}
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">Devolução registrada com sucesso!</div>}
    </form>
  );
}