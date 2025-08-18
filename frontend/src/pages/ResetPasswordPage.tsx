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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
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
          src="/images/erro404.svg"
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
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    minLength={6}
                    className="rounded-xl pr-12"
                    required
                  />
                  <button
                    type="button"
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    className="text-gray-500 hover:text-cm-purple focus:outline-none"
                    onClick={() => setShowNewPassword(v => !v)}
                    tabIndex={0}
                    aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.122-6.125M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.878-2.122A9.96 9.96 0 0122 9c0 5.523-4.477 10-10 10a10.05 10.05 0 01-1.875-.175" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-2.828A9.96 9.96 0 0122 12c0 5.523-4.477 10-10 10S2 17.523 2 12a9.96 9.96 0 012.828-2.828" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    minLength={6}
                    className="rounded-xl pr-12"
                    required
                  />
                  <button
                    type="button"
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    className="text-gray-500 hover:text-cm-purple focus:outline-none"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    tabIndex={0}
                    aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.122-6.125M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.878-2.122A9.96 9.96 0 0122 9c0 5.523-4.477 10-10 10a10.05 10.05 0 01-1.875-.175" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-2.828A9.96 9.96 0 0122 12c0 5.523-4.477 10-10 10S2 17.523 2 12a9.96 9.96 0 012.828-2.828" /></svg>
                    )}
                  </button>
                </div>
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
