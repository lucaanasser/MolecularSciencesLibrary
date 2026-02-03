import { useState, useCallback, ReactNode } from "react";
import ActionGrid from "@/features/admin/components/ActionGrid";
import { useAdminToast } from "../hooks/useAdminToast";

/**
 * Definição de uma ação no grid principal da aba
 */
export interface AdminAction {
  /** Identificador único da ação/tab */
  id: string;
  /** Texto exibido no botão */
  label: string;
  /** Cor de fundo do botão (ex: "bg-cm-green") */
  color: string;
  /** Ícone opcional (ReactNode) */
  icon?: ReactNode;
  /** Se a ação está desabilitada */
  disabled?: boolean;
}

/**
 * Componente que será renderizado quando uma ação for selecionada
 */
export interface TabComponent {
  /** Identificador correspondente à action.id */
  id: string;
  /** Componente a ser renderizado */
  component: React.ComponentType<TabComponentProps>;
  /** Props adicionais para o componente */
  props?: Record<string, unknown>;
}

/**
 * Props padrão que todo componente de tab recebe
 */
export interface TabComponentProps {
  /** Volta para o grid de ações */
  onBack: () => void;
  /** Callback de sucesso - exibe toast e volta ao grid */
  onSuccess: (message?: string) => void;
  /** Callback de erro - exibe toast de erro */
  onError: (error: Error | string) => void;
}

/**
 * Props do AdminTabRenderer
 */
interface AdminTabRendererProps {
  /** Título da seção (h3) */
  title: string;
  /** Descrição da seção (p) */
  description?: string;
  /** Lista de ações para o ActionGrid */
  actions: AdminAction[];
  /** Componentes de tab mapeados por id */
  tabComponents: TabComponent[];
  /** Número de colunas do grid (padrão: baseado no número de ações, max 4) */
  columns?: number;
  /** Estado de loading global */
  loading?: boolean;
  /** Mensagem de sucesso padrão */
  defaultSuccessMessage?: string;
  /** Callback opcional quando uma tab é selecionada */
  onTabChange?: (tabId: string | null) => void;
  /** Se deve mostrar o título e descrição quando uma tab está selecionada */
  showHeaderOnTab?: boolean;
}

/**
 * AdminTabRenderer - Componente padrão para renderização de abas no painel admin
 * 
 * Resolve a repetição de código nas abas que usam ActionGrid e ActionBar,
 * padronizando:
 * - Exibição do grid de ações quando nenhuma tab está selecionada
 * - Renderização do componente correspondente à tab selecionada
 * - Gerenciamento de estado de navegação (selectedTab)
 * - Toasts de sucesso/erro padronizados
 * 
 * @example
 * ```tsx
 * <AdminTabRenderer
 *   title="Gerenciamento de Usuários"
 *   description="Adicione, remova ou busque usuários no sistema."
 *   actions={[
 *     { id: "add", label: "Adicionar", color: "bg-cm-green" },
 *     { id: "remove", label: "Remover", color: "bg-cm-red" },
 *   ]}
 *   tabComponents={[
 *     { id: "add", component: AddUserForm },
 *     { id: "remove", component: RemoveUserForm },
 *   ]}
 * />
 * ```
 */
const AdminTabRenderer: React.FC<AdminTabRendererProps> = ({
  title,
  description,
  actions,
  tabComponents,
  columns,
  loading = false,
  defaultSuccessMessage = "Operação realizada com sucesso!",
  onTabChange,
  showHeaderOnTab = false,
}) => {
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const { showSuccess, showError } = useAdminToast();

  // Calcula colunas automaticamente (max 4, ou conforme número de ações)
  const gridColumns = columns ?? Math.min(actions.length, 4);

  const handleTabSelect = useCallback((tabId: string) => {
    console.log(`🔵 [AdminTabRenderer] Selecionado: ${tabId}`);
    setSelectedTab(tabId);
    onTabChange?.(tabId);
  }, [onTabChange]);

  const handleBack = useCallback(() => {
    console.log("🔵 [AdminTabRenderer] Voltando ao grid de ações");
    setSelectedTab(null);
    onTabChange?.(null);
  }, [onTabChange]);

  const handleSuccess = useCallback((message?: string) => {
    const successMessage = message || defaultSuccessMessage;
    console.log(`🟢 [AdminTabRenderer] Sucesso: ${successMessage}`);
    showSuccess(successMessage);
    setSelectedTab(null);
    onTabChange?.(null);
  }, [defaultSuccessMessage, showSuccess, onTabChange]);

  const handleError = useCallback((error: Error | string) => {
    const errorMessage = typeof error === "string" ? error : error.message;
    console.log(`🔴 [AdminTabRenderer] Erro: ${errorMessage}`);
    showError(errorMessage);
  }, [showError]);

  // Preparar as ações com handlers
  const gridActions = actions.map(action => ({
    ...action,
    onClick: () => handleTabSelect(action.id),
    disabled: action.disabled || loading,
  }));

  // Encontrar o componente da tab selecionada
  const selectedTabConfig = tabComponents.find(tc => tc.id === selectedTab);

  // Renderizar grid de ações quando nenhuma tab está selecionada
  if (!selectedTab) {
    return (
      <>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        <ActionGrid actions={gridActions} columns={gridColumns} />
      </>
    );
  }

  // Renderizar componente da tab selecionada
  if (selectedTabConfig) {
    const TabComponent = selectedTabConfig.component;
    const additionalProps = selectedTabConfig.props || {};

    return (
      <>
        {showHeaderOnTab && (
          <>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </>
        )}
        <TabComponent
          onBack={handleBack}
          onSuccess={handleSuccess}
          onError={handleError}
          {...additionalProps}
        />
      </>
    );
  }

  // Fallback: tab não encontrada
  console.warn(`🟡 [AdminTabRenderer] Tab não encontrada: ${selectedTab}`);
  return (
    <>
      <h3>{title}</h3>
      <p>Aba não encontrada.</p>
    </>
  );
};

export default AdminTabRenderer;
