import { useState } from "react";

function getToken() {
  return localStorage.getItem("token");
}

/**
 * Hook para deletar email da caixa de entrada.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export function useDeleteEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEmail = async (emailId: string | number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔵 [useDeleteEmail] Deletando email:", emailId);
      const token = getToken();
      const res = await fetch(`/api/notifications/inbox/${emailId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!res.ok) {
        const data = await res.json();
        console.error("🔴 [useDeleteEmail] Erro ao deletar email:", data.error);
        throw new Error(data.error || "Erro ao deletar email");
      }
      
      console.log("🟢 [useDeleteEmail] Email deletado com sucesso:", emailId);
      return true;
    } catch (err: any) {
      setError(err.message || "Erro ao deletar email");
      console.error("🔴 [useDeleteEmail] Erro ao deletar email:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteEmail, loading, error };
}
