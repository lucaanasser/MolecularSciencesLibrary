import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type Tab = 'Críticas e sugestões' | 'Sugestões de livros' | 'Doação de exemplares';

interface TabFormProps {
  tab: Tab;
}

const TabForm: React.FC<TabFormProps> = ({ tab }) => {
  let subjectPrefix = '';
  let placeholder = '';
  switch (tab) {
    case 'Críticas e sugestões':
      subjectPrefix = 'Críticas e sugestões';
      placeholder = 'Compartilhe suas ideias, sugestões ou feedback...';
      break;
    case 'Sugestões de livros':
      subjectPrefix = 'Sugestão de livros';
      placeholder = 'Indique o(s) livro(s) que gostaria de sugerir...';
      break;
    case 'Doação de exemplares':
      subjectPrefix = 'Doação de exemplares';
      placeholder = 'Coloque aqui quaisquer outras informações sobre o livro que deseja doar...';
      break;
  }

  const isDonation = tab === 'Doação de exemplares';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form className="space-y-4 mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const email = formData.get("email") as string;
        let body = "";
        if (isDonation) {
          body =
            `Título: ${formData.get("titulo")}` + "\n" +
            `Autor: ${formData.get("autor")}` + "\n" +
            `Área: ${formData.get("area")}` + "\n" +
            `Estado: ${formData.get("estado")}` + "\n" +
            `Motivo: ${formData.get("motivo")}` + "\n" +
            `Mensagem: ${formData.get("message")}`;
        } else {
          body = `${formData.get("message")}`;
        }
        try {
          const res = await fetch("/api/forms/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              subject: subjectPrefix,
              message: body,
              type: tab,
            }),
          });
          if (!res.ok) {
            throw new Error("Erro ao enviar. Tente novamente mais tarde.");
          }
          setSuccess("Mensagem enviada! Você receberá um email de confirmação.");
          form.reset();
        } catch (err: any) {
          setError("Erro ao enviar. Tente novamente mais tarde.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div>
        <label htmlFor={`email-${tab}`} className="block text-sm font-medium text-gray-700 mb-2">
          Seu email
        </label>
        <input
          type="email"
          id={`email-${tab}`}
          name="email"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-library-purple focus:border-transparent text-sm"
          placeholder="seu.email@exemplo.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assunto
        </label>
        <input
          type="text"
          value={subjectPrefix}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
          tabIndex={-1}
        />
      </div>
      {/* Campos extras para doação */}
      {isDonation && (
        <>
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título do livro
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-library-purple focus:border-transparent text-sm"
              placeholder="Ex: Princípios de Química"
            />
          </div>
          <div>
            <label htmlFor="autor" className="block text-sm font-medium text-gray-700 mb-2">
              Autor
            </label>
            <input
              type="text"
              id="autor"
              name="autor"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-library-purple focus:border-transparent text-sm"
              placeholder="Ex: John Smith"
            />
          </div>
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
              Área
            </label>
            <input
              type="text"
              id="area"
              name="area"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-library-purple focus:border-transparent text-sm"
              placeholder="Ex: Química, Biologia, Física..."
            />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado do livro
            </label>
            <select
              id="estado"
              name="estado"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-library-purple focus:border-transparent text-sm"
              defaultValue=""
            >
              <option value="" disabled>Selecione o estado</option>
              <option value="novo">Novo</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="danificado">Danificado</option>
            </select>
          </div>
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da doação
            </label>
            <textarea
              id="motivo"
              name="motivo"
              rows={2}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-library-purple focus:border-transparent resize-none text-sm"
              placeholder="O que esse livro pode agregar ao acervo do CM?"
            />
          </div>
        </>
      )}
      <div>
        <label htmlFor={`message-${tab}`} className="block text-sm font-medium text-gray-700 mb-2">
          Mensagem
        </label>
        <textarea
          id={`message-${tab}`}
          name="message"
          rows={4}
          required={!isDonation}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-library-purple focus:border-transparent resize-none text-sm"
          placeholder={placeholder}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-library-purple hover:bg-library-purple-muted text-white rounded-xl font-bold py-3 flex items-center justify-center gap-2"
        disabled={loading}
      >
        <Send className="h-4 w-4" />
        {loading ? "Enviando..." : "ENVIAR"}
      </Button>
      {success && <div className="text-green-600 mt-2">{success}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
};

export default TabForm;
