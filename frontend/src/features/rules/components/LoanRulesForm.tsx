import React, { useState, useEffect } from "react";
import { useLoanRules } from "@/features/rules/hooks/useLoanRules";
import { LoanRules } from "@/features/rules/types/rules";
import { Button } from "@/components/ui/button";

interface LoanRulesFormProps {
  onSuccess?: () => void;
}

export default function LoanRulesForm({ onSuccess }: LoanRulesFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    if (!form) return;
    try {
      await updateRules(form);
      setSuccess("Regras atualizadas com sucesso!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setFormError(err.message || "Erro ao atualizar regras");
    }
  };

  if (loading && !form) return <div>Carregando regras...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!form) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block font-medium">Dias máximos de empréstimo</label>
        <input
          type="number"
          name="max_days"
          value={form.max_days}
          onChange={handleChange}
          min={1}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Máximo de livros por usuário</label>
        <input
          type="number"
          name="max_books_per_user"
          value={form.max_books_per_user}
          onChange={handleChange}
          min={1}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Intervalo de lembrete de atraso (dias)</label>
        <input
          type="number"
          name="overdue_reminder_days"
          value={form.overdue_reminder_days}
          onChange={handleChange}
          min={1}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Máximo de renovações por empréstimo</label>
        <input
          type="number"
          name="max_renewals"
          value={form.max_renewals}
          onChange={handleChange}
          min={0}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Dias de cada renovação</label>
        <input
          type="number"
          name="renewal_days"
          value={form.renewal_days}
          onChange={handleChange}
          min={1}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Janela de extensão (dias)</label>
        <input
          type="number"
          name="extension_window_days"
          value={form.extension_window_days}
          onChange={handleChange}
          min={1}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Multiplicador do bloco de extensão</label>
        <input
          type="number"
          name="extension_block_multiplier"
          value={form.extension_block_multiplier}
          onChange={handleChange}
          min={1}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Dias mínimos após nudge (fase estendida)</label>
        <input
          type="number"
          name="shortened_due_days_after_nudge"
          value={form.shortened_due_days_after_nudge}
          onChange={handleChange}
          min={1}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Cooldown de cutucada (horas)</label>
        <input
          type="number"
          name="nudge_cooldown_hours"
          value={form.nudge_cooldown_hours}
          onChange={handleChange}
          min={1}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Dias de extensão curta após nudge (pendência)</label>
        <input
          type="number"
          name="pending_nudge_extension_days"
          value={form.pending_nudge_extension_days}
          onChange={handleChange}
          min={1}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <Button type="submit" className="bg-cm-blue text-white px-4 py-2 rounded">
        Salvar Regras
      </Button>
      {formError && <div className="text-red-600 mt-2">{formError}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </form>
  );
}
