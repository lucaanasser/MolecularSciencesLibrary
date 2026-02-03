import { useState } from "react";
import { useReturnOperation } from "@/features/admin/hooks/useReturnOperation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";

/**
 * Componente de formulário para devoluções.
 * Processa a devolução de um livro pelo código.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

interface ReturnFormProps {
  onCancel: () => void;
  onSuccess: (codigoLivro: string) => void;
}

export const ReturnForm = ({ onCancel, onSuccess }: ReturnFormProps) => {
  const returnOp = useReturnOperation();

  const [codigoLivro, setCodigoLivro] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const loading = returnOp.loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!codigoLivro) {
      setFormError("Informe o código do livro.");
      return;
    }

    try {
      console.log("🔵 [ReturnForm] Processando devolução");
      await returnOp.returnBook({ book_id: Number(codigoLivro) });
      
      console.log("🟢 [ReturnForm] Devolução processada com sucesso");
      onSuccess(codigoLivro);
    } catch (err: any) {
      console.error("🔴 [ReturnForm] Erro ao processar devolução:", err);
      setFormError(err?.message || "Erro ao processar devolução.");
    }
  };

  return (
    <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
      <Label>Código do Livro:</Label>
      <Input
        type="text"
        value={codigoLivro}
        onChange={(e) => setCodigoLivro(e.target.value)}
        placeholder="Escaneie ou digite o código de barras"
        disabled={loading}
        autoFocus
      />

      {formError && <div className="text-red-600 prose-sm">{formError}</div>}

      <ActionBar
        onCancel={onCancel}
        onConfirm={() => {}}
        cancelLabel="Cancelar"
        confirmLabel={loading ? "Processando..." : "Confirmar devolução"}
        loading={loading}
      />

    </form>
  );
};
