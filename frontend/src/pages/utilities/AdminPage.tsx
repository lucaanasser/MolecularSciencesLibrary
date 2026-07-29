import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { logger } from "@/utils/logger";
import { BookOpen, Users, Calendar, Heart, Bookmark, BarChart3, Settings as SettingsIcon, Mail } from "lucide-react";
import { TabsCard } from "@/lib/TabsCard";
import ManageBooks from "@/features/admin/_tabs/ManageBooks";
import ManageUsers from "@/features/admin/_tabs/ManageUsers";
import ManageLoans from "@/features/admin/_tabs/ManageLoans";
import ManageDonators from "@/features/admin/_tabs/ManageDonators";
import ManageReserve from "@/features/admin/_tabs/ManageReserve";
import EmailsInbox from "@/features/admin/features/emails/EmailsInbox";
import Reports from "@/features/admin/_tabs/Reports";
import Rules from "@/features/admin/_tabs/ManageRules";
import { ErrorBoundary } from "@/features/admin/utils/ErrorBoundary";
import { COLORS } from "@/constants/styles";

const AdminPage = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  // Aba controlada pela URL (?tab=) para permitir deep link — ex.: a notificacao de
  // email novo no Gmail aponta para /admin?tab=emails&thread=<id>.
  const [searchParams, setSearchParams] = useSearchParams();

  // Log de início de renderização do componente principal do Admin
  logger.info("🔵 [AdminPage] Renderizando componente principal do painel admin");

  // Ensure the page is fully loaded before rendering content
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const tabs = [
    { id: "books", label: "Livros", icon: BookOpen },
    { id: "users", label: "Usuários", icon: Users },
    { id: "loans", label: "Empréstimos", icon: Calendar },
    { id: "reserve", label: "Reserva", icon: Bookmark },
    { id: "donators", label: "Doadores", icon: Heart },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
    { id: "rules", label: "Regras", icon: SettingsIcon },
  ];

  if (!isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  const requestedTab = searchParams.get("tab");
  const activeTab = tabs.some((t) => t.id === requestedTab) ? (requestedTab as string) : "books";

  return (
    <div className="content-container">
      <h2>Painel do Administrador</h2>
      <ErrorBoundary>
        <TabsCard
          tabs={tabs}
          getTabColor={(tabId, idx) => COLORS[idx % COLORS.length]}
          activeTab={activeTab}
          onTabChange={(id) => setSearchParams({ tab: id })}
        >
          <ErrorBoundary><ManageBooks /></ErrorBoundary>
          <ErrorBoundary><ManageUsers /></ErrorBoundary>
          <ErrorBoundary><ManageLoans /></ErrorBoundary>
          <ErrorBoundary><ManageReserve /></ErrorBoundary>
          <ErrorBoundary><ManageDonators /></ErrorBoundary>
          <ErrorBoundary><EmailsInbox /></ErrorBoundary>
          <ErrorBoundary><Reports /></ErrorBoundary>
          <ErrorBoundary><Rules /></ErrorBoundary>
        </TabsCard>
      </ErrorBoundary>
    </div>
  );
};

export default AdminPage;
