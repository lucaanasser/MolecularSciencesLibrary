import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import { BookOpen, Users, Calendar, Heart, Bookmark, Bell, BarChart3, Settings as SettingsIcon } from "lucide-react";
import { TabsCard } from "@/lib/TabsCard";
import ManageBooks from "@/features/admin/_tabs/ManageBooks";
import ManageUsers from "@/features/admin/_tabs/ManageUsers";
import ManageLoans from "@/features/admin/_tabs/ManageLoans";
import ManageDonators from "@/features/admin/_tabs/ManageDonators";
import ManageReserve from "@/features/admin/_tabs/ManageReserve";
import Notifications from "@/features/admin/_tabs/Notifications";
import Reports from "@/features/admin/_tabs/Reports";
import Rules from "@/features/admin/_tabs/ManageRules";
import { ErrorBoundary } from "@/features/admin/utils/ErrorBoundary";
import { COLORS } from "@/constants/styles";

const AdminPage = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Log de início de renderização do componente principal do Admin
  logger.info("🔵 [AdminPage] Renderizando componente principal do painel admin");

  // Ensure the page is fully loaded before rendering content
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  if (!isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  const tabs = [
    { id: "books", label: "Livros", icon: BookOpen },
    { id: "users", label: "Usuários", icon: Users },
    { id: "loans", label: "Empréstimos", icon: Calendar },
    { id: "reserve", label: "Reserva", icon: Bookmark },
    { id: "rules", label: "Regras", icon: SettingsIcon },
    { id: "donators", label: "Doadores", icon: Heart },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <div className="content-container">
      <h2>Painel do Administrador</h2>
      <ErrorBoundary>
        <TabsCard tabs={tabs} getTabColor={(tabId, idx) => COLORS[idx%COLORS.length]} initialTabId="books">
          <ErrorBoundary><ManageBooks /></ErrorBoundary>
          <ErrorBoundary><ManageUsers /></ErrorBoundary>
          <ErrorBoundary><ManageLoans /></ErrorBoundary>
          <ErrorBoundary><ManageReserve /></ErrorBoundary>
          <ErrorBoundary><Rules /></ErrorBoundary>
          <ErrorBoundary><ManageDonators /></ErrorBoundary>
          <ErrorBoundary><Notifications /></ErrorBoundary>
          <ErrorBoundary><Reports /></ErrorBoundary>
        </TabsCard>
      </ErrorBoundary>
    </div>
  );
};

export default AdminPage;