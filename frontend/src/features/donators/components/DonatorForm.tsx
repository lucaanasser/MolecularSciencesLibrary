import React, { useState, useEffect } from 'react';
import { useCreateDonator } from '@/features/donators/hooks/useCreatDonator';
import { Donator } from '@/features/donators/types/Donator';
import { useFindUser } from '@/features/donators/hooks/useFindUser';
import { useFindBookById } from '@/features/donators/hooks/useFindBookById';

interface DonatorFormProps {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export function DonatorForm({ onSuccess, onError }: DonatorFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Donator>({ donation_type: 'book' });
  const [isUser, setIsUser] = useState(false); 
  const { createDonator, loading, error, success } = useCreateDonator();
  const [userError, setUserError] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);

  const { findUser, loading: userLoading, error: userErrorRaw } = useFindUser();
  const { findBookById, isLoading: bookLoading } = useFindBookById();

  // Validação do usuário
  useEffect(() => {
    if (isUser && form.user_id) {
      const foundUser = findUser(form.user_id.toString());
      setUserError(foundUser ? null : 'Usuário não encontrado');
    } else {
      setUserError(null);
    }
  }, [form.user_id, isUser, findUser]);

  // Validação do livro
  useEffect(() => {
    if (form.donation_type === 'book' && form.book_id) {
      const foundBook = findBookById(form.book_id.toString());
      setBookError(foundBook ? null : 'Livro não encontrado');
    } else {
      setBookError(null);
    }
  }, [form.book_id, form.donation_type, findBookById]);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDonator({
        ...form,
        user_id: form.user_id ? Number(form.user_id) : null,
        book_id: form.donation_type === 'book' ? Number(form.book_id) : null,
        amount: form.donation_type === 'money' ? Number(form.amount) : null,
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (onError) onError(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step === 0 && (
        <div>
          <label className="block mb-1 font-medium">Nome do doador</label>
          <input
            className="border rounded p-2 w-full"
            name="name"
            value={form.name || ''}
            onChange={handleChange}
            required
          />
          <label className="block mt-3 mb-1 font-medium">Contato</label>
          <input
            className="border rounded p-2 w-full"
            name="contact"
            value={form.contact || ''}
            onChange={handleChange}
          />
          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="isUser"
              checked={isUser}
              onChange={(e) => {
                setIsUser(e.target.checked);
                if (!e.target.checked) setForm((f) => ({ ...f, user_id: undefined }));
              }}
              className="mr-2"
            />
            <label htmlFor="isUser" className="font-medium">Doador é usuário?</label>
          </div>
          {isUser && (
            <div>
              <label className="block mt-3 mb-1 font-medium">NUSP do usuário</label>
              <input
                className="border rounded p-2 w-full"
                name="user_id"
                type="number"
                value={form.user_id || ''}
                onChange={handleChange}
                required
                disabled={userLoading}
              />
              {userError && <div className="text-red-600">{userError}</div>}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="bg-cm-blue text-white px-4 py-2 rounded"
              onClick={handleNext}
              disabled={
                (isUser && (!!userError || userLoading || !form.user_id)) ||
                !form.name
              }
            >
              Próximo
            </button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div>
          <label className="block mb-1 font-medium">Tipo de doação</label>
          <select
            className="border rounded p-2 w-full"
            name="donation_type"
            value={form.donation_type}
            onChange={handleChange}
          >
            <option value="book">Livro</option>
            <option value="money">Financeira</option>
          </select>
          {form.donation_type === 'book' && (
            <>
              <label className="block mt-3 mb-1 font-medium">ID do Livro</label>
              <input
                className="border rounded p-2 w-full"
                name="book_id"
                type="number"
                value={form.book_id || ''}
                onChange={handleChange}
                required
                disabled={bookLoading}
              />
              {bookError && <div className="text-red-600">{bookError}</div>}
            </>
          )}
          {form.donation_type === 'money' && (
            <>
              <label className="block mt-3 mb-1 font-medium">Valor da doação (R$)</label>
              <input
                className="border rounded p-2 w-full"
                name="amount"
                type="number"
                step="0.01"
                value={form.amount || ''}
                onChange={handleChange}
                required
              />
            </>
          )}
          <div className="flex justify-between mt-4">
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={handleBack}>
              Voltar
            </button>
            <button
              type="submit"
              className="bg-cm-green text-white px-4 py-2 rounded"
              disabled={
                loading ||
                (form.donation_type === 'book' && (!!bookError || bookLoading || !form.book_id))
              }
            >
              {loading ? 'Salvando...' : 'Salvar Doador'}
            </button>
          </div>
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-700">Doador cadastrado com sucesso!</div>}
    </form>
  );
}

export default DonatorForm;
