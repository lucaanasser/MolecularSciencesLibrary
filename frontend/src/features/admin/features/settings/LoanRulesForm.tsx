import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { loanRulesFields } from "./loanRulesFields";
import { useLoanRules } from "@/features/rules/hooks/useLoanRules";
import { LoanRules } from "@/features/rules/types/rules";
import ActionBar from "@/features/admin/components/ActionBar";
import { Input } from "@/components/ui/input";

interface LoanRulesFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LoanRulesForm({ onSuccess, onCancel }: LoanRulesFormProps) {
  const { rules, loading, error, updateRules } = useLoanRules();
  const [form, setForm] = useState<LoanRules | null>(null);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (rules) setForm(rules);
  }, [rules]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm({ ...form, [name]: Number(value) });
  };

  const handleSubmit = async () => {
    setFormError("");
    setSuccess("");
    if (!form) return;
    try {
      await updateRules(form);
      toast({
        title: "Sucesso",
        description: "Regras atualizadas com sucesso!",
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar regras",
      });
      if (onCancel) onCancel();
    }
  }

  if (loading && !form) return <div>Carregando regras...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!form) return null;

  // Define min value for each field
  const fields = loanRulesFields.map(field => ({
    ...field,
    min: field.name === "max_renewals" ? 0 : 1
  }));

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <ul className="flex flex-col gap-3 mb-4 prose-md">
        {fields.map(field => (
          <li key={field.name} className="flex items-center gap-2">
            <label htmlFor={field.name}>{field.label}:</label>
            <Input
              id={field.name}
              type="number"
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              min={field.min}
              required
              className="h-7 w-20"
            />
            <span className="text-gray-500">{field.unit}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <ActionBar
          onConfirm={handleSubmit}
          onCancel={onCancel}
          confirmLabel={loading ? "Salvando..." : "Salvar Edições"}
          loading={loading}
          showCancel={!!onCancel}
        />
      </div>
    </form>
  );
}
