import { useState, useEffect } from "react";
import ListRenderer, { Column } from "@/features/admin/components/ListRenderer";
import { Input } from "@/components/ui/input";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import { useExportCSV } from "@/features/admin/hooks/useExportCSV";
import { UsersService } from "@/services/UsersService";
import type { User } from "@/types/user";

/**
 * Lista de usuários cadastrados.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const ListUsers: React.FC<TabComponentProps> = ({ onBack, onError }) => {
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const { exportCSV } = useExportCSV({
    endpoint: "/api/users/export/csv",
    filename: "usuarios.csv"
  });

  // Busca ao digitar
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    try {
      const users = await UsersService.searchUsers({ q: value });
      setFoundUsers(users.filter(u => u.role === "aluno"));
    } catch (err: any) {
      onError && onError(err.message);
      setFoundUsers([]);
    }
  };

  // Busca todos ao abrir a página
  useEffect(() => {
    (async () => {
      try {
        const users = await UsersService.searchUsers({ q: "" });
        setFoundUsers(users);
      } catch (err: any) {
        onError && onError(err.message);
        setFoundUsers([]);
      }
    })();
  }, []);

  // Definição das colunas da tabela
  const columns: Column<any>[] = [
    { label: "NUSP", accessor: "NUSP", className: "font-mono" },
    { label: "Nome", accessor: "name" },
    { label: "Email", accessor: "email" },
    { label: "Tipo", accessor: (row) => <span className="capitalize">{row.role}</span> },
  ];

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Buscar por nome, NUSP ou email..."
          value={searchTerm}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>
      <ListRenderer
        data={foundUsers}
        columns={columns}
        emptyMessage={searchTerm ? "Nenhum usuário cadastrado." : undefined}
        footer={
          <span className="text-sm text-gray-600">
            {foundUsers.length} usuário(s) encontrado(s)
          </span>
        }
        onBack={onBack}
        exportCSV={exportCSV}
      />
    </>
  );
};

export default ListUsers;