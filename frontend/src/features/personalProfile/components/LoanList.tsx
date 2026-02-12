import { useGetUserLoans } from "./useGetUserLoans";
import { useState } from "react";
import LoanCard from "@/features/personalProfile/components/LoanCard";

interface LoanListProps {
  userId: number | undefined;
  color: string;
  showActive?: boolean; // true = ativos, false = histórico
}

export default function LoanList({ userId, color, showActive = true }: LoanListProps) {
  const { loans, loading, error, refetch } = useGetUserLoans(userId);
  const [renewLoading, setRenewLoading] = useState<number | null>(null);

  const filteredLoans = showActive 
    ? (loans || []).filter(l => !l.returned_at) 
    : (loans || []).filter(l => l.returned_at);

  const emptyMessage = showActive 
    ? "Nenhum empréstimo ativo." 
    : "Nenhum empréstimo no histórico.";

  const loadingMessage = showActive 
    ? "Carregando empréstimos ativos..." 
    : "Carregando histórico...";

  if (loading) return <div>{loadingMessage}</div>;
  if (error) return <div>{error}</div>;
  if (!filteredLoans.length) return <div>{emptyMessage}</div>;

  return (
    <div className="grid grid-cols-1 gap-4">
      {filteredLoans.map((loan) => (
        <LoanCard
          key={loan.id}
          loan={loan}
          color={color}
          renewLoading={renewLoading}
          setRenewLoading={setRenewLoading}
          refetch={refetch}
        />
      ))}
    </div>
  );
}
