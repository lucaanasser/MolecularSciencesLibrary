import { useActiveLoansList } from "./hooks/useActiveLoansList";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListRenderer, { Column } from "@/features/admin/components/ListRenderer";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

import type { ActiveLoan } from "./hooks/useActiveLoansList";

const ActiveLoansList: React.FC<TabComponentProps> = ({ onBack }) => {
  const {
    filteredLoans,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
  } = useActiveLoansList();

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // solução temporária: posteriormente usar status do backend para evitar lógica duplicada
  const getStatusBadge = (loan: ActiveLoan) => {
    if (loan.is_overdue) {
      return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">Atrasado</span>;
    }
    if (loan.is_extended) {
      return <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">Estendido</span>;
    }
    if (loan.renewals > 0) {
      return <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">Renovado ({loan.renewals}x)</span>;
    }
    return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Em dia</span>;
  };

  const columns: Column<ActiveLoan>[] = [
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
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}>
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
        footer={<span> {filteredLoans.length} empréstimos exibidos </span>}
        onBack={onBack}
      />
    </>
  );
};

export default ActiveLoansList;
