import { Loan } from "../types/loan";

/**
 * Retorna o texto e as classes de cor para o status do empréstimo.
 * Unifica o visual dos badges de status em LoanItem.
 */
export function getLoanStatusProps(loan: Loan): { statusText: string; statusColor: string } {
  if (loan.is_reserved === 1) {
    return {
      statusText: "Reservado",
      statusColor: "bg-purple-200 text-purple-700",
    };
  }
  if (loan.returned_at) {
    return {
      statusText: "Devolvido",
      statusColor: "bg-cm-green/10 text-cm-green",
    };
  }
  return {
    statusText: "Em andamento",
    statusColor: "bg-cm-yellow/10 text-cm-orange",
  };
}
