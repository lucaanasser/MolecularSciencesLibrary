
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const LoginForm: React.FC = () => {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication with test credentials
    setTimeout(() => {
      if (matricula === "13691375" && password === "aluno123") {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo, Aluno!",
        });
        navigate("/profile");
      } else if (matricula === "1234" && password === "admin123") {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo, Administrador!",
        });
        navigate("/admin");
      } else {
        toast({
          title: "Erro de autenticação",
          description: "Matrícula ou senha incorreta. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center p-6">
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bebas">Login</h2>
          <p className="text-gray-500 mt-2">
            Credenciais de teste:<br />
            Aluno: 13691375 / aluno123<br />
            Admin: 1234 / admin123
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Número de Matrícula</Label>
              <Input
                id="matricula"
                placeholder="Ex: 13691375"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-sm text-cm-blue hover:underline">
                  Esqueceu a senha?
                </a>
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
          
          <Button
            type="submit"
            className="w-full mt-6 bg-cm-blue hover:bg-cm-blue/90 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p>
            Não tem uma conta?{" "}
            <a href="#" className="text-cm-blue hover:underline">
              Fale com a biblioteca
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
