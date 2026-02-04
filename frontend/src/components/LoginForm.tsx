import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginForm } from "@/hooks/useLoginForm";

const LoginForm: React.FC = () => { 
  const {
    matricula,
    setMatricula,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    forgotLoading,
    handleSubmit,
    handleForgotPassword,
  } = useLoginForm();

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
          autoComplete="username"
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

        { /* Botões de ação */ }
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
      Ainda não possui uma conta? {' '} 
      <br className="md:hidden" />
      <Link className="link" to="/criar-conta">Crie uma aqui</Link>
    </p>

    </>
  );
};

export default LoginForm;
