import { useState } from "react";
import { useListUsers } from "@/features/admin/hooks/useListUsers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function getToken() {
  return localStorage.getItem("token");
}

export default function SendNotification() {
  const { users, loading } = useListUsers();
  const [query, setQuery] = useState("");
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [type, setType] = useState("custom");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setFoundUser(null);

    try {
      const q = query.trim().toLowerCase();
      const user = users.find(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase() === q) ||
          (u.NUSP && String(u.NUSP) === q)
      );
      setFoundUser(user || null);
      if (!user) {
        setError("Nenhum usuário encontrado.");
      } else {
        setError("");
      }
    } catch (err) {
      setFoundUser(null);
      setError("Erro ao buscar usuário.");
    } finally {
      setSearching(false);
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!foundUser?.id) {
      setError("Selecione um usuário para enviar a notificação.");
      return;
    }
    // Limpe e feche ANTES de aguardar o fetch
    setFoundUser(null);
    setQuery("");
    setMessage("");
    setSubject("");
    try {
      const token = getToken();
      const body: any = {
        user_id: foundUser.id,
        type,
        sendEmail: true,
      };
      if (type === "custom") {
        body.subject = subject;
        body.message = message;
      }
      if (type === "nudge") {
        body.message = "nudge";
      }
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao enviar notificação");
      setSuccess("Notificação enviada com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          placeholder="Nome, Email ou NUSP"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <Button type="submit" disabled={searching || loading}>
          Buscar
        </Button>
      </form>
      {foundUser ? (
        <div className="border rounded-xl p-4 mb-4">
          <div><b>Nome:</b> {foundUser.name}</div>
          <div><b>Email:</b> {foundUser.email}</div>
          <div><b>NUSP:</b> {foundUser.NUSP}</div>
          <div><b>Tipo:</b> {foundUser.role}</div>
          <form onSubmit={handleSend} className="space-y-4 mt-4">
            <div>
              <label className="block mb-1 font-medium">Tipo:</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="custom">Personalizada</option>
                <option value="nudge">Cutucar</option>
              </select>
            </div>
            {type === "custom" && (
              <>
                <div>
                  <label className="block mb-1 font-medium">Assunto do Email:</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required={type === "custom"}
                    placeholder="Assunto do email"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Mensagem:</label>
                  <textarea
                    className="w-full border rounded px-2 py-1"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required={type === "custom"}
                    rows={3}
                  />
                </div>
              </>
            )}
            <Button
              type="submit"
              className="bg-cm-blue text-white px-4 py-2 rounded hover:bg-cm-blue/90"
              disabled={loading}
            >
              Enviar Notificação
            </Button>
            {success && <div className="text-green-600">{success}</div>}
            {error && <div className="text-red-600">{error}</div>}
          </form>
        </div>
      ) : (
        query && !searching && (
          <div className="text-gray-500">Nenhum usuário encontrado.</div>
        )
      )}
      {error && !foundUser && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}