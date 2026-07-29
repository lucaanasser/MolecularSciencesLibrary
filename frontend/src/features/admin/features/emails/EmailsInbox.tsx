/**
 * Casca da aba Emails do painel admin: rail (pastas de contato@ + historico de
 * avisos internos), lista de conversas e painel de leitura/resposta estilo Gmail.
 * Deep links: ?thread=<id> (notificacao no Gmail) abre a conversa direto;
 * ?compose=<email> (clique num nome de usuario em outras abas) abre o composer
 * com o destinatario preenchido.
 * Usa: useEmailThreads/useEmailThread/useSendEmail, EmailsService (acoes), useAdminToast.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PenSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminToast } from "@/features/admin/hooks/useAdminToast";
import { EmailsService } from "@/services/EmailsService";
import EmailFolderRail from "./components/EmailFolderRail";
import EmailList from "./components/EmailList";
import EmailThread from "./components/EmailThread";
import EmailComposer, { type ComposePayload } from "./components/EmailComposer";
import NotificationHistoryPanel from "./components/NotificationHistoryPanel";
import { useEmailThreads } from "./hooks/useEmailThreads";
import { useEmailThread } from "./hooks/useEmailThread";
import { useSendEmail } from "./hooks/useSendEmail";
import type { EmailFolder, EmailsTabView } from "./types/email";

const isFolder = (view: EmailsTabView): view is EmailFolder => view !== "history";

export default function EmailsInbox() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<EmailsTabView>("inbox");
  // Ultima pasta de email visitada: os contadores do rail seguem vivos na tela de avisos.
  const [folder, setFolder] = useState<EmailFolder>("inbox");
  const [page, setPage] = useState(1);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    () => searchParams.get("thread") // deep link da notificacao
  );
  const [composeTo, setComposeTo] = useState<string>(() => searchParams.get("compose") ?? "");
  const [composeOpen, setComposeOpen] = useState(() => Boolean(searchParams.get("compose")));

  // Consome os deep links da URL para nao reabrirem ao alternar de aba e voltar.
  useEffect(() => {
    if (searchParams.get("compose") || searchParams.get("thread")) {
      setSearchParams({ tab: "emails" }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { showSuccess, showError } = useAdminToast();
  const { data, loading, error, refetch } = useEmailThreads(folder, page);
  const thread = useEmailThread(selectedThreadId);
  const { reply, compose, sending } = useSendEmail();

  // Abrir uma conversa marca as recebidas como lidas no backend → atualiza contadores da lista.
  useEffect(() => {
    if (selectedThreadId && thread.messages.length) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.messages]);

  /* Troca de visao no rail; em pasta de email, volta a pagina 1 e fecha a conversa. */
  const handleViewSelect = (next: EmailsTabView) => {
    setView(next);
    if (isFolder(next)) {
      setFolder(next);
      setPage(1);
      setSelectedThreadId(null);
    }
  };

  /* Responde a conversa aberta e recarrega thread + lista. */
  const handleReply = async (message: string) => {
    if (!selectedThreadId) return;
    try {
      await reply(selectedThreadId, message);
      showSuccess("Resposta enviada de contato@.");
      await thread.refetch();
      refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Não foi possível enviar a resposta.");
      throw err;
    }
  };

  /* Envia mensagem nova (Dialog) e fecha o composer. */
  const handleCompose = async (payload: ComposePayload) => {
    try {
      const result = await compose(payload);
      showSuccess(
        payload.broadcast
          ? `Comunicado enviado para ${result?.sent ?? 0} usuário(s) de ${payload.sender}@.`
          : `Mensagem enviada de ${payload.sender}@.`
      );
      setComposeOpen(false);
      refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Não foi possível enviar a mensagem.");
      throw err;
    }
  };

  /* Acoes da conversa aberta (arquivar/nao lida/excluir): agem e fecham a selecao. */
  const runThreadAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      showSuccess(successMessage);
      setSelectedThreadId(null);
      refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : "A ação falhou.");
    }
  };

  const archived = folder === "archived";

  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3>Emails</h3>
          <p className="mb-0">
            Caixa de contato@bibliotecamoleculares.com e avisos internos aos usuários.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="icon" title="Atualizar" onClick={refetch} disabled={loading}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="primary" size="sm" onClick={() => setComposeOpen(true)}>
            <PenSquare className="w-4 h-4 mr-1" /> Escrever
          </Button>
        </div>
      </div>

      <div className="flex gap-4 h-[58vh] min-h-0">
        <EmailFolderRail selected={view} counts={data?.counts ?? null} onSelect={handleViewSelect} />
        {!isFolder(view) ? (
          <div className="flex-1 min-w-0 min-h-0 overflow-y-auto border-l border-gray-200 pl-4">
            <NotificationHistoryPanel />
          </div>
        ) : (
        <>
        <div className="w-72 lg:w-80 shrink-0 min-h-0">
          <EmailList
            threads={data?.threads ?? []}
            selectedId={selectedThreadId}
            loading={loading}
            error={error}
            page={page}
            totalPages={data?.pagination.totalPages ?? 1}
            onSelect={setSelectedThreadId}
            onPageChange={setPage}
          />
        </div>
        <div className="flex-1 min-w-0 min-h-0 border-l border-gray-200 pl-4">
          {selectedThreadId ? (
            <EmailThread
              messages={thread.messages}
              loading={thread.loading}
              error={thread.error}
              archived={archived}
              sending={sending}
              onReply={handleReply}
              onArchiveToggle={() =>
                runThreadAction(
                  () => EmailsService.setStatus(selectedThreadId, archived ? "read" : "archived"),
                  archived ? "Conversa desarquivada." : "Conversa arquivada."
                )
              }
              onMarkUnread={() =>
                runThreadAction(
                  () => EmailsService.setStatus(selectedThreadId, "unread"),
                  "Conversa marcada como não lida."
                )
              }
              onDelete={() => {
                if (!window.confirm("Excluir esta conversa? Isso não pode ser desfeito.")) return;
                runThreadAction(() => EmailsService.remove(selectedThreadId), "Conversa excluída.");
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Selecione uma conversa para ler
            </div>
          )}
        </div>
        </>
        )}
      </div>

      <Dialog
        open={composeOpen}
        onOpenChange={(open) => {
          setComposeOpen(open);
          if (!open) setComposeTo(""); // prefill do deep link vale so para a primeira abertura
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Nova mensagem</DialogTitle>
          </DialogHeader>
          <EmailComposer mode="new" sending={sending} initialTo={composeTo} onSend={handleCompose} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
