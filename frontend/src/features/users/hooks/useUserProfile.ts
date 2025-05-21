import { useEffect, useState } from "react";
import { CurrentUser } from "@/hooks/useCurrentUser";

export function useUserProfile() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao buscar perfil");
        }
        return res.json();
      })
      .then(setUser)
      .catch((err) => setError(err.message || "Erro ao buscar perfil"))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}