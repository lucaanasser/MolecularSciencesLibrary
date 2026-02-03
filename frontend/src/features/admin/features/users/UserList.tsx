import { useUserList } from "@/features/users/hooks/useUserList";
import ListRenderer, { Column } from "@/features/admin/components/ListRenderer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import { useExportCSV } from "@/features/admin/hooks/useExportCSV";

/**
 * Lista de usuários cadastrados.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const UserList: React.FC<TabComponentProps> = ({ onBack }) => {
  const { users, loading, error } = useUserList();
  const [searchTerm, setSearchTerm] = useState("");
  const { exportCSV } = useExportCSV({
    endpoint: "/api/users/export/csv",
    filename: "usuarios.csv"
  });

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


  return (
    <>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Buscar por nome, NUSP ou email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full"
        />
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
        onBack={onBack}
        exportCSV={exportCSV}
      />
    </>
  );
};

export default UserList;