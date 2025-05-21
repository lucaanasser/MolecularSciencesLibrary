import { useEffect, useState } from "react";
import { User } from "../types/user";

export function useUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/users")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao buscar usuários");
        }
        return res.json();
      })
      .then(setUsers)
      .catch((err) => setError(err.message || "Erro ao buscar usuários"))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}