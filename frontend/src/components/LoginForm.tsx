import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

/**
 * Formulário de login.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const LoginForm: React.FC = () => {
  // Log de início de renderização
  console.log("🔵 [LoginForm] Renderizando formulário de login");
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("🔵 [LoginForm] Tentando autenticar usuário:", matricula);
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NUSP: matricula, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("🔴 [LoginForm] Erro de autenticação:", data.error);
        throw new Error(data.error || "Erro ao autenticar");
      }

      // Salva o token e dados do usuário
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${data.name}!`,
      });

      console.log("🟢 [LoginForm] Login realizado com sucesso para:", data.name);

      // Redireciona conforme o papel
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "proaluno") {
        navigate("/proaluno");
      } else {
        navigate("/perfil");
      }
    } catch (err: any) {
      console.error("🔴 [LoginForm] Erro ao autenticar:", err.message);
      toast({
        title: "Erro de autenticação",
        description: err.message || "Matrícula ou senha incorreta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!matricula) {
      toast({
        title: "Informe seu email ou matrícula",
        description: "Digite seu email ou número de matrícula para redefinir a senha.",
        variant: "destructive",
      });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: matricula }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar email de redefinição");
      toast({
        title: "Email enviado!",
        description: "Se o usuário existir, você receberá um email com instruções para redefinir sua senha.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao enviar email",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-6">
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <h3>Login</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Número USP ou Email</Label>
              <Input
                id="matricula"
                placeholder="Ex: 123456789 ou seuemail@usp.br"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Senha</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl pr-12"
                  required
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  className="text-gray-500 hover:text-cm-purple focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={0}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-7 0-11-7-11-7a20.13 20.13 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="link"
              className="text-cm-purple px-0 text-sm"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
            >
              {forgotLoading ? "Enviando..." : "Esqueci minha senha"}
            </Button>
          </div>
          <button
            type="submit"
            className="wide-btn bg-cm-purple"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
