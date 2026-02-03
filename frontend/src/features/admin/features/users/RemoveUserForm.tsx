import { useState } from "react";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";
import { useRemoveUser } from "@/features/users/hooks/useRemoveUser";
import { User } from "@/features/users/types/user";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

/**
 * Formulário para remover usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

export default function RemoveUserForm({ onSuccess, onError, onBack }: TabComponentProps) {
  const [query, setQuery] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const { removeUser, loading, error } = useRemoveUser();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await doSearch();
  }

  async function doSearch() {
    setSearching(true);
    setFoundUser(null);
    setSearched(false);
    try {
      console.log("🔵 [RemoveUserForm] Buscando usuário:", query);
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
      setSearched(true);
      if (user) {
        console.log("🟢 [RemoveUserForm] Usuário encontrado:", user);
      } else {
        console.warn("🟡 [RemoveUserForm] Nenhum usuário encontrado para:", query);
      }
    } catch (err) {
      setFoundUser(null);
      setSearched(true);
      console.error("🔴 [RemoveUserForm] Erro ao buscar usuário:", err);
    } finally {
      setSearching(false);
    }
  }

  // Handler para ActionBar
  function handleSearchClick() {
    doSearch();
  }

  async function handleRemove() {
    if (!foundUser?.id) return;
    try {
      console.log("🔵 [RemoveUserForm] Removendo usuário:", foundUser.id);
      await removeUser(foundUser.id);
      setFoundUser(null);
      onSuccess("Usuário removido com sucesso!");
      console.log("🟢 [RemoveUserForm] Usuário removido com sucesso");
    } catch (err: any) {
      onError(err);
      console.error("🔴 [RemoveUserForm] Erro ao remover usuário:", err);
    }
  }

  return (
    <div>
      {!foundUser && (
        <div>
          <p>Busque um usuário pelo nome, email ou NUSP:</p>
          <form onSubmit={handleSearch} className="">
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearched(false);
              }}
              required
            />
            <ActionBar
              onConfirm={handleSearchClick}
              onCancel={onBack}
              confirmLabel={searching ? "Buscando..." : "Buscar"}
              loading={searching}
              showCancel={!!onBack}
            />
          </form>
        </div>
      )}

      {foundUser && (
        <div className="border-2 rounded-xl p-6 my-4">
          <p className="mb-2"><b>Nome:</b> {foundUser.name}</p>
          <p className="mb-2"><b>Email:</b> {foundUser.email}</p>
          <p className="mb-2"><b>NUSP:</b> {foundUser.NUSP}</p>
          <p className="mb-2"><b>Tipo:</b> {foundUser.role}</p>
          <ActionBar
            onConfirm={handleRemove}
            onCancel={() => {
              setFoundUser(null);
              setSearched(false);
              setQuery("");
            }}
            confirmLabel={loading ? "Removendo..." : "Remover"}
            confirmColor="bg-cm-red"
            loading={loading}
          />
        </div>
      )}

      {searched && query && !searching && !foundUser && (
        <p className="text-cm-red mt-4">Nenhum usuário encontrado.</p>
      )}

      {error && <p className="text-cm-red mt-4">{error}</p>}
    </div>
  );
}