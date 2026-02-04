import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import { BookOpen, Users, Calendar, Heart, Bookmark, Bell, BarChart3, Settings as SettingsIcon } from "lucide-react";
import { TabsCard } from "@/lib/TabsCard";
import ManageBooks from "@/features/admin/features/books/ManageBooks";
import ManageUsers from "@/features/admin/features/users/ManageUsers";
import ManageLoans from "@/features/admin/features/loans/ManageLoans";
import ManageDonators from "@/features/admin/features/donators/ManageDonators";
import ManageReserve from "@/features/admin/features/reserve/ManageReserve";
import Notifications from "@/features/admin/features/notifications/Notifications";
import Reports from "@/features/admin/features/Reports";
import Settings from "@/features/admin/features/settings/ManageSettings";
import { ErrorBoundary } from "@/features/admin/utils/ErrorBoundary";

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
    { id: "donators", label: "Doadores", icon: Heart },
    { id: "reserve", label: "Reserva", icon: Bookmark },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
    { id: "settings", label: "Configurações", icon: SettingsIcon },
  ];

  const getTabColor = (tabId: string) => {
    switch(tabId){
      case "books": return "cm-red";
      case "users": return "cm-orange";
      case "loans": return "cm-yellow";
      case "donators": return "cm-green";
      case "reserve": return "cm-blue";
      case "notifications": return "library-purple";
      case "reports": return "cm-red";
      case "settings": return "cm-orange";
      default: return "library-purple";
    }
  };

  return (
    <div className="content-container">
      <h2>Painel do Administrador</h2>
      <ErrorBoundary>
        <TabsCard tabs={tabs} getTabColor={getTabColor} initialTabId="books">
          <ErrorBoundary><ManageBooks /></ErrorBoundary>
          <ErrorBoundary><ManageUsers /></ErrorBoundary>
          <ErrorBoundary><ManageLoans /></ErrorBoundary>
          <ErrorBoundary><ManageDonators /></ErrorBoundary>
          <ErrorBoundary><ManageReserve /></ErrorBoundary>
          <ErrorBoundary><Notifications /></ErrorBoundary>
          <ErrorBoundary><Reports /></ErrorBoundary>
          <ErrorBoundary><Settings /></ErrorBoundary>
        </TabsCard>
      </ErrorBoundary>
    </div>
  );
};

export default AdminPage;