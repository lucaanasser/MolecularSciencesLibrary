import { useState } from "react";
import { useAddUser } from "@/features/users/hooks/useCreateUser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActionBar from "@/features/admin/components/ActionBar";

/**
 * Formulário para adicionar usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
interface AddUserFormProps {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
  onBack?: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess, onError, onBack }) => {
  const [name, setName] = useState("");
  const [NUSP, setNUSP] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userClass, setUserClass] = useState("");
  const { addUser, loading, error } = useAddUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !NUSP || !email || !phone || !userClass) {
      alert("Preencha todos os campos obrigatórios, incluindo turma.");
      return;
    }
    try {
      console.log("🔵 [AddUserForm] Adicionando usuário:", name, NUSP, email, userClass);
      await addUser({ name, email, NUSP: Number(NUSP), phone, class: userClass });
      setName("");
      setNUSP("");
      setEmail("");
      setPhone("");
      setUserClass("");
      onSuccess && onSuccess();
      console.log("🟢 [AddUserForm] Usuário adicionado com sucesso");
    } catch (err: any) {
      onError && onError(err);
      console.error("🔴 [AddUserForm] Erro ao adicionar usuário:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="nusp">NUSP</Label>
        <Input id="nusp" value={NUSP} onChange={e => setNUSP(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required pattern="\+?\d{10,15}" placeholder="Ex: 11999999999" />
      </div>
      <div>
        <Label htmlFor="class">Turma (número)</Label>
        <Input id="class" value={userClass} onChange={e => setUserClass(e.target.value)} required placeholder="Ex: 33" />
      </div>
      {error && <div className="text-cm-red">{error}</div>}

      <ActionBar
        onCancel={onBack}
        confirmLabel={loading ? "Adicionando..." : "Adicionar Usuário"}
        loading={loading}
      />
    </form>
  );
};

export default AddUserForm;