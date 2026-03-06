import AdminTabRenderer from "@/features/admin/components/AdminTabRenderer";
import { AddUser, RemoveUser, ListUsers, ImportUsers, PendingUsersTable } from "@/features/admin/features/users";

const ManageUsers = () => {
  return (
    <AdminTabRenderer
      title="Gerenciamento de Usuários"
      description="Adicione, remova ou busque usuários no sistema. Para adicionar múltiplos usuários (batch import), utilize a opção de 'Importar CSV'."
      actions={[
        { id: "add", label: "Adicionar usuário", color: "bg-cm-green" },
        { id: "remove", label: "Remover usuário", color: "bg-cm-red" },
        { id: "list", label: "Ver lista de usuários", color: "bg-cm-blue" },
        { id: "import", label: "Importar CSV", color: "bg-library-purple" },
        { id: "pending", label: "Solicitações de Cadastro", color: "bg-cm-yellow" },
      ]}
      tabComponents={[
        { id: "add", component: AddUser },
        { id: "remove", component: RemoveUser },
        { id: "list", component: ListUsers },
        { id: "import", component: ImportUsers },
        { id: "pending", component: PendingUsersTable },
      ]}
      columns={4}
    />
  );
};

export default ManageUsers;