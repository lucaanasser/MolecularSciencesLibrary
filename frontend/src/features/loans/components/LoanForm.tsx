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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("🔵 [LoanForm] Registrando empréstimo para NUSP:", nusp, "Livro:", codigoLivro);
      await createLoan({ NUSP: nusp, password: senha, book_id: Number(codigoLivro) });
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
      {error && <div className="text-red-600">{error}</div>}
      {loan && <div className="text-green-600">Empréstimo registrado com sucesso!</div>}
    </form>
  );
}