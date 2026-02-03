import { useInbox } from "@/features/admin/features/notifications/hooks/useInbox";
import InboxList from "@/features/admin/features/notifications/components/InboxList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminInboxTab() {
  const { emails, loading, error, refetch } = useInbox();

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Caixa de Entrada do Email da Biblioteca</h2>
      <div className="mb-4 flex gap-2 items-center">
        <button
          className="px-3 py-1 rounded bg-cm-blue text-white hover:bg-cm-blue/90"
          onClick={refetch}
          disabled={loading}
        >
          Atualizar
        </button>
      </div>
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Emails Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <InboxList emails={emails} loading={loading} error={error} />
        </CardContent>
      </Card>
    </div>
  );
}
