import { useState } from "react";

export function useRemoveUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function removeUser(userId: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao remover usuário");
      }
      return true;
    } catch (err: any) {
      setError(err.message || "Erro ao remover usuário");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { removeUser, loading, error };
}