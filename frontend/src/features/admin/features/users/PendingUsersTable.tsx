import { useState, useEffect, useCallback } from "react";
import { UsersService } from "@/services/UsersService";
import ActionBar from "@/features/admin/components/ActionBar";
import type { User } from "@/types/user";

interface PendingUser extends Pick<User, "id" | "name" | "NUSP" | "email" | "phone" | "class"> {
  created_at?: string;
}

export default function PendingUsersTable({ onBack, onError }) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: number; type: "approve" | "reject"; name: string } | null>(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const users = await UsersService.getPendingUsers();
      setPendingUsers(users);
    } catch (err: any) {
      onError && onError(err.message || "Erro ao carregar solicitações de cadastro.");
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    setConfirmAction(null);
    try {
      await UsersService.approveUser(id);
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      onError && onError(err.message || "Erro ao aprovar usuário.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    setConfirmAction(null);
    try {
      await UsersService.rejectUser(id);
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      onError && onError(err.message || "Erro ao rejeitar usuário.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Usuários que solicitaram acesso ao sistema. Ao aprovar, um email de boas-vindas com link
        para criar senha será enviado automaticamente.
      </p>

      {/* Confirmação inline */}
      {confirmAction && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 text-sm">
          <span>
            {confirmAction.type === "approve"
              ? `Aprovar o cadastro de ${confirmAction.name}?`
              : `Rejeitar e excluir o cadastro de ${confirmAction.name}?`}
          </span>
          <button
            onClick={() =>
              confirmAction.type === "approve"
                ? handleApprove(confirmAction.id)
                : handleReject(confirmAction.id)
            }
            className={`px-3 py-1 rounded-lg text-white font-semibold text-xs ${
              confirmAction.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Confirmar
          </button>
          <button
            onClick={() => setConfirmAction(null)}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs"
          >
            Cancelar
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : pendingUsers.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma solicitação de cadastro pendente. 🎉</p>
      ) : (
        <div className="overflow-x-auto rounded-t-xl border border-gray-200" style={{ maxHeight: "50vh", overflowY: "auto" }}>
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b">Nome</th>
                <th className="px-3 py-2 border-b font-mono">NUSP</th>
                <th className="px-3 py-2 border-b">Email</th>
                <th className="px-3 py-2 border-b">Telefone</th>
                <th className="px-3 py-2 border-b">Turma</th>
                <th className="px-3 py-2 border-b">Solicitado em</th>
                <th className="px-3 py-2 border-b text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b font-medium">{user.name}</td>
                  <td className="px-3 py-2 border-b font-mono">{user.NUSP}</td>
                  <td className="px-3 py-2 border-b">{user.email}</td>
                  <td className="px-3 py-2 border-b">{user.phone}</td>
                  <td className="px-3 py-2 border-b">{user.class ?? "-"}</td>
                  <td className="px-3 py-2 border-b text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="px-3 py-2 border-b">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        disabled={processingId === user.id}
                        onClick={() =>
                          setConfirmAction({ id: user.id!, type: "approve", name: user.name })
                        }
                        className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Aprovar cadastro"
                      >
                        {processingId === user.id ? "..." : "✓ Aprovar"}
                      </button>
                      <button
                        disabled={processingId === user.id}
                        onClick={() =>
                          setConfirmAction({ id: user.id!, type: "reject", name: user.name })
                        }
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Rejeitar e excluir cadastro"
                      >
                        {processingId === user.id ? "..." : "✗ Rejeitar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && pendingUsers.length > 0 && (
        <p className="rounded-b-xl px-4 py-2 bg-gray-200 border-t text-sm font-semibold">
          {pendingUsers.length} solicitação(ões) pendente(s)
        </p>
      )}

      <ActionBar onCancel={onBack} showConfirm={false} />
    </div>
  );
}
