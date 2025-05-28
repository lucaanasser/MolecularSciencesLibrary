import { useEffect, useState } from "react";
import { User } from "../types/user";

/**
 * Hook para buscar perfil do usuário autenticado.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    console.log("🔵 [useUserProfile] Buscando perfil do usuário autenticado");
    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          console.error("🔴 [useUserProfile] Erro ao buscar perfil:", data.error);
          throw new Error(data.error || "Erro ao buscar perfil");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        console.log("🟢 [useUserProfile] Perfil carregado:", data);
      })
      .catch((err) => {
        setError(err.message || "Erro ao buscar perfil");
        console.error("🔴 [useUserProfile] Erro ao buscar perfil:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}