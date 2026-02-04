import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { logger } from "@/utils/logger";

/**
 * Rota protegida por autenticação e autorização.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Não autenticado
  if (!user || !user.token) {
    logger.warn("🟡 [ProtectedRoute] Usuário não autenticado. Redirecionando para login.");
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  // Não autorizado
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    logger.warn("🟡 [ProtectedRoute] Usuário não autorizado. Redirecionando para home.");
    return <Navigate to="/" replace />;
  }

  // Autenticado e autorizado
  logger.info("🟢 [ProtectedRoute] Usuário autenticado e autorizado:", user);
  return <>{children}</>;
};

export default ProtectedRoute;