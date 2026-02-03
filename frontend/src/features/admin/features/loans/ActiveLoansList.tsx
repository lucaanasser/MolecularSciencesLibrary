import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListRenderer, { Column } from "@/features/admin/components/ListRenderer";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import { useExportCSV } from "@/features/admin/hooks/useExportCSV";

interface ActiveLoan {
  loan_id: number;
  book_id: number;
  book_title: string;
  book_authors: string;
  student_id: number;
  user_name: string;
  user_nusp: string;
  borrowed_at: string;
  due_date: string;
  renewals: number;
  is_extended: number;
  is_overdue: boolean;
}

const ActiveLoansList: React.FC<TabComponentProps> = ({ onBack }) => {
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "overdue" | "extended" | "renewed">("all");
  const { exportCSV } = useExportCSV({
    endpoint: "/api/loans/active/export/csv",
    filename: "emprestimos_ativos.csv"
  });

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [loans, searchTerm, filterStatus]);

  const fetchActiveLoans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/loans/active");
      if (!res.ok) throw new Error("Erro ao buscar empréstimos");
      const data = await res.json();
      setLoans(data);
    } catch (err) {
      console.error("Erro ao buscar empréstimos ativos:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...loans];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (loan) =>
          (String(loan.user_name || "")).toLowerCase().includes(term) ||
          (String(loan.user_nusp || "")).toLowerCase().includes(term) ||
          (String(loan.book_title || "")).toLowerCase().includes(term)
      );
    }
    if (filterStatus === "overdue") {
      filtered = filtered.filter((loan) => loan.is_overdue);
    } else if (filterStatus === "extended") {
      filtered = filtered.filter((loan) => loan.is_extended === 1);
    } else if (filterStatus === "renewed") {
      filtered = filtered.filter((loan) => loan.renewals > 0);
    }
    setFilteredLoans(filtered);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (loan: ActiveLoan) => {
    if (loan.is_overdue) {
      return <Badge className="bg-red-500">Atrasado</Badge>;
    }
    if (loan.is_extended === 1) {
      return <Badge className="bg-purple-500">Estendido</Badge>;
    }
    if (loan.renewals > 0) {
      return <Badge className="bg-blue-500">Renovado ({loan.renewals}x)</Badge>;
    }
    return <Badge className="bg-green-500">Em dia</Badge>;
  };

  const columns: Column<ActiveLoan>[] = [
    { label: "Usuário", accessor: "user_name", className: "font-medium" },
    { label: "NUSP", accessor: "user_nusp" },
    { label: "Livro", accessor: (row) => (
        <div className="max-w-[150px]">
          <div className="font-medium truncate text-sm">{row.book_title}</div>
          <div className="text-xs text-gray-500 truncate">{row.book_authors}</div>
        </div>
      ) },
    { label: "Início", accessor: (row) => <span className="text-sm">{formatDate(row.borrowed_at)}</span> },
    { label: "Final", accessor: (row) => <span className="text-sm">{formatDate(row.due_date)}</span> },
    { label: "Status", accessor: (row) => getStatusBadge(row) },
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
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-full md:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
            <SelectItem value="extended">Estendidos</SelectItem>
            <SelectItem value="renewed">Renovados</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ListRenderer
        data={filteredLoans}
        columns={columns}
        loading={loading}
        error={undefined}
        emptyMessage="Nenhum empréstimo encontrado"
        footer={
          <span> {filteredLoans.length} empréstimos exibidos </span>
        }
        onBack={onBack}
        exportCSV={exportCSV}
      />
    </>
  );
};

export default ActiveLoansList;
