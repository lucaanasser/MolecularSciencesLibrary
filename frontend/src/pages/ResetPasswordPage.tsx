import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Token de redefinição ausente ou inválido.");
      return;
    }
    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao redefinir senha.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/entrar"), 2000);
    } catch (err: any) {
      setError("Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-6 min-h-screen bg-gray-50">
      <div className="w-full max-w-md flex flex-col items-center">
        <img
          src="/images/erro404.png"
          alt="Carlos Magno esquecido"
          className="w-full mb-4 rounded-2xl object-cover"
        />
        <Card className="w-full p-6 rounded-2xl shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bebas">Definir nova senha</h2>
          </div>
        {success ? (
          <div className="text-green-600 text-center mb-4">
            Senha redefinida com sucesso! Redirecionando para o login...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  minLength={8}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  minLength={8}
                  className="rounded-xl"
                  required
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </div>
            <Button
              type="submit"
              className="w-full mt-6 bg-cm-purple hover:bg-cm-purple/90 rounded-xl"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}
        </Card>
      </div>
    </div>
  );
}
