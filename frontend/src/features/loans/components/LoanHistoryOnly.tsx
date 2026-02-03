import { Book, Clock } from "lucide-react";
import { getLoanStatusProps } from "../utils/getLoanStatusProps.tsx";
import { useGetUserLoans } from "../hooks/useGetUserLoans";
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
  const { loans, loading, error } = useGetUserLoans(userId);

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
    <div className="flex flex-col gap-4">
      {returnedLoans.map((loan: Loan) => (
        <div
          key={loan.loan_id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm gap-4"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-library-purple/10 flex items-center justify-center flex-shrink-0">
              <Book className="w-5 h-5 text-library-purple" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1 min-w-0">
                <span className="text-md font-medium text-black truncate block max-w-[12rem]" title={loan.book.title || `Livro ID: ${loan.book_id}`}>{loan.book.title || `Livro ID: ${loan.book_id}`}</span>
                <span className="text-sm text-gray-500 truncate block max-w-[10rem] sm:before:content-[',_'] before:content-['']" title={loan.book.authors || "Autor desconhecido"}>{loan.book.authors || "Autor desconhecido"}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1">
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Início: {formatDate(loan.borrowed_at)}
                </span>
                {loan.returned_at && (
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    Devolução: {formatDate(loan.returned_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-center sm:text-right flex flex-col items-center sm:items-end min-w-[8rem]">
            {getLoanStatusProps(loan)}
          </div>
        </div>
      ))}
    </div>
  );
}
