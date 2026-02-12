import { useState } from "react";
import { useAddUser } from "@/features/admin/features/users/hooks/useAddUser";
import type { User } from "@/types/new_user";
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
  
  const { handleSubmit } = useAddUser({
    onSuccess,
    onError,
    getFormValues: () => ({
      name,
      email,
      NUSP: Number(NUSP),
      phone,
      class: Number(userClass),
    }),
  });

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

      <ActionBar
        onCancel={onBack}
        confirmLabel="Adicionar"
      />
    </form>
  );
};

export default AddUserForm;