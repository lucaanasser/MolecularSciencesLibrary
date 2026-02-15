import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActionBar from "@/features/admin/components/ActionBar";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import { UsersService } from "@/services/UsersService";

const AddUserForm: React.FC<TabComponentProps> = ({ onSuccess, onError, onBack }) => {
  // Estados para os campos do formulário
  const [name, setName] = useState("");
  const [NUSP, setNUSP] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userClass, setUserClass] = useState("");
  const [loading, setIsLoading] = useState(false);
  
  // Função de submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Previne múltiplos envios
    setIsLoading(true);
    try {
      await UsersService.createUser({
        name,
        NUSP: Number(NUSP),
        email,
        phone,
        class: Number(userClass),
      });
      onSuccess("Usuário adicionado com sucesso!");
    } catch (err: any) {
      onError(err.message || "Não foi possível adicionar o usuário.");
    } finally {
      setIsLoading(false);
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

      <ActionBar
        onCancel={onBack}
        confirmLabel="Adicionar"
        loading={loading}
      />
    </form>
  );
};

export default AddUserForm;