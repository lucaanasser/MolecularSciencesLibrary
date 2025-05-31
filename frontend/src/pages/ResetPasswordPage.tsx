import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError("Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Definir nova senha</h1>
      {success ? (
        <div className="text-green-600 text-center mb-4">
          Senha redefinida com sucesso! Redirecionando para o login...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      )}
    </div>
  );
}
