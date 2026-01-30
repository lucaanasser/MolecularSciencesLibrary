import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Donator {
  id: number;
  name: string;
  user_id?: number;
  book_id?: number;
  donation_type: string;
  amount?: number;
  contact?: string;
  notes?: string;
  created_at?: string;
}

export default function DonatorsList() {
  const [donators, setDonators] = useState<Donator[]>([]);
  const [filteredDonators, setFilteredDonators] = useState<Donator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");

  useEffect(() => {
    fetchDonators();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [donators, searchTerm, selectedType, selectedUserType]);

  const fetchDonators = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/donators");
      if (!res.ok) throw new Error("Erro ao buscar doadores");
      const data = await res.json();
      setDonators(data);
    } catch (err) {
      console.error("Erro ao buscar doadores:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...donators];

    // Filtro de texto (busca por ID, nome ou contato)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (donator) =>
          donator.id?.toString().includes(term) ||
          donator.name?.toLowerCase().includes(term) ||
          donator.contact?.toLowerCase().includes(term) ||
          donator.user_id?.toString().includes(term) ||
          donator.book_id?.toString().includes(term)
      );
    }

    // Filtro de tipo de doação
    if (selectedType !== "all") {
      filtered = filtered.filter((donator) => donator.donation_type === selectedType);
    }

    // Filtro de tipo de usuário
    if (selectedUserType === "user") {
      filtered = filtered.filter((donator) => donator.user_id !== null && donator.user_id !== undefined);
    } else if (selectedUserType === "guest") {
      filtered = filtered.filter((donator) => !donator.user_id);
    }

    setFilteredDonators(filtered);
  };

  const getDonationBadge = (donator: Donator) => {
    if (donator.donation_type === "book") {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Livro</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Financeira</Badge>;
  };

  const getUserTypeBadge = (donator: Donator) => {
    if (donator.user_id) {
      return <Badge variant="default" className="border-purple-200 text-purple-700">Cadastrado</Badge>;
    }
    return <Badge variant="default" className="border-gray-300 text-gray-600">Não cadastrado</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando doadores...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Buscar por ID, nome, NUSP, contato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
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

      {/* Tabela com scroll */}
      <div className="rounded-md border max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50 z-10">
            <TableRow>
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">NUSP</TableHead>
              <TableHead className="font-semibold">Tipo Doação</TableHead>
              <TableHead className="font-semibold">Livro/Valor</TableHead>
              <TableHead className="font-semibold">Contato</TableHead>
              <TableHead className="font-semibold">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum doador encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredDonators.map((donator) => (
                <TableRow key={donator.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">{donator.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 group relative">
                      <span className="font-medium">{donator.name}</span>
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          donator.user_id 
                            ? 'bg-purple-500' 
                            : 'bg-gray-400'
                        }`}
                      />
                      <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        {donator.user_id ? 'Usuário cadastrado' : 'Não usuário'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {donator.user_id ? (
                      <span className="text-sm font-mono">{donator.user_id}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getDonationBadge(donator)}</TableCell>
                  <TableCell>
                    {donator.donation_type === "book" ? (
                      <span className="text-sm">
                        <span className="text-gray-500">ID:</span> {donator.book_id || "—"}
                      </span>
                    ) : (
                      <span className="font-semibold text-green-600">
                        R$ {donator.amount?.toFixed(2) || "0.00"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {donator.contact || <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {donator.created_at
                      ? new Date(donator.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Contador */}
      <div className="text-sm text-gray-600">
        Total: {filteredDonators.length} de {donators.length} doador{donators.length !== 1 ? 'es' : ''}
      </div>
    </div>
  );
}
