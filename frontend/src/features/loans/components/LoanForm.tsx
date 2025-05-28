import { useState } from "react";
import { useCreateLoan } from "../hooks/useCreateLoan";

/**
 * Formulário para registrar novo empréstimo.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function LoanForm({ onSuccess }: { onSuccess?: () => void }) {
  const [NUSP, setNUSP] = useState("");
  const [password, setPassword] = useState("");
  const [bookId, setBookId] = useState("");
  const { createLoan, loading, error, loan } = useCreateLoan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!NUSP || !password || !bookId) {
      console.warn("🟡 [LoanForm] Campos obrigatórios não preenchidos");
      return;
    }
    try {
      console.log("🔵 [LoanForm] Registrando empréstimo para NUSP:", NUSP, "Livro:", bookId);
      await createLoan({ NUSP, password, book_id: Number(bookId) });
      if (onSuccess) {
        console.log("🟢 [LoanForm] Empréstimo registrado com sucesso");
        onSuccess();
      }
    } catch (err) {
      console.error("🔴 [LoanForm] Erro ao registrar empréstimo:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block font-medium">NUSP do Usuário</label>
        <input
          type="text"
          value={NUSP}
          onChange={e => setNUSP(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Senha do Usuário</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
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
        {loading ? "Registrando..." : "Registrar Empréstimo"}
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {loan && <div className="text-green-600">Empréstimo registrado com sucesso!</div>}
    </form>
  );
}