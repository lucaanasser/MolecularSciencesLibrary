import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActionBar from "@/features/admin/components/ActionBar";
import { useLoanOperation } from "@/features/admin/hooks/useLoanOperation";
import { useLoanValidation } from "@/features/admin/hooks/useLoanValidation";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

/**
 * Feature para registrar empréstimos usando os hooks reutilizáveis.
 * Modo admin: não requer senha do usuário.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const LoanForm: React.FC<TabComponentProps> = ({ onBack, onSuccess }) => {
  const [nusp, setNusp] = useState("");
  const [bookCode, setBookCode] = useState("");
  const [error, setError] = useState("");

  const { createLoanAdmin, loading: loanLoading } = useLoanOperation();
  const { 
    findUserByNusp, 
    validateBook, 
    loading: validationLoading 
  } = useLoanValidation();

  const loading = loanLoading || validationLoading;

  const handleConfirm = async () => {
    setError("");

    // Validar NUSP
    if (!nusp) {
      setError("Informe o NUSP do usuário");
      return;
    }

    // Validar código do livro
    if (!bookCode) {
      setError("Informe o ID/código de barras do livro");
      return;
    }

    console.log("🔵 [LoanBook] Validando NUSP:", nusp);
    const user = await findUserByNusp(nusp);
    
    if (!user) {
      console.log("🔴 [LoanBook] NUSP não encontrado:", nusp);
      setError("NUSP não encontrado ou inválido");
      return;
    }

    console.log("🟢 [LoanBook] NUSP válido:", user.NUSP);

    console.log("🔵 [LoanBook] Validando livro:", bookCode);
    const book = await validateBook(bookCode);
    
    if (!book) {
      console.log("🔴 [LoanBook] Livro não encontrado ou não disponível:", bookCode);
      setError("Livro não encontrado ou não disponível para empréstimo");
      return;
    }

    console.log("🟢 [LoanBook] Livro válido:", book.title || bookCode);

    // Criar empréstimo
    try {
      console.log("🔵 [LoanBook] Criando empréstimo - NUSP:", nusp, "Livro:", bookCode);
      const loan = await createLoanAdmin({
        NUSP: nusp,
        book_id: Number(bookCode),
      });

      console.log("🟢 [LoanBook] Empréstimo criado com sucesso:", loan);

      // Reset form
      setNusp("");
      setBookCode("");
      onSuccess("Empréstimo registrado com sucesso.");
    } catch (err: any) {
      console.error("🔴 [LoanBook] Erro ao criar empréstimo:", err);
      setError(err.message || "Erro ao registrar empréstimo");
    }
  };

  return (
    <>
      <p>
        Preencha os dados abaixo para registrar o empréstimo.
      </p>

      <div className="">
        <Label>Número USP do usuário:</Label>
        <Input
          type="number"
          value={nusp}
          onChange={e => setNusp(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <Label>ID do Livro:</Label>
        <Input
          type="number"
          value={bookCode}
          onChange={e => setBookCode(e.target.value)}
          placeholder="Escaneie ou digite o código de barras"
          disabled={loading}
        />
      </div>

      {error && <p className="text-red-600 prose-sm mt-2">{error}</p>}

      <ActionBar
        onConfirm={handleConfirm}
        onCancel={onBack}
        confirmLabel="Registrar"
        loading={loading}
      />

    </>
  );
};

export default LoanForm;
