import { useUserList } from "@/features/users/hooks/useUserList";
import AdminListContainer, { Column } from "@/features/admin/components/ListRenderer";
import ActionBar from "@/features/admin/components/ActionBar";

const columns: Column<any>[] = [
  { label: "Nome", accessor: "name" },
  { label: "NUSP", accessor: "NUSP" },
  { label: "Email", accessor: "email" },
  { label: "Tipo", accessor: (row) => <span className="capitalize">{row.role}</span> },
];

export default function AdminListTest() {
  const { users, loading, error } = useUserList();

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <AdminListContainer
        data={users}
        columns={columns}
        loading={loading}
        error={error}
        emptyMessage="Nenhum usuário cadastrado."
        footer={
          <div >
            {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </div>
        }
        onBack={() => window.history.back()}
      />
    </div>
  );
}
