import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListRenderer, { Column } from "@/features/admin/components/ListRenderer";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import { LoansService } from "@/services/LoansService";
import { Loan } from "@/types/loan";

const ActiveLoansList: React.FC<TabComponentProps> = ({ onBack }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "overdue">("all");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    LoansService.getLoans("active")
      .then((data) => {
        if (mounted) setLoans(data);
      })
      .catch(() => {
        if (mounted) setLoans([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filteredLoans = useMemo(() => {
    let filtered = loans;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (loan) =>
          loan.user.name.toLowerCase().includes(term) ||
          loan.user.NUSP.toString().includes(term) ||
          loan.book.title.toLowerCase().includes(term) ||
          loan.book.authors?.toLowerCase().includes(term) ||
          String(loan.book.id).includes(term)
      );
    }
    if (filterStatus === "overdue") {
      filtered = filtered.filter((loan) => loan.is_overdue);
    }
    return filtered;
  }, [loans, searchTerm, filterStatus]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const columns: Column<Loan>[] = [
    { label: "Usuário", accessor: (row) => row.user.name, className: "font-medium" },
    { label: "NUSP", accessor: (row) => row.user.NUSP },
    { label: "ID Livro", accessor: (row) => row.book.id },
    { label: "Livro", accessor: (row) => (
        <div>
          <div className="font-medium text-sm truncate">{row.book.title}</div>
          <div className="text-xs text-gray-500 truncate">{row.book.authors}</div>
        </div>
      ) },
    { label: "Início", accessor: (row) => <span className="text-sm">{formatDate(row.borrowed_at)}</span> },
    { label: "Final", accessor: (row) => <span className="text-sm">{formatDate(row.due_date)}</span> },
    { label: "Status", accessor: (loan) => {
        if (loan.is_overdue) {
          return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">Atrasado</span>;
        }
        return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Em dia</span>;
    } },
  ];

  return (
    <>
      <p>Esses são todos os empréstimos ativos:</p>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <Input
          placeholder="Buscar livro ou usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}>
          <SelectTrigger className="w-full md:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ListRenderer
        data={filteredLoans}
        columns={columns}
        loading={loading}
        error={undefined}
        emptyMessage="Nenhum empréstimo encontrado"
        footer={<span> {filteredLoans.length} empréstimos exibidos </span>}
        onBack={onBack}
      />
    </>
  );
};

export default ActiveLoansList;