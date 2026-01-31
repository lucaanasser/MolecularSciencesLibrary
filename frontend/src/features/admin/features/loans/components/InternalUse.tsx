import { useState } from "react";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";

const InternalUse = ({ onBack }: { onBack: () => void }) => {
  const [internalUseCode, setInternalUseCode] = useState("");
  const [internalUseLoading, setInternalUseLoading] = useState(false);
  const [internalUseError, setInternalUseError] = useState("");
  const [internalUseSuccess, setInternalUseSuccess] = useState("");

  const handleInternalUse = async () => {
    if (!internalUseCode) {
      setInternalUseError("Informe o código do livro");
      return;
    }
    setInternalUseLoading(true);
    setInternalUseError("");
    setInternalUseSuccess("");
    try {
      const res = await fetch("/api/loans/internal-use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_code: internalUseCode })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao registrar uso interno");
      }
      setInternalUseSuccess("Uso interno registrado com sucesso!");
      setInternalUseCode("");
      setTimeout(() => setInternalUseSuccess(""), 3000);
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
        um exemplar usado internamente na biblioteca (sem empréstimo externo):
      </p>
      <div>
        <Input
          type="text"
          value={internalUseCode}
          onChange={e => setInternalUseCode(e.target.value)}
          placeholder="Ex: BIO-01.01"
          disabled={internalUseLoading}
          onKeyPress={e => {
            if (e.key === "Enter") handleInternalUse();
          }}
        />
      </div>
      {internalUseError && <p className="text-red-600 prose-sm mt-4">{internalUseError}</p>}
      {internalUseSuccess && <p className="text-green-600 prose-sm mt-4">{internalUseSuccess}</p>}
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

export default InternalUse;
