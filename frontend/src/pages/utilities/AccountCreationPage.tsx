import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UsersService } from "@/services/UsersService";
import { useToast } from "@/hooks/useToast";
import { Link } from "react-router-dom";
import { User, Mail, Phone, GraduationCap, Hash, CheckCircle2, ArrowLeft } from "lucide-react";

export default function AccountCreationPage() {
  const [name, setName] = useState("");
  const [NUSP, setNUSP] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userClass, setUserClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await UsersService.registerUser({
        name,
        NUSP: Number(NUSP),
        email,
        phone,
        class: Number(userClass),
      });
      setSuccess(true);
    } catch (err: any) {
      toast({
        title: "Erro ao solicitar cadastro",
        description: err.message || "Não foi possível enviar o pedido de cadastro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-default-bg">
      <div className="w-full max-w-md">

        {/* Header com ícone */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full primary-bg mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="mb-1">
            {success ? "Tudo certo!" : "Criar conta"}
          </h2>
          <p className="text-default-text text-sm mb-0">
            {success
              ? "Sua solicitação foi enviada com sucesso."
              : "Preencha seus dados para solicitar acesso à biblioteca."
            }
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {success ? (
            <div className="p-6 md:p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cm-green/10 mx-auto">
                <CheckCircle2 className="w-10 h-10 text-cm-green" />
              </div>
              <div>
                <p className="text-default-text text-base mb-2">
                  Um administrador irá analisar seu cadastro. Quando aprovado,
                  você receberá um email para criar sua senha de acesso.
                </p>
                <p className="text-sm text-gray-400 mb-0">
                  Fique de olho na caixa de entrada e no spam.
                </p>
              </div>
              <Link to="/entrar" className="block pt-2">
                <Button variant="wide">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ir para o login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
              {/* Nome */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Nome completo
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="João da Silva"
                  required
                  disabled={loading}
                />
              </div>

              {/* NUSP e Turma lado a lado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nusp" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    NUSP
                  </Label>
                  <Input
                    id="nusp"
                    type="number"
                    value={NUSP}
                    onChange={e => setNUSP(e.target.value)}
                    placeholder="12345678"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="class" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                    Turma
                  </Label>
                  <Input
                    id="class"
                    type="number"
                    value={userClass}
                    onChange={e => setUserClass(e.target.value)}
                    placeholder="33"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="joao@usp.br"
                  required
                  disabled={loading}
                />
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  Telefone (com DDD)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="11999998888"
                  pattern="\+?\d{10,15}"
                  required
                  disabled={loading}
                />
              </div>

              {/* Ações */}
              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  variant="wide"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Solicitar cadastro"}
                </Button>
                <p className="text-center text-sm text-default-text mb-0">
                  Já tem conta?{" "}
                  <Link className="link font-medium" to="/entrar">
                    Entrar
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Rodapé discreto */}
        <p className="text-center text-xs text-gray-400 mt-6 mb-0">
          Após aprovação, você receberá um email para definir sua senha.
        </p>
      </div>
    </div>
  );
}
