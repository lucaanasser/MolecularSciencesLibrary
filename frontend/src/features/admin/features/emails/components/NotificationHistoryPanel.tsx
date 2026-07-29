/**
 * Historico de avisos internos dentro da aba Emails (antiga sub-tela da aba
 * Notificacoes). Envolve o NotificationList existente; como so monta quando o
 * item do rail e aberto, o fetch nao roda a toa junto com a caixa de email.
 * Usado em: EmailsInbox.
 */
import NotificationList from "@/features/admin/features/notifications/components/NotificationList";
import { useAdminNotifications } from "@/features/admin/features/notifications/hooks/useAdminNotifications";

export default function NotificationHistoryPanel() {
  const { notifications, loading } = useAdminNotifications();

  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">Histórico de Avisos</h4>
      <NotificationList notifications={notifications} loading={loading} adminSearch />
    </div>
  );
}
