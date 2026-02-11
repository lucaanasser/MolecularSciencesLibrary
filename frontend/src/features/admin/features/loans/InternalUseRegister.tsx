import { useState } from "react";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const InternalUseRegister: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  const [internalUseCode, setInternalUseCode] = useState("");
  const [internalUseLoading, setInternalUseLoading] = useState(false);
  const [internalUseError, setInternalUseError] = useState("");

  const handleInternalUse = async () => {
    if (!internalUseCode) {
      setInternalUseError("Informe o código do livro");
      return;
    }
    setInternalUseLoading(true);
    setInternalUseError("");
    try {
      const res = await fetch("/api/loans/internal-use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: internalUseCode })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao registrar uso interno");
      }
      setInternalUseCode("");
      onSuccess("Uso interno registrado com sucesso!");
    } catch (err: any) {
      setInternalUseError(err.message);
    } finally {
      setInternalUseLoading(false);
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
          disabled={internalUseLoading}
          onKeyPress={e => {
            if (e.key === "Enter") handleInternalUse();
          }}
        />
      </div>
      {internalUseError && <p className="text-red-600 prose-sm mt-4">{internalUseError}</p>}
      <ActionBar
        onConfirm={handleInternalUse}
        onCancel={onBack}
        confirmLabel="Registrar"
        cancelLabel="Voltar"
        confirmColor="bg-library-purple hover:bg-library-purple/90"
        loading={internalUseLoading}
        showCancel={true}
        showConfirm={true}
      />
    </>
  );
};

export default InternalUseRegister;
