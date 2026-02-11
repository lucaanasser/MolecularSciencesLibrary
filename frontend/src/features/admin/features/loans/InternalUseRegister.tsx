import { useState } from "react";
import { useInternalUseRegister } from "./hooks/useInternalUseRegister";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const InternalUseRegister: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  const [internalUseCode, setInternalUseCode] = useState("");
  const { handleSubmit } = useInternalUseRegister({
    onSuccess: (msg) => {
      setInternalUseCode("");
      onSuccess(msg);
    },
    onError: (msg) => { onError(msg); },
    getFormValues: () => ({
      bookId: Number(internalUseCode)
    })
  });



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
        />
      </div>

      <ActionBar
        onConfirm={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
        onCancel={onBack}
        confirmLabel="Registrar"
      />
    </>
  );
};

export default InternalUseRegister;
