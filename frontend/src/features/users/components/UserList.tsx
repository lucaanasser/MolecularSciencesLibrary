import { useUserList } from "../hooks/useUserList";

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
    return <div>Carregando usuários...</div>;
  }
  if (error) {
    console.error("🔴 [UserList] Erro ao carregar usuários:", error);
    return <div className="text-red-600">{error}</div>;
  }
  if (!users.length) {
    console.warn("🟡 [UserList] Nenhum usuário cadastrado.");
    return <div>Nenhum usuário cadastrado.</div>;
  }

  console.log("🟢 [UserList] Usuários carregados:", users.length);

  return (
    <div>
      {/* Cabeçalho com botão fechar */}
      {onClose && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="max-h-[400px] overflow-y-auto border rounded-md">
      <table className="min-w-full text-left">
        <thead className="sticky top-0 bg-white z-10">
          <tr>
            <th className="px-3 py-2 border-b text-sm">Nome</th>
            <th className="px-3 py-2 border-b text-sm">NUSP</th>
            <th className="px-3 py-2 border-b text-sm">Email</th>
            <th className="px-3 py-2 border-b text-sm">Tipo</th>
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
      <div className="text-xs text-gray-600 p-2 bg-gray-50 border-t">
        {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
      </div>
      </div>
    </div>
  );
};

export default UserList;