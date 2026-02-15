import { useState } from "react";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import { LoansService } from "@/services/LoansService";

const InternalUseRegister: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  const [internalUseCode, setInternalUseCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Submissão do formulário usando LoansService
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await LoansService.registerInternalUse({ book_id: Number(internalUseCode) });
      setInternalUseCode("");
      setLoading(false);
      onSuccess("Uso interno registrado com sucesso!");
    } catch (err: any) {
      setLoading(false);
      if (onError) onError(err || "Erro ao registrar uso interno");
    }
  };

  return (
    <>
      <p>
        Insira o código do livro para registrar 
        um exemplar usado por alunos na própria biblioteca (sem empréstimo externo):
      </p>
      <div>
        <Input
          type="text"
          value={internalUseCode}
          onChange={e => setInternalUseCode(e.target.value)}
          placeholder="Escaneie ou digite o código de barras"
          onKeyPress={e => {
            if (e.key === "Enter") handleSubmit(e);
          }}
          disabled={loading}
        />
      </div>

      <ActionBar
        onConfirm={() => handleSubmit()}
        onCancel={onBack}
        confirmLabel={loading ? "Registrando..." : "Registrar"}
      />
    </>
  );
};

export default InternalUseRegister;