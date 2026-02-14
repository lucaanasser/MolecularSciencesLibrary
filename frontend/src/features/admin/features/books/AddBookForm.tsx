import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActionBar from "@/features/admin/components/ActionBar";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import { BooksService } from "@/services/BooksService";

const AddBookForm: React.FC<TabComponentProps> = ({ onSuccess, onError, onBack }) => {
  // Estados para os campos do formulário
  const [area, setArea] = useState("");
  const [subarea, setSubarea] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [edition, setEdition] = useState("");
  const [volume, setVolume] = useState("");
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState("");
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");

  // Função de submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await BooksService.createBook({
        area,
        subarea,
        title,
        subtitle: subtitle || undefined,
        authors,
        edition: Number(edition),
        volume: Number(volume),
        language,
        code: code || undefined,
        id: id ? Number(id) : undefined,
        status: status || undefined,
      });
      onSuccess("Livro adicionado com sucesso!");
    } catch (err: any) {
      onError(err.message || "Não foi possível adicionar o livro.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>Preencha os campos abaixo para adicionar um novo livro ao acervo.</p>
      <div>
        <Label htmlFor="area">Área:</Label>
        <Input id="area" value={area} onChange={e => setArea(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="subarea">Subárea:</Label>
        <Input id="subarea" value={subarea} onChange={e => setSubarea(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="title">Título:</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="subtitle">Subtítulo:</Label>
        <Input id="subtitle" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="authors">Autores:</Label>
        <Input id="authors" value={authors} onChange={e => setAuthors(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="edition">Edição:</Label>
        <Input id="edition" type="number" value={edition} onChange={e => setEdition(e.target.value)} required min={1} />
      </div>
      <div>
        <Label htmlFor="volume">Volume:</Label>
        <Input id="volume" type="number" value={volume} onChange={e => setVolume(e.target.value)} required min={0} />
      </div>
      <div>
        <Label htmlFor="language">Idioma:</Label>
        <Input id="language" value={language} onChange={e => setLanguage(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="code">Código de posição:</Label>
        <Input id="code" value={code} onChange={e => setCode(e.target.value)} placeholder="(opcional)" />
      </div>
      <div>
        <Label htmlFor="id">Código de barras (EAN-13):</Label>
        <Input id="id" type="number" value={id} onChange={e => setId(e.target.value)} placeholder="(opcional)" />
      </div>
      <div>
        <Label htmlFor="status">Status:</Label>
        <Input id="status" value={status} onChange={e => setStatus(e.target.value)} placeholder="disponível, emprestado, reservado... (opcional)" />
      </div>
      <ActionBar
        onCancel={onBack}
        confirmLabel="Adicionar"
      />
    </form>
  );
};

export default AddBookForm;
