import AdminTabRenderer from "@/features/admin/components/AdminTabRenderer";
import AddUserForm from "@/features/admin/features/users/AddUserForm";
import UserList from "@/features/admin/features/users/UserList";
import RemoveUserForm from "@/features/admin/features/users/RemoveUserForm";
import ImportUsers from "@/features/admin/features/users/ImportUsers";

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
      ]}
      tabComponents={[
        { id: "add", component: AddUserForm },
        { id: "remove", component: RemoveUserForm },
        { id: "list", component: UserList },
        { id: "import", component: ImportUsers },
      ]}
      columns={4}
    />
  );
};

export default ManageUsers;