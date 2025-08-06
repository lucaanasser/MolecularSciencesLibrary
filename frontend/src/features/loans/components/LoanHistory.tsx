import { useUserLoans } from "../hooks/useUserLoans";
import { Loan } from "../types/loan";
import { LoanItem } from "./LoanItem";

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
    <div className="space-y-4">
      {loans.map((item: Loan) => {
        let statusText = item.returned_at ? "Devolvido" : "Em andamento";
        let statusColor = item.returned_at
          ? "bg-cm-green/10 text-cm-green"
          : "bg-cm-yellow/10 text-cm-orange";
        if (item.is_reserved === 1) {
          statusText = "Reservado";
          statusColor = "bg-purple-200 text-purple-700";
        }
        return (
          <LoanItem
            key={item.loan_id}
            loan={item}
            statusText={statusText}
            statusColor={statusColor}
          />
        );
      })}
    </div>
  );
}