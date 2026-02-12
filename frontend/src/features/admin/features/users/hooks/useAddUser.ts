import { UsersService } from "@/services/UsersService";
import type { User } from "@/types/new_user";

/**
 * Hook para adicionar usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export function useAddUser({ onSuccess, onError, getFormValues }: {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  getFormValues: () => Pick<User, "name" | "email" | "NUSP" | "phone" | "class">;
}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getFormValues();
    if (!user.name || !user.email || !user.NUSP || !user.phone || !user.class) {
      onError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    try {
      console.log("🔵 [useAddUser] Adicionando usuário:", user);
      const data = await UsersService.createUser(user);
      onSuccess("Usuário adicionado com sucesso!");
      console.log("🟢 [useAddUser] Usuário adicionado com sucesso:", data);
    } catch (err: any) {
      let technicalMsg = "";
      try {
        technicalMsg = JSON.parse(err.message).error;
      } catch {}
      const errorMsg = `Não foi possível adicionar o usuário.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      onError(errorMsg);
      console.error("🔴 [useAddUser] Erro ao adicionar usuário:", err);
    }
  };

  return { handleSubmit };
}