import { Clock } from "lucide-react";
import { useUserLoans } from "../hooks/useUserLoans";
import { Loan } from "../types/loan"; 
interface LoanHistoryProps {
  userId: number | undefined;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

export default function LoanHistory({ userId }: LoanHistoryProps) {
  const { loans, loading, error } = useUserLoans(userId);

  if (loading) return <div className="text-center py-8">Carregando histórico...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!loans || loans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum histórico de empréstimos encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((item: Loan) => (
        <div
          key={item.loan_id}
          className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{item.book_title || `Livro ID: ${item.book_id}`}</h4>
              <div className="flex space-x-4 mt-1 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>
                    Empréstimo: {formatDate(item.borrowed_at)}
                  </span>
                </div>
                <div>
                  <span>
                    Devolução: {item.returned_at ? formatDate(item.returned_at) : "Em aberto"}
                  </span>
                </div>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                item.returned_at
                  ? "bg-cm-green/10 text-cm-green"
                  : "bg-cm-yellow/10 text-cm-orange"
              }`}
            >
              {item.returned_at ? "Devolvido" : "Em andamento"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}