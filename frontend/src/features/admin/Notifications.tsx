import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SendNotification from "@/features/notifications/components/Sendnotification";
import NotificationList from "@/features/notifications/components/NotificationList";
import InboxList from "@/features/notifications/components/InboxList";
import { useAdminNotifications } from "@/features/notifications/hooks/useAdminNotifications";
import { useInbox } from "@/features/notifications/hooks/useInbox";


const Notifications = () => {
  // Log de início de renderização das notificações
  console.log("🔵 [AdminPage/Notifications] Renderizando notificações");
  const [showSend, setShowSend] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const { notifications, loading } = useAdminNotifications();
  const { emails, loading: inboxLoading, error: inboxError, refetch } = useInbox();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Notificações</h2>
      <p className="text-sm sm:text-base text-gray-600">Envie notificações para usuários sobre devoluções e eventos.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {/* Enviar Avisos */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Enviar Avisos</CardTitle>
          </CardHeader>
          <CardContent>
            {showSend ? (
              <>
                <SendNotification />
                <Button
                  variant="default"
                  className="mt-4 w-full text-sm sm:text-base"
                  onClick={() => setShowSend(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-green hover:bg-cm-green/90 text-sm sm:text-base"
                onClick={() => setShowSend(true)}
              >
                Enviar Aviso
              </Button>
            )}
          </CardContent>
        </Card>
        {/* Histórico de Notificações */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Histórico de Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            {showHistory ? (
              <>
                <NotificationList notifications={notifications} loading={loading} adminSearch />
                <Button
                  variant="default"
                  className="mt-4 w-full text-sm sm:text-base"
                  onClick={() => setShowHistory(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-blue hover:bg-cm-blue/90 text-sm sm:text-base"
                onClick={() => setShowHistory(true)}
              >
                Ver Histórico
              </Button>
            )}
          </CardContent>
        </Card>
        {/* Caixa de Entrada */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Caixa de Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            {showInbox ? (
              <>
                <InboxList 
                  emails={emails} 
                  loading={inboxLoading} 
                  error={inboxError} 
                  onEmailDeleted={refetch}
                />
                <Button
                  variant="default"
                  className="mt-4 w-full text-sm sm:text-base"
                  onClick={() => setShowInbox(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-orange hover:bg-cm-orange/90 text-sm sm:text-base"
                onClick={() => setShowInbox(true)}
              >
                Ver Inbox
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
