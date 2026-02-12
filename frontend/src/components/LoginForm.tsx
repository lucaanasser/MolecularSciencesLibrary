import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { logger } from "@/utils/logger";
import { UsersService } from "@/services/UsersService";


const LoginForm: React.FC = () => {
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
      logger.info("🔵 [LoginForm] Tentando autenticar usuário:", matricula);
      let authPayload: any = { password };
      if (/^\d+$/.test(matricula)) {
        authPayload.NUSP = Number(matricula);
      } else {
        authPayload.email = matricula;
      }
      const data = await UsersService.authenticateUser(authPayload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${data.name}!`,
      });
      logger.info("🟢 [LoginForm] Login realizado com sucesso para:", data.name);
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "proaluno") {
        navigate("/proaluno");
      } else {
        navigate("/perfil");
      }
    } catch (err: any) {
      logger.error("🔴 [LoginForm] Erro ao autenticar:", err.message);
      toast({
        title: "Erro de autenticação",
        description: JSON.parse(err.message).error || "Matrícula ou senha incorreta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    logger.info("🔵 [LoginForm] Iniciando recuperação de senha para:", matricula);
    if (!matricula) {
      logger.warn("🟡 [LoginForm] Matrícula não informada");
      toast({
        title: "Informe seu email ou matrícula",
        description: "Digite seu email ou número de matrícula para redefinir a senha.",
        variant: "destructive",
      });
      return;
    }
    setForgotLoading(true);
    try {
      logger.info("🔵 [LoginForm] Enviando requisição de recuperação de senha");
      let resetPayload: any = {};
      if (/^\d+$/.test(matricula)) {
        resetPayload.NUSP = Number(matricula);
      } else {
        resetPayload.email = matricula;
      }
      await UsersService.requestPasswordReset(resetPayload);
      logger.info("🟢 [LoginForm] Email de recuperação enviado com sucesso");
      toast({
        title: "Email enviado!",
        description: "Se o usuário existir, você receberá um email com instruções para redefinir sua senha.",
      });
    } catch (err: any) {
      logger.error("🔴 [LoginForm] Erro ao processar recuperação:", err.message);
      toast({
        title: "Erro ao enviar email",
        description: JSON.parse(err.message).error || "Tente novamente mais tarde.",
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
          <Label htmlFor="matricula">Número USP ou Email:</Label>
          <Input
            id="matricula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
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
              disabled={isLoading}
              tabIndex={0}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="flex justify-end mb-4">
              <Button
                size="sm"
                className="primary-text"
                onClick={(e) => {
                  e.preventDefault();
                  handleForgotPassword();
                }}
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