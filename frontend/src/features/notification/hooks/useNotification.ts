import { useEffect, useState } from "react";
import { Notification } from "../types/notification";

function getToken() {
  // Ajuste conforme onde você armazena o token (localStorage, sessionStorage, etc)
  return localStorage.getItem("token");
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/notifications/me", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Erro ao buscar notificações");
      const data = await res.json();
      setNotifications(
        data
          .filter((n: any) => n.status !== "deleted")
          .map((n: any) => ({
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
  }, []);

  return { notifications, loading, refetch: fetchNotifications };
}