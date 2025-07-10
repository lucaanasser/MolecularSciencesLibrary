import { useUserList } from "../../users/hooks/useUserList";
import { User } from "../../users/types/user";

/**
 * Hook para buscar usuário por NUSP, email ou nome.
 */
export function useFindUser() {
  const { users, loading, error } = useUserList();

  function findUser(query: string): User | undefined {
    const q = query.trim().toLowerCase();
    return users.find(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase() === q) ||
        (u.NUSP && String(u.NUSP) === q)
    );
  }

  return { findUser, loading, error };
}
