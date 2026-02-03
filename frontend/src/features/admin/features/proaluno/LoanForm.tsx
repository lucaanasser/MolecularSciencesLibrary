import { useState } from "react";
import { useLoanValidation } from "@/features/admin/hooks/useLoanValidation";
import { useLoanOperation } from "@/features/admin/hooks/useLoanOperation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";

/**
 * Componente de formulário para empréstimos.
 * Valida usuário, senha e livro antes de criar o empréstimo.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

interface LoanFormProps {
  onCancel: () => void;
  onSuccess: (loanDetails: any, nusp: string, codigoLivro: string) => void;
}

export const LoanForm = ({ onCancel, onSuccess }: LoanFormProps) => {
  const validation = useLoanValidation();
  const loanOp = useLoanOperation();

  const [nusp, setNusp] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [codigoLivro, setCodigoLivro] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const loading = validation.loading || loanOp.loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    // Validação de NUSP
    if (!nusp) {
      setFormError("Informe o NUSP.");
      return;
    }

    console.log("🔵 [LoanForm] Validando usuário");
    const usuario = await validation.findUserByNusp(nusp);
    if (!usuario) {
      setFormError("NUSP não encontrado ou inválido.");
      return;
    }

    // Validação de senha
    if (!senha) {
      setFormError("Informe a senha.");
      return;
    }

    console.log("🔵 [LoanForm] Validando senha");
    const senhaValida = await validation.validatePassword(nusp, senha);
    if (!senhaValida) {
      setFormError("Senha incorreta ou usuário inválido.");
      return;
    }

    // Validação de livro
    if (!codigoLivro) {
      setFormError("Informe o código do livro.");
      return;
    }

    console.log("🔵 [LoanForm] Validando livro");
    const livro = await validation.validateBook(codigoLivro);
    if (!livro) {
      setFormError(validation.error || "Livro não encontrado ou não disponível para empréstimo.");
      return;
    }

    // Criar empréstimo
    try {
      console.log("🔵 [LoanForm] Criando empréstimo com autenticação");
      const result = await loanOp.createLoan({
        NUSP: nusp,
        password: senha,
        book_id: Number(codigoLivro)
      });

      console.log("🟢 [LoanForm] Empréstimo criado com sucesso");
      onSuccess(result, nusp, codigoLivro);
    } catch (err: any) {
      console.error("🔴 [LoanForm] Erro ao criar empréstimo:", err);
      if (err?.message?.includes("EmailService.sendNotificationEmail is not a function")) {
        setFormError("Empréstimo registrado, mas houve um erro ao enviar a notificação por email. Informe o administrador.");
        onSuccess(null, nusp, codigoLivro);
      } else {
        setFormError(err?.message || "Erro ao registrar empréstimo.");
      }
    }
  };

  return (
    <form className="max-w-lg mx-auto" onSubmit={handleSubmit}>
      <Label>Número USP:</Label>
      <Input
        type="text"
        value={nusp}
        onChange={(e) => setNusp(e.target.value)}
        placeholder="ex: 123456789"
        disabled={loading}
        autoFocus
      />

      <Label>Senha:</Label>
      <Input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Digite sua senha"
        disabled={loading}
      />
      
      <Label>Código do Livro:</Label>
      <Input
        type="text"
        value={codigoLivro}
        onChange={(e) => setCodigoLivro(e.target.value)}
        placeholder="Escaneie ou digite o código de barras"
        disabled={loading}
      />
      
      {formError && <div className="text-red-600 prose-sm">{formError}</div>}

      <ActionBar
        onCancel={onCancel}
        onConfirm={() => {}}
        cancelLabel="Cancelar"
        confirmLabel={loading ? "Registrando..." : "Confirmar empréstimo"}
        loading={loading}
      />

    </form>
  );
};
