import { useState } from "react";

export function useAddUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addUser(user: { name: string; email: string; password: string; NUSP: number }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, role: "aluno" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao adicionar usuário");
      }
      return await res.json();
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar usuário");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { addUser, loading, error };
}