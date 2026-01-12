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
      return <Badge className="bg-blue-500">Livro</Badge>;
    }
    return <Badge className="bg-green-500">Financeira</Badge>;
  };

  const getUserTypeBadge = (donator: Donator) => {
    if (donator.user_id) {
      return <Badge variant="outline" className="text-xs">Usuário</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Não usuário</Badge>;
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
      <div className="rounded-md border max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="text-sm">ID</TableHead>
              <TableHead className="text-sm">Nome</TableHead>
              <TableHead className="text-sm">Tipo</TableHead>
              <TableHead className="text-sm">Detalhes</TableHead>
              <TableHead className="text-sm">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum doador encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredDonators.map((donator) => (
                <TableRow key={donator.id}>
                  <TableCell className="font-mono text-sm">{donator.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{donator.name}</div>
                    <div className="flex gap-1 mt-1">
                      {getUserTypeBadge(donator)}
                      {donator.user_id && (
                        <span className="text-xs text-gray-500">NUSP: {donator.user_id}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getDonationBadge(donator)}</TableCell>
                  <TableCell className="text-sm">
                    {donator.donation_type === "book" ? (
                      <span>Livro ID: {donator.book_id}</span>
                    ) : (
                      <span className="font-semibold text-green-600">
                        R$ {donator.amount?.toFixed(2)}
                      </span>
                    )}
                    {donator.contact && (
                      <div className="text-xs text-gray-500 mt-1">{donator.contact}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {donator.created_at
                      ? new Date(donator.created_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Contador */}
      <div className="text-xs text-gray-600">
        {filteredDonators.length} de {donators.length} doadores
      </div>
    </div>
  );
}
