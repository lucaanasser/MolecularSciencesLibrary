import { useUserList } from "../hooks/useUserList";

const UserList: React.FC = () => {
  const { users, loading, error } = useUserList();

  if (loading) return <div>Carregando usuários...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!users.length) return <div>Nenhum usuário cadastrado.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left border">
        <thead>
          <tr>
            <th className="px-3 py-2 border-b">Nome</th>
            <th className="px-3 py-2 border-b">NUSP</th>
            <th className="px-3 py-2 border-b">Email</th>
            <th className="px-3 py-2 border-b">Tipo</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.NUSP || u.email}>
              <td className="px-3 py-2 border-b">{u.name}</td>
              <td className="px-3 py-2 border-b">{u.NUSP}</td>
              <td className="px-3 py-2 border-b">{u.email}</td>
              <td className="px-3 py-2 border-b capitalize">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;