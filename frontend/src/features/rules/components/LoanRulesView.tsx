import React from "react";
import { useLoanRules } from "../hooks/useLoanRules";

export default function LoanRulesView() {
  const { rules, loading, error } = useLoanRules();

  if (loading) return <div>Carregando regras...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!rules) return null;

  return (
    <div className="space-y-2">
      <div><b>Dias máximos de empréstimo:</b> {rules.max_days}</div>
      <div><b>Máximo de livros por usuário:</b> {rules.max_books_per_user}</div>
      <div><b>Intervalo de lembrete de atraso:</b> {rules.overdue_reminder_days} dias</div>
      <div><b>Máximo de renovações por empréstimo:</b> {rules.max_renewals}</div>
      <div><b>Dias de cada renovação:</b> {rules.renewal_days}</div>
      <div><b>Janela de extensão:</b> {rules.extension_window_days} dias</div>
      <div><b>Multiplicador de extensão:</b> {rules.extension_block_multiplier}x</div>
      <div><b>Dias mínimos após nudge (estendido):</b> {rules.shortened_due_days_after_nudge}</div>
      <div><b>Cooldown de cutucada:</b> {rules.nudge_cooldown_hours}h</div>
      <div><b>Dias de extensão curta após nudge (pendência):</b> {rules.pending_nudge_extension_days} dias</div>
    </div>
  );
}
