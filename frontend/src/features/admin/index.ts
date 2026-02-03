/**
 * Componentes e hooks padronizados para o painel admin
 */

// Componentes
export { default as ActionGrid } from "./components/ActionGrid";
export { default as ActionBar } from "./components/ActionBar";
export { default as AdminTabRenderer } from "./components/AdminTabRenderer";
export type { 
  AdminAction, 
  TabComponent, 
  TabComponentProps 
} from "./components/AdminTabRenderer";

// Hooks
export { useAdminToast } from "./hooks/useAdminToast";
export type { ToastType } from "./hooks/useAdminToast";
