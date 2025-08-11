import { Loan } from "../types/loan";

/**
 * Retorna o texto e as classes de cor para o status do empréstimo.
 * Unifica o visual dos badges de status em LoanItem.
 */
export function getLoanStatusProps(loan: Loan): { statusText: string; statusColor: string } {
  // Atrasado tem prioridade
  if (loan.due_date && new Date(loan.due_date) < new Date() && !loan.returned_at) {
    return { statusText: "Atrasado", statusColor: "bg-cm-red/10 text-cm-red" };
  }
  if (loan.extended_phase === 1 && !loan.returned_at) {
    return { statusText: "Estendido", statusColor: "bg-cm-orange/10 text-cm-orange" };
  }
  if (loan.is_reserved === 1) {
    return { statusText: "Reservado", statusColor: "bg-purple-200 text-purple-700" };
  }
  if (loan.returned_at) {
    return { statusText: "Devolvido", statusColor: "bg-cm-green/10 text-cm-green" };
  }
  // Em andamento normal
  return { statusText: "Em andamento", statusColor: "bg-yellow-200 text-yellow-800" };
}
