import { Email } from "../hooks/useInbox";
import { useDeleteEmail } from "../hooks/useDeleteEmail";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  emails: Email[];
  loading?: boolean;
  error?: string | null;
  onEmailDeleted?: () => void;
}

export default function InboxList({ emails, loading, error, onEmailDeleted }: Props) {
  const { deleteEmail, loading: deleteLoading } = useDeleteEmail();
  const [deletingEmailId, setDeletingEmailId] = useState<string | number | null>(null);

  const handleDeleteEmail = async (emailId: string | number) => {
    try {
      console.log("🔵 [InboxList] Deletando email:", emailId);
      setDeletingEmailId(emailId);
      await deleteEmail(emailId);
      console.log("🟢 [InboxList] Email deletado com sucesso");
      if (onEmailDeleted) {
        onEmailDeleted();
      }
    } catch (err) {
      console.error("🔴 [InboxList] Erro ao deletar email:", err);
    } finally {
      setDeletingEmailId(null);
    }
  };

  if (loading) return <div className="text-center py-8">Carregando emails...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!emails.length) return <div className="text-center py-8 text-gray-500">Nenhum email encontrado.</div>;

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <div key={email.id} className="p-4 rounded-xl bg-white shadow border flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <span className="font-semibold">Assunto:</span> {email.subject || <span className="italic text-gray-400">(sem assunto)</span>}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">{new Date(email.date).toLocaleString("pt-BR")}</div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteEmail(email.id)}
                disabled={deletingEmailId === email.id || deleteLoading}
                className="h-8 w-8 p-0"
                title="Deletar email"
              >
                {deletingEmailId === email.id ? (
                  <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">De:</span> {email.from}
          </div>
          <div className="mt-2 whitespace-pre-line text-gray-800 text-sm max-h-40 overflow-y-auto border-t pt-2">
            {email.body ? email.body.slice(0, 1000) : <span className="italic text-gray-400">(sem conteúdo)</span>}
            {email.body && email.body.length > 1000 && <span className="text-gray-400">... (truncado)</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
