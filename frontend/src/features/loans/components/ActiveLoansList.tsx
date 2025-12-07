import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface ActiveLoansListProps {
  onClose?: () => void;
}

export default function ActiveLoansList({ onClose }: ActiveLoansListProps = {}) {
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "overdue" | "extended" | "renewed">("all");

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

    // Filtro de texto (busca por nome, NUSP ou título do livro)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (loan) =>
          loan.user_name?.toLowerCase().includes(term) ||
          loan.user_nusp?.toLowerCase().includes(term) ||
          loan.book_title?.toLowerCase().includes(term)
      );
    }

    // Filtro de status
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

  if (loading) {
    return <div className="text-center py-8">Carregando empréstimos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com botão fechar */}
      {onClose && (
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-2">
        <Input
          placeholder="Buscar..."
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

      {/* Tabela com scroll */}
      <div className="rounded-md border max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>NUSP</TableHead>
              <TableHead>Livro</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Final</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLoans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum empréstimo encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredLoans.map((loan) => (
                <TableRow key={loan.loan_id}>
                  <TableCell className="font-medium">{loan.user_name || "-"}</TableCell>
                  <TableCell>{loan.user_nusp || "-"}</TableCell>
                  <TableCell>
                    <div className="max-w-[150px]">
                      <div className="font-medium truncate text-sm">{loan.book_title}</div>
                      <div className="text-xs text-gray-500 truncate">{loan.book_authors}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(loan.borrowed_at)}</TableCell>
                  <TableCell className="text-sm">{formatDate(loan.due_date)}</TableCell>
                  <TableCell>{getStatusBadge(loan)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Contador */}
      <div className="text-xs text-gray-600">
        {filteredLoans.length} de {loans.length} empréstimos
      </div>
    </div>
  );
}
