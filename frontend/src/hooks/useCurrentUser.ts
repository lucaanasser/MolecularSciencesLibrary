import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { logger } from "@/utils/logger";

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
    logger.log("🔵 [useCurrentUser] Buscando usuário atual do localStorage");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
        logger.log("🟢 [useCurrentUser] Usuário encontrado:", userStr);
      } catch (error) {
        logger.error("🔴 [useCurrentUser] Erro ao parsear dados do usuário:", error);
        setUser(null);
        localStorage.removeItem("user");
      }
    } else {
      setUser(null);
      logger.warn("🟡 [useCurrentUser] Nenhum usuário encontrado no localStorage");
    }
  }, []);

  // Atualiza o hook caso o localStorage mude (ex: logout em outra aba)
  useEffect(() => {
    const handler = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
          logger.log("🟢 [useCurrentUser] Usuário atualizado via storage event:", userStr);
        } catch (error) {
          logger.error("🔴 [useCurrentUser] Erro ao parsear dados do usuário (storage event):", error);
          setUser(null);
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
        logger.warn("🟡 [useCurrentUser] Usuário removido via storage event");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return user;
}