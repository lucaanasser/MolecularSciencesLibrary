import { useState } from "react";

/**
 * Hook para remover usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export function useRemoveUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function removeUser(userId: number) {
    setLoading(true);
    setError(null);
    try {
      console.log("🔵 [useRemoveUser] Removendo usuário:", userId);
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("🔴 [useRemoveUser] Erro ao remover usuário:", data.error);
        throw new Error(data.error || "Erro ao remover usuário");
      }
      console.log("🟢 [useRemoveUser] Usuário removido com sucesso:", userId);
      return true;
    } catch (err: any) {
      setError(err.message || "Erro ao remover usuário");
      console.error("🔴 [useRemoveUser] Erro ao remover usuário:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { removeUser, loading, error };
}