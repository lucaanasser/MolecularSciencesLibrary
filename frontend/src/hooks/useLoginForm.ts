import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { logger } from "@/utils/logger";

/**
 * Hook customizado para gerenciar o estado e lógica do formulário de login
 */
export const useLoginForm = () => {
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
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NUSP: matricula, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        logger.error("🔴 [LoginForm] Erro de autenticação:", data.error);
        throw new Error(data.error || "Erro ao autenticar");
      }

      // Salva o token e dados do usuário
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${data.name}!`,
      });

      logger.info("🟢 [LoginForm] Login realizado com sucesso para:", data.name);

      // Redireciona conforme o papel
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
        description: err.message || "Matrícula ou senha incorreta.",
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
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: matricula }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        logger.error("🔴 [LoginForm] Erro ao enviar email:", data.error);
        throw new Error(data.error || "Erro ao enviar email de redefinição");
      }
      
      logger.info("🟢 [LoginForm] Email de recuperação enviado com sucesso");
      toast({
        title: "Email enviado!",
        description: "Se o usuário existir, você receberá um email com instruções para redefinir sua senha.",
      });
    } catch (err: any) {
      logger.error("🔴 [LoginForm] Erro ao processar recuperação:", err.message);
      toast({
        title: "Erro ao enviar email",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return {
    // Estado do formulário
    matricula,
    setMatricula,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    
    // Estado de loading
    isLoading,
    forgotLoading,
    
    // Ações
    handleSubmit,
    handleForgotPassword,
  };
};
