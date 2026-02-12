import { Notification } from "../types/notification";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useListUsers } from "@/features/admin/hooks/useListUsers";

type Props = {
  notifications: Notification[];
  loading?: boolean;
  onDelete?: (id: string | number) => Promise<void> | void;
  adminSearch?: boolean;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

export default function NotificationList({ notifications, loading, onDelete, adminSearch }: Props) {
  const { users, loading: usersLoading, error: usersError } = useListUsers();
  const [query, setQuery] = useState("");
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setFoundUser(null);
    setError("");
    try {
      const q = query.trim().toLowerCase();
      const user = users.find(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase() === q) ||
          (u.NUSP && String(u.NUSP) === q)
      );
      setFoundUser(user || null);
      if (!user) setError("Nenhum usuário encontrado.");
    } catch {
      setFoundUser(null);
      setError("Erro ao buscar usuário.");
    } finally {
      setSearching(false);
    }
  }

  const filteredNotifications = adminSearch && foundUser
    ? notifications.filter(n =>
        (n.metadata && (n.metadata.user_id === foundUser.NUSP || n.metadata.userId === foundUser.NUSP)) ||
        (n as any)["user_id"] === foundUser.NUSP
      )
    : notifications;

  const handleDelete = async (id: string | number) => {
    if (!onDelete) return;
    try {
      await onDelete(id);
    } catch {}
  };

  if (loading) {
    return <div className="text-center py-8">Carregando notificações...</div>;
  }

  if (adminSearch) {
    return (
      <div>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Nome, Email ou NUSP"
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={usersLoading}
            required
          />
          <button
            type="submit"
            className="bg-cm-blue text-white px-4 py-2 rounded hover:bg-cm-blue/90"
            disabled={searching || usersLoading}
          >
            Buscar
          </button>
          {foundUser && (
            <button
              type="button"
              className="ml-2 text-cm-red text-sm"
              onClick={() => { setFoundUser(null); setQuery(""); setError(""); }}
            >
              Limpar
            </button>
          )}
        </form>
        {usersError && <div className="text-red-600 mb-2">{usersError}</div>}
        {foundUser && (
          <div className="border rounded-xl p-4 mb-4 bg-cm-blue/5">
            <div><b>Nome:</b> {foundUser.name}</div>
            <div><b>Email:</b> {foundUser.email}</div>
            <div><b>NUSP:</b> {foundUser.NUSP}</div>
            <div><b>Tipo:</b> {foundUser.role}</div>
          </div>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma notificação encontrada.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl flex items-center justify-between gap-2 ${
                  notification.read
                    ? "bg-white"
                    : "bg-cm-blue/5 border-l-4 border-cm-blue"
                }`}
              >
                <div>
                  <p
                    className={`${notification.read ? "text-gray-600" : "font-medium"}`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(notification.date)}
                  </p>
                </div>
                {onDelete && (
                  <button
                    className="ml-2 text-gray-400 hover:text-red-600 transition"
                    title="Excluir notificação"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma notificação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-xl flex items-center justify-between gap-2 ${
            notification.read
              ? "bg-white"
              : "bg-cm-blue/5 border-l-4 border-cm-blue"
          }`}
        >
          <div>
            <p
              className={`${notification.read ? "text-gray-600" : "font-medium"}`}
            >
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {formatDate(notification.date)}
            </p>
          </div>
          {onDelete && (
            <button
              className="ml-2 text-gray-400 hover:text-red-600 transition"
              title="Excluir notificação"
              onClick={() => handleDelete(notification.id)}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}