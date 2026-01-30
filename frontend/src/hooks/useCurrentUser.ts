import { useEffect, useState } from "react";
import { User } from "@/features/users/types/user";

/**
 * Hook para obter o usuário atual autenticado.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("🔵 [useCurrentUser] Buscando usuário atual do localStorage");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
      console.log("🟢 [useCurrentUser] Usuário encontrado:", userStr);
    } else {
      setUser(null);
      console.warn("🟡 [useCurrentUser] Nenhum usuário encontrado no localStorage");
    }
  }, []);

  // Atualiza o hook caso o localStorage mude (ex: logout em outra aba)
  useEffect(() => {
    const handler = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
        console.log("🟢 [useCurrentUser] Usuário atualizado via storage event:", userStr);
      } else {
        setUser(null);
        console.warn("🟡 [useCurrentUser] Usuário removido via storage event");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return user;
}