import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AdminListContainer, { Column } from "@/features/admin/components/ListRenderer";
import { useDonatorsList } from "@/features/donators/hooks/useDonatorsList";
import { Donator } from "@/features/donators/types/Donator";

interface DonatorsListProps {
  onBack: () => void;
  onExportCSV: () => void;
}


const DonatorsList: React.FC<DonatorsListProps> = ({ onBack, onExportCSV }) => {
  const { donators, loading, error, fetchDonators } = useDonatorsList();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [filteredDonators, setFilteredDonators] = useState<Donator[]>([]);

  useEffect(() => {
    fetchDonators();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let filtered = [...donators];
    const term = searchTerm.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(
        (donator) =>
          donator.id?.toString().includes(term) ||
          donator.name?.toLowerCase().includes(term) ||
          donator.contact?.toLowerCase().includes(term) ||
          donator.user_id?.toString().includes(term) ||
          donator.book_id?.toString().includes(term)
      );
    }
    if (selectedType !== "all") {
      filtered = filtered.filter((donator) => donator.donation_type === selectedType);
    }
    if (selectedUserType === "user") {
      filtered = filtered.filter((donator) => donator.user_id !== null && donator.user_id !== undefined);
    } else if (selectedUserType === "guest") {
      filtered = filtered.filter((donator) => !donator.user_id);
    }
    setFilteredDonators(filtered);
  }, [donators, searchTerm, selectedType, selectedUserType]);

  const columns: Column<Donator>[] = [
    {
      label: "ID",
      accessor: "id",
      className: "font-mono text-sm",
    },
    {
      label: "Nome",
      accessor: (donator) => (
        <div className="flex items-center gap-1.5 group relative">
          <span className="font-medium">{donator.name}</span>
          <div 
            className={`w-2 h-2 rounded-full ${donator.user_id ? 'bg-purple-500' : 'bg-gray-400'}`}
          />
          <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            {donator.user_id ? 'Usuário cadastrado' : 'Não usuário'}
          </div>
        </div>
      ),
    },
    {
      label: "NUSP",
      accessor: (donator) => donator.user_id ? <span className="text-sm font-mono">{donator.user_id}</span> : <span className="text-gray-400 text-sm">—</span>,
    },
    {
      label: "Tipo Doação",
      accessor: (donator) => donator.donation_type === "book"
        ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Livro</Badge>
        : <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Financeira</Badge>,
    },
    {
      label: "Livro/Valor",
      accessor: (donator) => donator.donation_type === "book"
        ? <span className="text-sm"><span className="text-gray-500">ID:</span> {donator.book_id || "—"}</span>
        : <span className="font-semibold text-green-600">R$ {donator.amount?.toFixed(2) || "0.00"}</span>,
    },
    {
      label: "Contato",
      accessor: (donator) => donator.contact || <span className="text-gray-400">—</span>,
    },
    {
      label: "Data",
      accessor: (donator) => donator.created_at
        ? new Date(donator.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "—",
      className: "text-sm text-gray-600",
    },
  ];

  return (
    <>
        <p>Esses são os doadores cadastrados no sistema:</p>
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Buscar por ID, nome, NUSP, contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button
              variant="default"
              onClick={onExportCSV}
              className="flex items-center gap-2"
            >
              Exportar CSV
            </Button>
          </div>
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Tipo de doação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="book">Livro</SelectItem>
                <SelectItem value="money">Financeira</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedUserType} onValueChange={setSelectedUserType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Tipo de doador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="user">Usuários cadastrados</SelectItem>
                <SelectItem value="guest">Não cadastrados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AdminListContainer
          data={filteredDonators}
          columns={columns}
          loading={loading}
          error={error}
          emptyMessage="Nenhum doador encontrado"
          footer={<span className="text-sm text-gray-600">Total: {filteredDonators.length} de {donators.length} doador{donators.length !== 1 ? 'es' : ''}</span>}
          onBack={onBack}
        />
    </>
  );
};

export default DonatorsList;
