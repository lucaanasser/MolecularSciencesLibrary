import { useState } from "react";

/**
 * Hook para adicionar usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export function useAddUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addUser(user: { name: string; email: string; NUSP: number; phone: string }) {
    setLoading(true);
    setError(null);
    try {
      console.log("🔵 [useAddUser] Adicionando usuário:", user.name, user.NUSP, user.email, user.phone);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, role: "aluno" }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("🔴 [useAddUser] Erro ao adicionar usuário:", data.error);
        throw new Error(data.error || "Erro ao adicionar usuário");
      }
      const data = await res.json();
      console.log("🟢 [useAddUser] Usuário adicionado com sucesso:", data);
      return data;
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar usuário");
      console.error("🔴 [useAddUser] Erro ao adicionar usuário:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { addUser, loading, error };
}