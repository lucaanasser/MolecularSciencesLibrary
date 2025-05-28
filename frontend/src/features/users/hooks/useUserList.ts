import { useEffect, useState } from "react";
import { User } from "../types/user";

/**
 * Hook para buscar lista de usuários.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export function useUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log("🔵 [useUserList] Buscando lista de usuários...");
    fetch("/api/users")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          console.error("🔴 [useUserList] Erro ao buscar usuários:", data.error);
          throw new Error(data.error || "Erro ao buscar usuários");
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        console.log("🟢 [useUserList] Lista de usuários carregada:", data.length);
      })
      .catch((err) => {
        setError(err.message || "Erro ao buscar usuários");
        console.error("🔴 [useUserList] Erro ao buscar usuários:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}