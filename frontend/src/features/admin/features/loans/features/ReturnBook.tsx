import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActionBar from "@/features/admin/components/ActionBar";
import { useReturnOperation } from "@/features/admin/hooks/useReturnOperation";
import { useLoanValidation } from "@/features/admin/hooks/useLoanValidation";
import { useToast } from "@/hooks/useToast";

/**
 * Feature para processar devoluções usando os hooks reutilizáveis.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const ReturnBook = ({ onBack, onSuccess }: { onBack: () => void; onSuccess?: () => void }) => {
  const [bookCode, setBookCode] = useState("");
  const [error, setError] = useState("");

  const { toast } = useToast();
  const { returnBook, loading: returnLoading, result } = useReturnOperation();
  const { validateBook, loading: validationLoading } = useLoanValidation();

  const loading = returnLoading || validationLoading;

  const handleConfirm = async () => {
    setError("");

    if (!bookCode) {
      setError("Informe o ID/código de barras do livro");
      return;
    }

    console.log("🔵 [ReturnBook] Validando livro:", bookCode);
    const book = await validateBook(bookCode);
    
    if (!book) {
      console.log("🔴 [ReturnBook] Livro não encontrado:", bookCode);
      setError("Livro não encontrado");
      return;
    }

    console.log("🟢 [ReturnBook] Livro encontrado:", book.title || bookCode);

    // Processar devolução
    try {
      console.log("🔵 [ReturnBook] Processando devolução do livro:", bookCode);
      const returnResult = await returnBook({
        book_id: Number(bookCode),
      });

      console.log("🟢 [ReturnBook] Devolução processada com sucesso:", returnResult);
      
      toast({
        title: "Devolução registrada!",
        description: "Devolução processada com sucesso.",
      });

      // Reset form
      setBookCode("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("🔴 [ReturnBook] Erro ao processar devolução:", err);
      setError(err.message || "Erro ao processar devolução");
    }
  };

  return (
    <>
      <p>
        Preencha os dados abaixo para registrar a devolução:
      </p>

      <div className="">
        <Label>ID do Livro:</Label>
        <Input
          type="text"
          value={bookCode}
          onChange={e => setBookCode(e.target.value)}
          placeholder="Escaneie ou digite o código de barras"
          disabled={loading}
          autoFocus
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

export default ReturnBook;
