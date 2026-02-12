/* DEPRECATED */

import { useState } from "react";
import { UsersService } from "@/services/UsersService";
import type { User } from "@/types/user";

export function useListUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (query: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const result = await UsersService.searchUsers({ q: query });
      setUsers(result);
    } catch (err: any) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, fetchUsers };
}