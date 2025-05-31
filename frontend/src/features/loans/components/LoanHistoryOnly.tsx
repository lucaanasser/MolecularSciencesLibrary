import { Clock } from "lucide-react";
import { useUserLoans } from "../hooks/useUserLoans";
import { Loan } from "../types/loan";

interface LoanHistoryOnlyProps {
  userId: number | undefined;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

export default function LoanHistoryOnly({ userId }: LoanHistoryOnlyProps) {
  const { loans, loading, error } = useUserLoans(userId);

  const returnedLoans = (loans || []).filter((loan: Loan) => !!loan.returned_at);

  if (loading) {
    return <div className="text-center py-8">Carregando histórico...</div>;
  }
  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }
  if (!returnedLoans.length) {
    return <div className="text-center py-8 text-gray-500">Nenhum empréstimo devolvido.</div>;
  }

  return (
    <div className="space-y-4">
      {returnedLoans.map((item: Loan) => (
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
                  <span>Empréstimo: {formatDate(item.borrowed_at)}</span>
                </div>
                <div>
                  <span>Devolução: {formatDate(item.returned_at)}</span>
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs bg-cm-green/10 text-cm-green">
              Devolvido
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
