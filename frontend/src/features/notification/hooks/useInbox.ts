import { useEffect, useState } from "react";

export type Email = {
  id: string | number;
  subject: string;
  from: string;
  date: string;
  body: string;
};

function getToken() {
  return localStorage.getItem("token");
}

export function useInbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInbox = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch("/api/notifications/inbox", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Erro ao buscar emails da caixa de entrada");
      const data = await res.json();
      setEmails(data);
    } catch (e: any) {
      setError(e.message || "Erro ao buscar emails");
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  return { emails, loading, error, refetch: fetchInbox };
}
