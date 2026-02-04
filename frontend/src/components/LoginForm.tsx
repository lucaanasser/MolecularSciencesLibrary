import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { useSiteMode } from "@/contexts/SiteModeContext";

/**
 * Formulário de login.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const LoginForm: React.FC = () => {
  const { isAcademico } = useSiteMode();
  const modeColor = isAcademico ? 'academic-blue' : 'library-purple';
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
    <>
    <div className="bg-white rounded-2xl shadow-md flex items-center justify-center p-4 md:py-6 w-[84%] mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        <h2 className="text-center"> Login </h2>
        { /* Campo de identificação */ }
        <Label htmlFor="matricula">Número USP ou Email:</Label>
        <Input
          id="matricula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          required
        />
        
        { /* Campo de senha */ }
        <Label htmlFor="password">Senha:</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            className={`text-gray-500 hover:text-${modeColor} focus:outline-none`}
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={1}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
          </button>
        </div>

        { /* Botões de ação */ }
        <div className="flex flex-col-reverse">
          <Button
            type="submit"
            variant="wide"
            className={`bg-${modeColor}`}
            disabled={isLoading}
            tabIndex={0}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              className={`text-${modeColor}`}
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              type="button"
            >
              {forgotLoading ? "Enviando..." : "Esqueci minha senha"}
            </Button>
          </div>
          
        </div>
      </form>
    </div>

    {/* Link para criação conta */}
    <p className="text-center mt-8 md:mt-4">
      Ainda não possui uma conta? {' '} 
      <br className="md:hidden" />
      <a className="link" href="/criar-conta">Crie uma aqui</a>
    </p>

    </>
  );
};

export default LoginForm;
