import { useUserList } from "@/features/users/hooks/useUserList";
import ListRenderer, { Column } from "@/features/admin/components/ListRenderer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

/**
 * Lista de usuários cadastrados.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
interface UserListProps {
  onClose?: () => void;
}

const UserList: React.FC<UserListProps> = ({ onClose }) => {
  const { users, loading, error } = useUserList();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const columns: Column<any>[] = [
    { label: "Nome", accessor: "name" },
    { label: "NUSP", accessor: "NUSP" },
    { label: "Email", accessor: "email" },
    { label: "Tipo", accessor: (row) => <span className="capitalize">{row.role}</span> },
  ];

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      String(u.name || "").toLowerCase().includes(term) ||
      String(u.NUSP || "").toLowerCase().includes(term) ||
      String(u.email || "").toLowerCase().includes(term)
    );
  });

  const handleExportCSV = async () => {
    try {
      console.log("🔵 [UserList] Iniciando exportação CSV");
      const response = await fetch('/api/users/export/csv');
      if (!response.ok) throw new Error('Erro ao exportar CSV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso!",
        description: "CSV exportado com sucesso!",
      });
      console.log("🟢 [UserList] CSV exportado com sucesso");
    } catch (error) {
      console.error('🔴 [UserList] Erro ao exportar CSV:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar CSV",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Buscar por nome, NUSP ou email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Button
          variant="default"
          onClick={handleExportCSV}
          className="flex items-center gap-2"
        >
          Exportar CSV
        </Button>
      </div>
      <ListRenderer
        data={filteredUsers}
        columns={columns}
        loading={loading}
        error={error}
        emptyMessage="Nenhum usuário cadastrado."
        footer={
          <span className="text-sm text-gray-600">
            {filteredUsers.length} de {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </span>
        }
        onBack={onClose || (() => {})}
      />
    </>
  );
};

export default UserList;