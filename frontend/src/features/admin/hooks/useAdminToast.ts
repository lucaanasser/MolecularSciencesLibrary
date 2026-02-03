import { useCallback } from "react";
import { useToast } from "@/hooks/useToast";

/**
 * Tipos de mensagem de toast padronizados
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Configuração de toast
 */
interface ToastConfig {
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
}

/**
 * Títulos padrão por tipo de toast
 */
const DEFAULT_TITLES: Record<ToastType, string> = {
  success: "Sucesso!",
  error: "Erro",
  warning: "Atenção",
  info: "Informação",
};

/**
 * Variantes do toast por tipo
 */
const TOAST_VARIANTS: Record<ToastType, "default" | "destructive"> = {
  success: "default",
  error: "destructive",
  warning: "default",
  info: "default",
};

/**
 * Hook para exibição padronizada de toasts no painel admin
 * 
 * Padroniza:
 * - Títulos de sucesso/erro/warning
 * - Variantes de estilo (destructive para erros)
 * - Mensagens formatadas consistentes
 * - Logs de operação
 * 
 * @example
 * ```tsx
 * const { showSuccess, showError } = useAdminToast();
 * 
 * // Sucesso simples
 * showSuccess("Usuário adicionado com sucesso!");
 * 
 * // Erro com mensagem
 * showError("Não foi possível remover o usuário");
 * 
 * // Toast customizado
 * showToast({
 *   title: "Importação",
 *   description: "5 registros importados",
 *   type: "info"
 * });
 * ```
 */
export function useAdminToast() {
  const { toast } = useToast();

  /**
   * Exibe um toast com configuração completa
   */
  const showToast = useCallback((config: ToastConfig) => {
    const type = config.type || "info";
    const title = config.title || DEFAULT_TITLES[type];
    const variant = TOAST_VARIANTS[type];

    console.log(`🔔 [useAdminToast] ${type.toUpperCase()}: ${config.description}`);

    toast({
      title,
      description: config.description,
      variant,
    });
  }, [toast]);

  /**
   * Exibe toast de sucesso
   */
  const showSuccess = useCallback((message: string, title?: string) => {
    console.log(`🟢 [useAdminToast] Sucesso: ${message}`);
    toast({
      title: title || DEFAULT_TITLES.success,
      description: message,
      variant: "default",
    });
  }, [toast]);

  /**
   * Exibe toast de erro
   */
  const showError = useCallback((message: string, title?: string) => {
    console.log(`🔴 [useAdminToast] Erro: ${message}`);
    toast({
      title: title || DEFAULT_TITLES.error,
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  /**
   * Exibe toast de aviso
   */
  const showWarning = useCallback((message: string, title?: string) => {
    console.log(`🟡 [useAdminToast] Aviso: ${message}`);
    toast({
      title: title || DEFAULT_TITLES.warning,
      description: message,
      variant: "default",
    });
  }, [toast]);

  /**
   * Exibe toast informativo
   */
  const showInfo = useCallback((message: string, title?: string) => {
    console.log(`🔵 [useAdminToast] Info: ${message}`);
    toast({
      title: title || DEFAULT_TITLES.info,
      description: message,
      variant: "default",
    });
  }, [toast]);

  /**
   * Exibe toast de resultado de importação
   */
  const showImportResult = useCallback((success: number, failed: number, entityName: string = "registro(s)") => {
    const hasErrors = failed > 0;
    const message = `${success} ${entityName} importado(s) com sucesso${hasErrors ? `, ${failed} falharam` : ""}`;
    
    console.log(`${hasErrors ? "🟡" : "🟢"} [useAdminToast] Importação: ${message}`);
    
    toast({
      title: hasErrors ? "Importação parcial" : "Importação concluída!",
      description: message,
      variant: hasErrors ? "default" : "default",
    });
  }, [toast]);

  /**
   * Exibe toast de operação CRUD
   */
  const showCrudResult = useCallback((
    operation: "create" | "update" | "delete",
    entityName: string,
    success: boolean = true,
    customMessage?: string
  ) => {
    const operationLabels = {
      create: { success: "adicionado", error: "adicionar" },
      update: { success: "atualizado", error: "atualizar" },
      delete: { success: "removido", error: "remover" },
    };

    const labels = operationLabels[operation];
    
    if (success) {
      const message = customMessage || `${entityName} ${labels.success} com sucesso!`;
      showSuccess(message);
    } else {
      const message = customMessage || `Erro ao ${labels.error} ${entityName}`;
      showError(message);
    }
  }, [showSuccess, showError]);

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showImportResult,
    showCrudResult,
    // Export raw toast for custom cases
    toast,
  };
}

export default useAdminToast;
