import { useEffect, useState } from "react";
import { Notification } from "../types/notification";

function getToken() {
  return localStorage.getItem("token");
}

export function useAdminNotifications(filterUserId?: string | number) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = "/api/notifications";
      if (filterUserId) {
        url += `?user_id=${filterUserId}`;
      }
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Erro ao buscar notificações");
      const data = await res.json();
      setNotifications(
        data.map((n: any) => ({
          id: n.id,
          message: n.message,
          date: n.created_at,
          read: n.status === "read",
          type: n.type,
          metadata: n.metadata ? JSON.parse(n.metadata) : undefined,
        }))
      );
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUserId]);

  return { notifications, loading, refetch: fetchNotifications };
}
