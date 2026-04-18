import { useState } from "react";
import ProfileService from "@/services/ProfileService";
import { logger } from "@/utils/logger";

export interface PublishSandboxResult {
  success: boolean;
  prUrl?: string;
  branchName?: string;
  noChanges?: boolean;
  filesChanged?: string[];
  error?: string;
}

/**
 * Hook para publicar o perfil atual no sandbox do site publico.
 */
export const usePublishSandbox = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishSandboxResult | null>(null);

  const publish = async (userId: number, selectedRosterName: string) => {
    logger.info("🔵 [usePublishSandbox] Iniciando publicação sandbox", { userId, selectedRosterName });
    setIsPublishing(true);
    setPublishError(null);
    setPublishResult(null);

    try {
      const result = await ProfileService.publishSandbox(userId, selectedRosterName);
      setPublishResult(result);
      logger.info("🟢 [usePublishSandbox] Publicação sandbox finalizada", {
        userId,
        noChanges: result.noChanges,
        prUrl: result.prUrl,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao publicar no sandbox";
      setPublishError(message);
      logger.error("🔴 [usePublishSandbox] Falha na publicação sandbox", { userId, message });
      throw error;
    } finally {
      setIsPublishing(false);
    }
  };

  const clearStatus = () => {
    setPublishError(null);
    setPublishResult(null);
  };

  return {
    publish,
    isPublishing,
    publishError,
    publishResult,
    clearStatus,
  };
};
