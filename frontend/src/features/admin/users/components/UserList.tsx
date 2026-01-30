import { useUserList } from "@/features/users/hooks/useUserList";
import ActionBar from "@/features/admin/components/ActionBar";

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

  if (loading) {
    console.log("🔵 [UserList] Carregando usuários...");
    return <div className="text-base font-medium text-gray-700 py-4">Carregando usuários...</div>;
  }
  if (error) {
    console.error("🔴 [UserList] Erro ao carregar usuários:", error);
    return <div className="text-red-600 text-base font-medium py-4">{error}</div>;
  }
  if (!users.length) {
    console.warn("🟡 [UserList] Nenhum usuário cadastrado.");
    return <div className="text-base font-medium text-gray-700 py-4">Nenhum usuário cadastrado.</div>;
  }

  console.log("🟢 [UserList] Usuários carregados:", users.length);

  return (
    <>
      <div className="max-h-[400px] overflow-y-auto border rounded-md">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="px-3 py-2 border-b text-base font-semibold text-gray-700">Nome</th>
              <th className="px-3 py-2 border-b text-base font-semibold text-gray-700">NUSP</th>
              <th className="px-3 py-2 border-b text-base font-semibold text-gray-700">Email</th>
              <th className="px-3 py-2 border-b text-base font-semibold text-gray-700">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.NUSP || u.email}>
                <td className="px-3 py-2 border-b text-sm">{u.name}</td>
                <td className="px-3 py-2 border-b text-sm">{u.NUSP}</td>
                <td className="px-3 py-2 border-b text-sm">{u.email}</td>
                <td className="px-3 py-2 border-b text-sm capitalize">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-sm text-gray-600 p-2 bg-gray-50 border-t font-medium">
          {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
        </div>
      </div>
      {onClose && (
        <div className="mt-4">
          <ActionBar
            onCancel={onClose}
            showCancel={true}
            showConfirm={false}
            cancelLabel="Voltar"
          />
        </div>
      )}
    </>
  );
};

export default UserList;