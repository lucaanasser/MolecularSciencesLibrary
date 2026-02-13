import { useGetUserLoans } from "./useGetUserLoans";
import { useState } from "react";
import LoanCard from "@/features/profile/private/components/LoanCard";
import { User } from "@/types/user";
import { accentColor } from "@/constants/styles";

interface LoanListProps {
  user: User;
  showActive?: boolean; // true = ativos, false = histórico
}

export default function LoanList({ user, showActive = true }: LoanListProps) {
  const { loans, loading, error, refetch } = useGetUserLoans(user.id);
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
          color={accentColor(user.profile_image)}
          renewLoading={renewLoading}
          setRenewLoading={setRenewLoading}
          refetch={refetch}
        />
      ))}
    </div>
  );
}
