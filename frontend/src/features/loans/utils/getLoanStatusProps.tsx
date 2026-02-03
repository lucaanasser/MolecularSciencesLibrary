import { Loan } from "../types/loan";
import * as React from "react";

/**
 * Retorna o status do empréstimo já formatado como JSX.
 */
export function getLoanStatusProps(loan: Loan): JSX.Element {
  let color = "";
  let status = "";

  if (loan.due_date && new Date(loan.due_date) < new Date() && !loan.returned_at) {
    color = "bg-cm-red/20 text-cm-red";
    status = "Atrasado";
  } else if (loan.is_extended === 1 && !loan.returned_at) {
    color = "bg-cm-orange/30 text-cm-orange";
    status = "Estendido";
  } else if (loan.is_reserved === 1) {
    color = "bg-purple-200 text-purple-600";
    status = "Reservado";
  } else if (loan.returned_at) {
    color = "bg-cm-green/30 text-green-600";
    status = "Devolvido";
  } else {
    color = "bg-cm-yellow/40 text-yellow-600";
    status = "Em andamento";
  }

  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{status}</span>;
}
