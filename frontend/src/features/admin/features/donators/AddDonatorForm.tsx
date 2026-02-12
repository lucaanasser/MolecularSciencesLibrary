import React, { useState, useEffect, useRef } from "react";
import ActionBar from "@/features/admin/components/ActionBar";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCreateDonator } from '@/features/donators/hooks/useCreatDonator';
import { Donator } from '@/features/donators/types/Donator';
import { UsersService } from '@/services/UsersService';
import { useFindBookById } from '@/features/donators/hooks/useFindBookById';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const AddDonatorForm: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  const [form, setForm] = useState<Donator>({ donation_type: 'book' });
  const [isUser, setIsUser] = useState(false);
  const { createDonator, loading, error } = useCreateDonator();
  const [userError, setUserError] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const { findBookById, isLoading: bookLoading } = useFindBookById();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (isUser && form.user_id) {
        setUserLoading(true);
        setUserSearchError(null);
        try {
          const users = await UsersService.searchUsers({ q: form.user_id.toString() });
          setFoundUsers(users);
        } catch (err: any) {
          setFoundUsers([]);
          setUserSearchError(err.message);
        } finally {
          setUserLoading(false);
        }
      } else {
        setFoundUsers([]);
        setUserSearchError(null);
      }
    };
    fetchUser();
  }, [form.user_id, isUser]);

  useEffect(() => {
    if (isUser && form.user_id) {
      const found = foundUsers.find(u => String(u.NUSP) === String(form.user_id));
      setUserError(found ? null : 'Usuário não encontrado');
    } else {
      setUserError(null);
    }
  }, [foundUsers, isUser, form.user_id]);

  useEffect(() => {
    if (form.donation_type === 'book' && form.book_id) {
      const foundBook = findBookById(form.book_id.toString());
      setBookError(foundBook ? null : 'Livro não encontrado');
    } else {
      setBookError(null);
    }
  }, [form.book_id, form.donation_type, findBookById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name || (isUser && !form.user_id) || (form.donation_type === 'book' && !form.book_id) || (form.donation_type === 'money' && !form.amount)) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      await createDonator({
        ...form,
        user_id: form.user_id ? Number(form.user_id) : null,
        book_id: form.donation_type === 'book' ? Number(form.book_id) : null,
        amount: form.donation_type === 'money' ? Number(form.amount) : null,
      });
      onSuccess("Doador adicionado com sucesso!");
    } catch (err: any) {
      onError(err);
    }
  };

  const handleSave = () => formRef.current?.requestSubmit ? formRef.current.requestSubmit() : formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

  return (
    <div>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div>
          <p>Preencha os dados a seguir para adicionar um novo doador.</p>
          <Label htmlFor="name">Nome do doador:</Label>
          <Input
            id="name"
            name="name"
            value={form.name || ''}
            onChange={handleChange}
            required
          />
          <Label htmlFor="contact">Contato:</Label>
          <Input
            id="contact"
            name="contact"
            value={form.contact || ''}
            onChange={handleChange}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="isUser"
              checked={isUser}
              onCheckedChange={(checked) => {
                setIsUser(!!checked);
                if (!checked) setForm((f) => ({ ...f, user_id: undefined }));
              }}
            />
            <Label htmlFor="isUser">Doador é usuário?</Label>
          </div>
          {isUser && (
            <div>
              <Label htmlFor="user_id">NUSP do usuário:</Label>
              <Input
                id="user_id"
                name="user_id"
                type="number"
                value={form.user_id || ''}
                onChange={handleChange}
                required
                disabled={userLoading}
              />
              {userError && <p className="text-cm-red font-xs space-y-0">{userError}</p>}
              {userSearchError && <p className="text-cm-red font-xs space-y-0">{userSearchError}</p>}
            </div>
          )}
          <Label htmlFor="donation_type">Tipo de doação:</Label>
          <Select
            value={form.donation_type}
            onValueChange={(value) => setForm((f) => ({ ...f, donation_type: value as 'book' | 'money' }))}
          >
            <SelectTrigger id="donation_type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="book">Livro</SelectItem>
              <SelectItem value="money">Financeira</SelectItem>
            </SelectContent>
          </Select>
          {form.donation_type === 'book' && (
            <>
              <Label htmlFor="book_id">ID do Livro:</Label>
              <Input
                id="book_id"
                name="book_id"
                type="number"
                value={form.book_id || ''}
                onChange={handleChange}
                required
                disabled={bookLoading}
              />
              {bookError && <p className="text-cm-red font-xs space-y-0">{bookError}</p>}
            </>
          )}
          {form.donation_type === 'money' && (
            <>
              <Label htmlFor="amount" className="mt-3">Valor da doação (R$):</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={form.amount || ''}
                onChange={handleChange}
                required
              />
            </>
          )}
        </div>
        {error && <p className="text-cm-red font-xs space-y-0">{error}</p>}
        <ActionBar
          onCancel={onBack}
          onConfirm={handleSave}
          confirmLabel="Salvar Doador"
          loading={loading}
        />
      </form>
    </div>
  );
};

export default AddDonatorForm;
