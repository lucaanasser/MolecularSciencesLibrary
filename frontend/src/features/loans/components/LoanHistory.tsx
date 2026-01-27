import { Book, Clock } from "lucide-react";
import { useUserLoans } from "../hooks/useUserLoans";
import { Loan } from "../types/loan";
import { getLoanStatusProps } from "../utils/getLoanStatusProps";

/**
 * Histórico de empréstimos do usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
interface LoanHistoryProps {
  userId: number | undefined;
}

// Usa o formatDate do LoanItem

export default function LoanHistory({ userId }: LoanHistoryProps) {
  const { loans, loading, error } = useUserLoans(userId);

  if (loading) {
    console.log("🔵 [LoanHistory] Carregando histórico de empréstimos...");
    return <div className="text-center py-8">Carregando histórico...</div>;
  }
  if (error) {
    console.error("🔴 [LoanHistory] Erro ao carregar histórico:", error);
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }
  if (!loans || loans.length === 0) {
    console.warn("🟡 [LoanHistory] Nenhum histórico de empréstimos encontrado.");
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum histórico de empréstimos encontrado.</p>
      </div>
    );
  }

  console.log("🟢 [LoanHistory] Histórico carregado:", loans.length);

  return (
    <div className="space-y-3">
      {loans.map((loan: Loan) => {
        const overdue = loan.due_date ? new Date() > new Date(loan.due_date) : false;
        const { statusText } = getLoanStatusProps(loan);
        return (
          <div
            key={loan.loan_id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-library-purple/10 flex items-center justify-center">
                <Book className="w-5 h-5 text-library-purple" />
              </div>
              <div>
                <div className="flex flex-row flex-wrap items-center gap-x-1">
                  <span className="text-md font-medium text-gray-900">{loan.book_title || `Livro ID: ${loan.book_id}`}</span>
                  <span className="text-sm text-gray-500">{loan.book_authors ? `, ${loan.book_authors}` : ", Autor desconhecido"}</span>
                </div>
                <div className="flex flex-row gap-4 mt-1">
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    Empréstimo: {loan.borrowed_at ? new Date(loan.borrowed_at).toLocaleDateString("pt-BR") : "-"}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    Prazo: {loan.due_date ? new Date(loan.due_date).toLocaleDateString("pt-BR") : "Sem data"}
                  </span>
                  {loan.returned_at && (
                    <span className="flex items-center text-sm text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Devolução: {new Date(loan.returned_at).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  loan.returned_at
                    ? "bg-cm-green/20 text-cm-green"
                    : overdue
                    ? "bg-cm-yellow/20 text-cm-orange"
                    : "bg-library-purple/10 text-library-purple"
                }`}
              >
                {loan.returned_at ? "Devolvido" : overdue ? "Atrasado" : statusText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}