import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";
import { useRemoveUser } from "@/features/admin/features/users/hooks/useRemoveUser";
import { useSearchUser } from "@/features/admin/features/users/hooks/useSearchUser";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import type { User } from "@/types/user";

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
  const { search, searching, searched, foundUsers, error } = useSearchUser();
  
  // Estado para controlar se está na tela inicial
  const [showInput, setShowInput] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { handleSubmit } = useRemoveUser({
    onSuccess: (msg) => {
      setSelectedUser(null);
      setShowInput(true);
      onSuccess(msg);
    },
    onError,
    getUserId: () => selectedUser?.id ?? 0,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    search(query);
    setShowInput(false);
    setSelectedUser(null);
  }

  useEffect(() => {
    if (!showInput && searched && foundUsers.length === 0 && query) {
      setShowInput(true);
      onError && onError("Nenhum usuário encontrado.");
    }
  }, [searched, foundUsers, showInput, query, onError]);
  function handleRemove(e: React.FormEvent) {
    handleSubmit(e);
  }

  return (
    <div>
      {showInput && (
        <div>
          <p>Busque um usuário pelo nome, email ou NUSP:</p>
          <form onSubmit={handleSearch} className="">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              required
            />
            <ActionBar
              onConfirm={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
              onCancel={() => {onBack && onBack();}}
              confirmLabel={searching ? "Buscando..." : "Buscar"}
              loading={searching}
            />
          </form>
        </div>
      )}

      {!showInput && !selectedUser && foundUsers.length > 0 && (
        <div>
          <p>Selecione o usuário que deseja remover:</p>
          <ul>
            {foundUsers.map(user => (
              <button
                key={user.id}
                className="w-full px-4 py-2 rounded-xl hover:bg-gray-100"
                onClick={() => setSelectedUser(user)}
              >
              <li key={user.id} className="py-2 flex items-center justify-between">
                <div className="flex flex-row gap-6 prose-sm">
                  <span><b> {user.name}</b></span>
                  <span>NUSP: {user.NUSP}</span>
                  <span>Email: {user.email}</span>
                </div>
              </li>
              </button>
            ))}
          </ul>
          <ActionBar
            onCancel={() => {
              search("");
              setQuery("");
              setShowInput(true);
              setSelectedUser(null);
            }}
            confirmLabel="Voltar"
            showConfirm={false}
          />
        </div>
      )}

      {!showInput && selectedUser && (
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
              onCancel={() => {
                setSelectedUser(null);
              }}
              confirmLabel="Remover"
              confirmColor="bg-cm-red"
            />
          </form>
        </div>
      )}
    </div>
  );
}