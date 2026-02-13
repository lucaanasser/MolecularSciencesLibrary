import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { UsersService } from "@/services/UsersService";
import { ROUTES } from "@/constants/navigation";


const LoginForm: React.FC = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await UsersService.authenticateUser({ login, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${data.name}!`,
      });
      if (data.role === "admin") 
        navigate(ROUTES.ADMIN);
      else if (data.role === "proaluno") 
        navigate(ROUTES.PROALUNO);
      else
        navigate(ROUTES.MY_PAGE);
    } catch (err: any) {
      toast({
        title: "Erro de autenticação",
        description: err.message || "Login ou senha incorreta.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    try {
      await UsersService.requestPasswordReset({ login });
      toast({
        title: "Email enviado!",
        description: "Você receberá um email em breve com instruções para redefinir sua senha.",
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
          {/* Campo de identificação */}
          <Label htmlFor="login">Número USP ou Email:</Label>
          <Input
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
            required
          />

          {/* Campo de senha */}
          <Label htmlFor="password">Senha:</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-transparent border-0 p-0 cursor-pointer text-gray-500 hover:primary-text focus:outline-none"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
            </button>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col-reverse">
            <Button
              type="submit"
              variant="wide"
              className="primary-bg"
              tabIndex={0}
            >
              Entrar
            </Button>
            <div className="flex justify-end mb-4">
              <Button
                size="sm"
                className="primary-text"
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
        Ainda não possui uma conta? {" "}
        <br className="md:hidden" />
        <Link className="link" to="/criar-conta">Crie uma aqui</Link>
      </p>
    </>
  );
};

export default LoginForm;