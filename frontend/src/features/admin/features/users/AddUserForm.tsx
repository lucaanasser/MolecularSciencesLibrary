import { useState } from "react";
import { useAddUser } from "@/features/users/hooks/useCreateUser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActionBar from "@/features/admin/components/ActionBar";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

/**
 * Formulário para adicionar usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const AddUserForm: React.FC<TabComponentProps> = ({ onSuccess, onError, onBack }) => {
  const [name, setName] = useState("");
  const [NUSP, setNUSP] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userClass, setUserClass] = useState("");
  const { addUser, loading, error } = useAddUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !NUSP || !email || !phone || !userClass) {
      alert("Por favor, preencha todos os campos obrigatórios.");
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
      onSuccess("Usuário adicionado com sucesso!");
      console.log("🟢 [AddUserForm] Usuário adicionado com sucesso");
    } catch (err: any) {
      onError(err);
      console.error("🔴 [AddUserForm] Erro ao adicionar usuário:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <p>Preencha os campos abaixo para adicionar um novo usuário.</p>
      <div>
        <Label htmlFor="name">Nome:</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="nusp">NUSP:</Label>
        <Input id="nusp" type="number" value={NUSP} onChange={e => setNUSP(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="email">Email:</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="phone">Telefone:</Label>
        <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required pattern="\+?\d{10,15}" />
      </div>
      <div>
        <Label htmlFor="class">Turma:</Label>
        <Input id="class" type="number" value={userClass} onChange={e => setUserClass(e.target.value)} required />
      </div>

      {error && <div className="text-cm-red">{error}</div>}

      <ActionBar
        onCancel={onBack}
        confirmLabel={loading ? "Adicionando..." : "Adicionar"}
        loading={loading}
      />
    </form>
  );
};

export default AddUserForm;