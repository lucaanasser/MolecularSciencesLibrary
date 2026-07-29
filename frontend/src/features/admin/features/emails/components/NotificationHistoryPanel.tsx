/**
 * Historico de avisos internos (notificacoes) dentro da aba Emails, no padrao
 * visual das listas do painel admin: Input de filtro + tabela do ListRenderer,
 * como ListUsers/ListActiveLoans. So monta quando o item do rail e aberto,
 * entao o fetch nao roda junto com a caixa de email.
 * Usado em: EmailsInbox. Depende de: useAdminNotifications, UsersService.searchUsers.
 */
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import ListRenderer, { Column } from "@/features/admin/components/ListRenderer";
import { useAdminNotifications } from "@/features/admin/features/notifications/hooks/useAdminNotifications";
import { UsersService } from "@/services/UsersService";
import { logger } from "@/utils/logger";
import type { Notification } from "@/features/admin/features/notifications/types/notification";

interface Props {
  onBack: () => void;
}

type UserRef = { name: string; NUSP: number };

export default function NotificationHistoryPanel({ onBack }: Props) {
  const { notifications, loading } = useAdminNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [usersById, setUsersById] = useState<Map<number, UserRef>>(new Map());

  // A notificacao guarda so o user_id; busca os usuarios uma vez para exibir/filtrar por nome.
  useEffect(() => {
    (async () => {
      try {
        const users = await UsersService.searchUsers({ q: "" });
        setUsersById(new Map(users.map((u: any) => [u.id, { name: u.name, NUSP: u.NUSP }])));
      } catch (err) {
        logger.error("🔴 [NotificationHistoryPanel] Erro ao buscar usuários", err);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return notifications;
    const term = searchTerm.toLowerCase();
    return notifications.filter((n) => {
      const user = n.user_id ? usersById.get(n.user_id) : undefined;
      return (
        n.message.toLowerCase().includes(term) ||
        (n.type ?? "").toLowerCase().includes(term) ||
        (user?.name ?? "").toLowerCase().includes(term) ||
        String(user?.NUSP ?? "").includes(term)
      );
    });
  }, [notifications, searchTerm, usersById]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("pt-BR");

  const columns: Column<Notification>[] = [
    { label: "Data", accessor: (row) => <span className="text-sm">{formatDate(row.date)}</span> },
    {
      label: "Usuário",
      accessor: (row) => {
        const user = row.user_id ? usersById.get(row.user_id) : undefined;
        return user ? (
          <div>
            <div className="font-medium text-sm truncate">{user.name}</div>
            <div className="text-xs text-gray-500">{user.NUSP}</div>
          </div>
        ) : (
          <span className="text-gray-500">{row.user_id ?? "-"}</span>
        );
      },
    },
    { label: "Tipo", accessor: (row) => <span className="capitalize">{row.type ?? "-"}</span> },
    {
      label: "Mensagem",
      accessor: (row) => <span className="line-clamp-2 text-sm">{row.message}</span>,
      className: "max-w-md",
    },
    {
      label: "Status",
      accessor: (row) =>
        row.read ? (
          <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">Lida</span>
        ) : (
          <span className="bg-cm-blue text-white px-2 py-1 rounded-full text-xs font-medium">Não lida</span>
        ),
    },
  ];

  return (
    <>
      <p>Avisos internos já enviados aos usuários:</p>
      <div className="mb-4">
        <Input
          placeholder="Buscar por usuário, tipo ou mensagem..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ListRenderer
        data={filtered}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum aviso encontrado."
        footer={<span>{filtered.length} aviso(s) exibido(s)</span>}
        onBack={onBack}
      />
    </>
  );
}
