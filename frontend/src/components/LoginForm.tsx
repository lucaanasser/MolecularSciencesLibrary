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
        navigate("/profile");
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
          <h2 className="text-3xl font-bebas">Login</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Número de Matrícula ou Email</Label>
              <Input
                id="matricula"
                placeholder="Ex: 13691375 ou seu@email.com"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="link"
              className="text-cm-blue px-0 text-sm"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
            >
              {forgotLoading ? "Enviando..." : "Esqueci minha senha"}
            </Button>
          </div>
          <Button
            type="submit"
            className="w-full mt-6 bg-cm-blue hover:bg-cm-blue/90 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
