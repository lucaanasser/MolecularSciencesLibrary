import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";
import { UsersService } from "@/services/UsersService";
import type { User } from "@/types/user";

export default function RemoveUserForm({ onSuccess, onError, onBack }) {
  // Estados
  const [query, setQuery] = useState("");
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Controle da busca
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFoundUsers([]);
    setSelectedUser(null);
    try {
      const users = await UsersService.searchUsers({ q: query });
      const filtered = users.filter(u => u.role === "aluno");
      setFoundUsers(filtered);
      if (filtered.length === 0) {
        onError && onError("Nenhum usuário encontrado.");
      }
    } catch (err: any) {
      setFoundUsers([]);
      onError && onError(err.message || "Erro ao buscar usuários.");
    }
  }, [query, onError]);

  // Controle da remoção
  const handleRemove = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser?.id) {
      onError && onError("Selecione um usuário para remover.");
      return;
    }
    try {
      await UsersService.deleteUserById(selectedUser.id);
      setSelectedUser(null);
      setFoundUsers([]);
      setQuery("");
      onSuccess && onSuccess("Usuário removido com sucesso!");
    } catch (err: any) {
      onError && onError(err.message || "Erro ao remover usuário.");
    }
  }, [selectedUser, onSuccess, onError]);

  // Renderização condicional
  const showInput = !selectedUser && foundUsers.length === 0;
  const showList = !selectedUser && foundUsers.length > 0;
  const showConfirm = !!selectedUser;

  return (
    <div>
      {showInput && (
        <div>
          <p>Busque o usuário a ser removido</p>
          <form onSubmit={handleSearch} className="">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Digite nome, email ou NUSP"
              required
            />
            <ActionBar
              onConfirm={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
              onCancel={onBack}
              confirmLabel="Buscar"
            />
          </form>
        </div>
      )}

      {showList && (
        <div>
          <p>Selecione o usuário que deseja remover:</p>
          <ul>
            {foundUsers.map(user => (
              <li key={user.id} className="py-2 flex items-center justify-between">
                <button
                  className="w-full px-4 py-2 rounded-xl hover:bg-gray-100 text-left"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex flex-row gap-6 prose-sm">
                    <span><b>{user.name}</b></span>
                    <span>NUSP: {user.NUSP}</span>
                    <span>Email: {user.email}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <ActionBar
            onCancel={() => {
              setFoundUsers([]);
              setQuery("");
              setSelectedUser(null);
            }}
            showConfirm={false}
          />
        </div>
      )}

      {showConfirm && (
        <div>
          <p>Confirme os dados do usuário a ser removido:</p>
          <div className="flex flex-col gap-2 prose-md px-4">
            <span><b>Nome:</b> {selectedUser.name}</span>
            <span><b>NUSP:</b> {selectedUser.NUSP}</span>
            <span><b>Email:</b> {selectedUser.email}</span>
          </div>
          <form onSubmit={handleRemove}>
            <ActionBar
              onConfirm={() => handleRemove({ preventDefault: () => {} } as React.FormEvent)}
              onCancel={() => setSelectedUser(null)}
              confirmLabel="Remover"
              confirmColor="bg-cm-red"
            />
          </form>
        </div>
      )}
    </div>
  );
}