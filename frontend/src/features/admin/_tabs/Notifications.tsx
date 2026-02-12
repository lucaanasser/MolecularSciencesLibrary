import { useState } from "react";
import ActionGrid from "@/features/admin/components/ActionGrid";
import SendNotification from "@/features/admin/features/notifications/components/Sendnotification";
import NotificationList from "@/features/admin/features/notifications/components/NotificationList";
import InboxList from "@/features/admin/features/notifications/components/InboxList";
import { useAdminNotifications } from "@/features/admin/features/notifications/hooks/useAdminNotifications";
import { useInbox } from "@/features/admin/features/notifications/hooks/useInbox";


const Notifications = () => {
  // Log de início de renderização das notificações
  console.log("🔵 [AdminPage/Notifications] Renderizando notificações");
  const [selectedTab, setSelectedTab] = useState<"send" | "history" | "inbox" | null>(null);
  const { notifications, loading } = useAdminNotifications();
  const { emails, loading: inboxLoading, error: inboxError, refetch } = useInbox();

  return (
    <>
      {!selectedTab && (
        <>
        <h3>Notificações</h3>
        <p>Envie notificações para usuários sobre devoluções e eventos.</p>
        <ActionGrid
          columns={3}
          actions={[
            {
              label:"Enviar aviso",
              color: "bg-cm-green",
              onClick: () => setSelectedTab("send"),
            },
            {
              label: "Ver Histórico",
              color:"bg-cm-blue",
              onClick: () => setSelectedTab("history"),
              icon: null,
            },
            {
              label: "Ver Inbox",
              color:"bg-cm-orange",
              onClick: () => setSelectedTab("inbox"),
            },
          ]}
        />
        </>
      )}
      
      {selectedTab === "send" && (
        <SendNotification />
      )}

      {selectedTab === "history" && (
        <div className="rounded-xl shadow-sm p-4 bg-white">
          <h3 className="text-lg font-semibold mb-2">Histórico de Notificações</h3>
          <NotificationList notifications={notifications} loading={loading} adminSearch />
        </div>
      )}

      {selectedTab === "inbox" && (
        <div className="rounded-xl shadow-sm p-4 bg-white">
          <h3 className="text-lg font-semibold mb-2">Caixa de Entrada</h3>
          <InboxList 
            emails={emails} 
            loading={inboxLoading} 
            error={inboxError} 
            onEmailDeleted={refetch}
          />
        </div>
      )}
      
    </>
  );
};

export default Notifications;
