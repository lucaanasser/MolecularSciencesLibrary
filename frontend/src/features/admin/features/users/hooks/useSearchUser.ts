import { useState } from "react";
import type { User } from "@/types/user";
import { UsersService } from "@/services/UsersService";
/**
 * Hook para buscar usuários por nome, email ou NUSP.
 */
export function useSearchUser() {
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function search(query: string) {
    setSearching(true);
    setFoundUsers([]);
    setSearched(false);
    setError(null);
    try {
      const users: User[] = await UsersService.searchUsers({ q: query });
      const filtered = users.filter(u => u.role === "aluno");
      setFoundUsers(filtered);
      setSearched(true);
    } catch (err: any) {
      setFoundUsers([]);
      setSearched(true);
      setError(err.message || "Erro ao buscar usuário");
    } finally {
      setSearching(false);
    }
  }

  return { search, searching, searched, foundUsers, error };
}
