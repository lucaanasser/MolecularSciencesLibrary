import { useState } from "react";
import { useAddUser } from "../hooks/useAddUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddUserFormProps {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess, onError }) => {
  const [name, setName] = useState("");
  const [NUSP, setNUSP] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { addUser, loading, error } = useAddUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUser({ name, email, password, NUSP: Number(NUSP) });
      setName("");
      setNUSP("");
      setEmail("");
      setPassword("");
      onSuccess && onSuccess();
    } catch (err: any) {
      onError && onError(err);
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
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Adicionando..." : "Adicionar Usuário"}
      </Button>
    </form>
  );
};

export default AddUserForm;