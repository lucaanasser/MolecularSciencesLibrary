import { useState } from "react";
import ActionGrid from "@/features/admin/components/ActionGrid";
import SendNotification from "@/features/admin/features/notifications/components/Sendnotification";
import NotificationList from "@/features/admin/features/notifications/components/NotificationList";
import { useAdminNotifications } from "@/features/admin/features/notifications/hooks/useAdminNotifications";

// A antiga sub-tela de inbox (IMAP) saiu daqui: a caixa de contato@ virou a aba "Emails".
const Notifications = () => {
  // Log de início de renderização das notificações
  console.log("🔵 [AdminPage/Notifications] Renderizando notificações");
  const [selectedTab, setSelectedTab] = useState<"send" | "history" | null>(null);
  const { notifications, loading } = useAdminNotifications();

  return (
    <>
      {!selectedTab && (
        <>
        <h3>Notificações</h3>
        <p>Envie notificações para usuários sobre devoluções e eventos.</p>
        <ActionGrid
          columns={2}
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

    </>
  );
};

export default Notifications;
