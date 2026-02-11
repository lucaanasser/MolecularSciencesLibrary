import { Loan } from "@/types/loan";
import { Clock } from "lucide-react";
import { AreaIcon } from "./AreaIcon";
import { LoanStatusDot } from "./LoanStatusDot";
import { RenewButton } from "./RenewButton";

interface LoanCardProps {
  loan: Loan;
  renewLoading: number | null;
  setRenewLoading: (id: number | null) => void;
  refetch?: () => void;
  color?: string;
}

export default function LoanCard({
  loan,
  renewLoading,
  setRenewLoading,
  refetch,
  color='library-purple'
}: LoanCardProps) {

  const status = <LoanStatusDot loan={loan} />;
  
  const dateFormatting = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className={`w-full p-2 md:p-4 bg-${color}/10 rounded-2xl`}>
      
      {/* Identificação do livro com ícone da área */}
      <div className="flex flex-row items-center gap-4 min-w-0">
        <div className="flex items-start gap-2 min-w-0">
          
          <div className="flex-shrink-0">
            <AreaIcon area={loan.book?.area} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="prose-sm font-semibold truncate">
              {loan.book?.title || `ID do livro: ${loan.book.id}`}
              {loan.book?.volume && <span className="font-normal text-gray-600">, vol. {loan.book.volume}</span>}
            </div>
            <div className="prose-xs italic text-gray-500 truncate">
              {loan.book?.authors || "Autor desconhecido"}
            </div>
          </div>
        </div>

        <div className="md:ml-auto flex-shrink-0">
          {status}
        </div>

      </div>
      
      {/* Detalhes do empréstimo */}
      <div className="flex flex-row gap-2 prose-xs text-gray-600 py-2 px-1">
          
          <Clock className="w-8 md:w-5 h-auto text-gray-400" />
          <div>
            Empréstimo: {dateFormatting(loan.borrowed_at)}
          </div>
          
          {loan.due_date && !loan.returned_at && (
            <>
              <Clock className={`w-8 md:w-5 h-auto`} />
              <div className={`font-semibold`}>Prazo: {dateFormatting(loan.due_date)}</div>
            </>
          )}
          
          {loan.returned_at && (
            <>
              <Clock className={`w-8 md:w-5 h-auto`} />
              <div className={`font-semibold`}>Devolução: {dateFormatting(loan.returned_at)}</div>
            </>
          )}

      </div>

      {/* Botão de renovação */}
      {!loan.returned_at && (
        <div className="mt-2 mb-0">
          <RenewButton
            loan={loan}
            color={color}
            renewLoading={renewLoading}
            setRenewLoading={setRenewLoading}
            refetch={refetch}
          />
        </div>
      )}
      
    </div>
  );
}
