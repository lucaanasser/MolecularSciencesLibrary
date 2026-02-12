import { UsersService } from "@/services/UsersService";
/**
 * Hook para remover usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

export function useRemoveUser({ onSuccess, onError, getUserId }: {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  getUserId: () => number;
}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getUserId();
    if (!userId) {
      onError("ID do usuário não informado.");
      return;
    }
    try {
      await UsersService.deleteUserById(userId);
      onSuccess("Usuário removido com sucesso!");
    } catch (err: any) {
      let technicalMsg = "";
      try {
        technicalMsg = JSON.parse(err.message).error;
      } catch {}
      const errorMsg = `Não foi possível remover o usuário.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      onError(errorMsg);
    }
  };
  return { handleSubmit };
}