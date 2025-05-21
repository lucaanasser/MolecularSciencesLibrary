import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRemoveUser } from "../hooks/useRemoveUser";
import { User } from "../types/user";
interface RemoveUserFormProps {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export default function RemoveUserForm({ onSuccess, onError }: RemoveUserFormProps) {
  const [query, setQuery] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const { removeUser, loading, error } = useRemoveUser();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setFoundUser(null);

    try {
      const res = await fetch(`/api/users`);
      const users: User[] = await res.json();
      const q = query.trim().toLowerCase();
      const user = users.find(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase() === q) ||
          (u.NUSP && String(u.NUSP) === q)
      );
      setFoundUser(user || null);
    } catch (err) {
      setFoundUser(null);
    } finally {
      setSearching(false);
    }
  }

  async function handleRemove() {
    if (!foundUser?.id) return;
    try {
      await removeUser(foundUser.id);
      setFoundUser(null);
      onSuccess && onSuccess();
    } catch (err: any) {
      onError && onError(err);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          placeholder="Nome, Email ou NUSP"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <Button type="submit" disabled={searching}>
          Buscar
        </Button>
      </form>
      {foundUser ? (
        <div className="border rounded-xl p-4 mb-4">
          <div><b>Nome:</b> {foundUser.name}</div>
          <div><b>Email:</b> {foundUser.email}</div>
          <div><b>NUSP:</b> {foundUser.NUSP}</div>
          <div><b>Tipo:</b> {foundUser.role}</div>
          <Button
            className="mt-4 bg-cm-red hover:bg-cm-red/90"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? "Removendo..." : "Remover Usuário"}
          </Button>
        </div>
      ) : (
        query && !searching && (
          <div className="text-gray-500">Nenhum usuário encontrado.</div>
        )
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}