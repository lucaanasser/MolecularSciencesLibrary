import React from "react";
import { BookMarked, Globe, Gift, Calendar } from "lucide-react";
import { Book } from "@/types/book";
import NudgeButton from "@/features/old_books/NudgeButton";

export function formatDonator(name?: string, tag?: string): string {
  if (!name) return "";
  if (!tag) return name;
  if (tag === "Prof.") return `Prof. ${name}`;
  return `${name} ${tag}`;
}

export function getReturnLabel(b: Book, loan?: any): string {
  if (b.status === "emprestado" && loan) {
    return loan.is_overdue
      ? `Atrasado desde ${new Date(loan.due_date!).toLocaleDateString("pt-BR")}`
      : `Deve ser devolvido até ${new Date(loan.due_date!).toLocaleDateString("pt-BR")}`;
  }
  return "—";
}

function getStatusConfig(status: Book["status"], isOverdue: boolean) {
  if (status === "disponível")
    return { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Disponível", accent: "border-l-emerald-500" };
  if (status === "emprestado")
    return isOverdue
      ? { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Atrasado", accent: "border-l-red-500" }
      : { dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Emprestado", accent: "border-l-amber-400" };
  if (status === "reservado")
    return { dot: "bg-sky-500", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: "Reservado", accent: "border-l-sky-500" };
  return { dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", label: "Indisponível", accent: "border-l-gray-400" };
}

interface ExemplarsListProps {
  books: Book[];
  loanByBook: { [id: number]: any };
}

const ExemplarsList: React.FC<ExemplarsListProps> = ({ books, loanByBook }) => (
  <div className="mt-6">
    <h4 className="mb-3 font-semibold text-gray-900">Exemplares</h4>

    {/* Desktop */}
    <table className="w-full text-sm hidden sm:table">
      <thead>
        <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
          <th className="pb-2 font-medium pl-1">ID</th>
          <th className="pb-2 font-medium">Edição</th>
          <th className="pb-2 font-medium">Idioma</th>
          <th className="pb-2 font-medium">Doador</th>
          <th className="pb-2 font-medium">Status</th>
          <th className="pb-2 font-medium">Devolução</th>
          <th className="pb-2 font-medium"></th>
        </tr>
      </thead>
      <tbody>
        {books.map((exemplar) => {
          const loan = loanByBook[exemplar.id];
          const isOverdue = loan?.is_overdue ?? false;
          const sc = getStatusConfig(exemplar.status, isOverdue);
          const donator = formatDonator(exemplar.donator_name, exemplar.donator_tag);
          const returnLabel = getReturnLabel(exemplar, loan);
          return (
            <tr key={exemplar.id} className="hover:bg-library-purple/5 transition-colors">
              <td className="py-2.5 pl-1 font-mono text-xs text-gray-400">#{exemplar.id}</td>
              <td className="py-2.5 text-gray-700">{exemplar.edition || "—"}</td>
              <td className="py-2.5 text-gray-600">{exemplar.language}</td>
              <td className="py-2.5">
                {donator
                  ? <span className="text-library-purple font-medium text-xs">{donator}</span>
                  : <span className="text-gray-300">—</span>}
              </td>
              <td className="py-2.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                  <span className="text-gray-700">{sc.label}</span>
                </span>
              </td>
              <td className={`py-2.5 text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                {exemplar.status === "emprestado" ? returnLabel : "—"}
              </td>
              <td className="py-2.5">
                {exemplar.status === "emprestado" && <NudgeButton book={exemplar} />}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {/* Mobile */}
    <div className="sm:hidden flex flex-col gap-3">
      {books.map((exemplar) => {
        const loan = loanByBook[exemplar.id];
        const isOverdue = loan?.is_overdue ?? false;
        const sc = getStatusConfig(exemplar.status, isOverdue);
        const donator = formatDonator(exemplar.donator_name, exemplar.donator_tag);
        const returnLabel = getReturnLabel(exemplar, loan);
        return (
          <div
            key={exemplar.id}
            className={`rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm border-l-[3px] ${sc.accent}`}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text} border ${sc.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
                <span className="font-mono text-xs text-gray-400">#{exemplar.id}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <BookMarked className="w-4 h-4 text-library-purple flex-shrink-0" />
                  <span className="text-xs text-gray-400 w-14 flex-shrink-0">Edição</span>
                  <span className="text-sm text-gray-800 font-medium">{exemplar.edition || "—"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-library-purple flex-shrink-0" />
                  <span className="text-xs text-gray-400 w-14 flex-shrink-0">Idioma</span>
                  <span className="text-sm text-gray-800 font-medium">{exemplar.language}</span>
                </div>
                {donator && (
                  <div className="flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-library-purple flex-shrink-0" />
                    <span className="text-xs text-gray-400 w-14 flex-shrink-0">Doador</span>
                    <span className="text-sm text-library-purple font-semibold">{donator}</span>
                  </div>
                )}
                {exemplar.status === "emprestado" && (
                  <div className="flex items-center gap-2.5">
                    <Calendar className={`w-4 h-4 flex-shrink-0 ${isOverdue ? "text-red-500" : "text-library-purple"}`} />
                    <span className="text-xs text-gray-400 w-14 flex-shrink-0">Devol.</span>
                    <span className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
                      {returnLabel}
                    </span>
                  </div>
                )}
              </div>
              {exemplar.status === "emprestado" && (
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <NudgeButton book={exemplar} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default ExemplarsList;
