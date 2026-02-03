import { Loan } from "../../loans/types/loan";

export function LoanStatusDot({ loan }: { loan: Loan }) {
  let color = "";
  let status = "";

  if (loan.due_date && new Date(loan.due_date) < new Date() && !loan.returned_at) {
    color = "bg-cm-red";
    status = "Atrasado";
  } else if (loan.is_extended === 1 && !loan.returned_at) {
    color = "bg-cm-orange";
    status = "Estendido";
  } else if (loan.is_reserved === 1) {
    color = "bg-purple-600";
    status = "Reservado";
  } else if (loan.returned_at) {
    color = "bg-cm-blue";
    status = "Devolvido";
  } else {
    color = "bg-cm-green";
    status = "Em dia";
  }

  return (
    <span className="relative group inline-block align-middle">
        <span className={`w-5 h-5 rounded-full ${color} text-white prose-xs font-semibold transition-all duration-200 group-hover:min-w-fit group-hover:px-2 group-hover:py-1 group-hover:rounded-lg flex items-center justify-center`}>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">{status}</span>
      </span>
    </span>
  );
}
