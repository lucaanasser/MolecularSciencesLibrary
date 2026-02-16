import React, { useEffect, useState } from "react";
import { LOAN_RULES, LOAN_RULES_META } from "@/constants/loan_rules";
import { RulesService } from "@/services/RulesService";
import ActionBar from "@/features/admin/components/ActionBar";
import { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoanRulesForm({ onSuccess, onBack, onError }: TabComponentProps) {
  const [form, setForm] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  
  // Carrega as regras atuais ao montar
  useEffect(() => {
    setLoading(true);
    RulesService.getRules()
      .then((data) => {
        setForm(data);
      })
      .catch((err) => {
        onError(err);
      }).finally(() => {
        setLoading(false);
      });
  }, []);

  function handleChange(field: string, value: string) {
    setForm((prev) =>
      prev ? { ...prev, [field]: Number(value) } : prev
    );
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (loading) return; // Previne múltiplos envios
    if (!form) return;
    setSaving(true);
    try {
      await RulesService.updateRules(form);
      onSuccess("Regras atualizadas com sucesso!");
    } catch (err: any) {
      onError(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center my-8">Carregando regras...</div>;
  
  return (
    <form onSubmit={handleSubmit}>
      <p>
        Altere os parâmetros abaixo para ajustar as regras de empréstimo da biblioteca.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
        {LOAN_RULES.map((field) => (
          <div key={field} className="flex flex-col">
            <Label className="font-medium mb-1">
              {LOAN_RULES_META[field]?.label || field}
              {LOAN_RULES_META[field]?.unit && (
                <span className="ml-2 prose-xs text-gray-500">
                  ({LOAN_RULES_META[field].unit})
                </span>
              )}
            </Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={form[field] ?? ""}
              onChange={(e) => handleChange(field, e.target.value)}
              required
              className="border-none"
            />
          </div>
        ))}
      </div>
      <ActionBar
        onCancel={onBack}
        onConfirm={() => {
          if (!confirming) {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000); // reseta após 3s
          } else {
            handleSubmit({ preventDefault: () => {} } as any);
          }
        }}
        confirmLabel={confirming ? "Clique novamente para salvar" : "Salvar"}
        loading={saving}
      />   
      </form>
  );
}