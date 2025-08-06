import { Clock, RotateCcw } from "lucide-react";
import React from "react";
import { Loan } from "../types/loan";

interface LoanItemProps {
  loan: Loan;
  statusText: string;
  statusColor: string;
  onRenew?: () => void;
  renewLoading?: boolean;
  showRenew?: boolean;
  children?: React.ReactNode;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

export const LoanItem: React.FC<LoanItemProps> = ({
  loan,
  statusText,
  statusColor,
  onRenew,
  renewLoading,
  showRenew = false,
  children,
}) => {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{loan.book_title || `Livro ID: ${loan.book_id}`}</h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>Emprestado: {formatDate(loan.borrowed_at)}</span>
            </div>
            {loan.due_date && (
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span>Prazo: {formatDate(loan.due_date)}</span>
              </div>
            )}
            {loan.returned_at && (
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span>Devolvido: {formatDate(loan.returned_at)}</span>
              </div>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>{statusText}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {showRenew && (
            <button
              className="flex items-center gap-2 bg-cm-purple text-white px-4 py-2 rounded hover:bg-cm-purple/80 disabled:opacity-50"
              onClick={onRenew}
              disabled={renewLoading}
            >
              <RotateCcw className="w-4 h-4" />
              {renewLoading ? "Renovando..." : "Renovar"}
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
