import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = '/api';

export default function AddBookForm({ onCancel, onSuccess }) {
  // Wizard steps: 1=area, 2=pergunta, 3=idioma, 4=form
  const [step, setStep] = useState(1);

  // Dinâmico do backend
  const [areaCodes, setAreaCodes] = useState<{ [key: string]: string }>({});
  const [subareaCodes, setSubareaCodes] = useState<{ [key: string]: { [key: string]: string } }>({});

  // Seleção do usuário
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [addType, setAddType] = useState<"novo" | "exemplar" | "volume" | null>(null);
  const [language, setLanguage] = useState<number | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [edition, setEdition] = useState("");
  const [volume, setVolume] = useState("");

  // Livros existentes (busca real recomendada, aqui só exemplo)
  const [books, setBooks] = useState<any[]>([]);

  // Buscar opções do backend ao montar
  useEffect(() => {
    fetch(`${API_URL}/books/options`)
      .then(res => res.json())
      .then(data => {
        setAreaCodes(data.areaCodes || {});
        setSubareaCodes(data.subareaCodes || {});
      });
  }, []);

  // Passo 1: Seleção de área e subárea
  if (step === 1) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Informe a área e a subárea</h2>
        <Select value={category} onValueChange={v => { setCategory(v); setSubcategory(""); }}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(areaCodes).map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
          <SelectTrigger>
            <SelectValue placeholder="Subcategoria" />
          </SelectTrigger>
          <SelectContent>
            {category && subareaCodes[category] && Object.keys(subareaCodes[category]).map(sub => (
              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button disabled={!category || !subcategory} onClick={() => setStep(2)}>
            Avançar
          </Button>
          {onCancel && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
        </div>
      </div>
    );
  }

  // Passo 2: Lista de livros + busca + botão "Não encontrei o livro"
  if (step === 2) {
    // Aqui você pode buscar do backend: `/api/books?category=${category}&subcategory=${subcategory}`
    // Por enquanto, books está vazio
    const filteredBooks = books.filter(
      b =>
        (!category || b.category === category) &&
        (!subcategory || b.subcategory === subcategory) &&
        (!search || b.title.toLowerCase().includes(search.toLowerCase()))
    );
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-2">Verifique se o livro já existe no acervo</h2>
        <input
          type="text"
          placeholder="Buscar por nome do livro"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <Button
          className="mb-2"
          onClick={() => {
            setAddType("novo");
            setSelectedBook(null);
            setStep(3);
          }}
        >
          Não encontrei o livro
        </Button>
        {filteredBooks.length === 0 && <p>Nenhum livro encontrado nesta subárea.</p>}
        {filteredBooks.map(book => (
          <div key={book.id} className="border rounded p-2 flex flex-col gap-2">
            <div>
              <b>{book.title}</b> – {book.author} ({book.year}) Vol. {book.volume}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedBook(book);
                  setAddType("exemplar");
                  setStep(3);
                }}
              >
                Adicionar Novo Exemplar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedBook(book);
                  setAddType("volume");
                  setStep(3);
                }}
              >
                Adicionar Novo Volume
              </Button>
            </div>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
          {onCancel && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
        </div>
      </div>
    );
  }

  // Passo 3: Seleção de idioma
  if (step === 3) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Selecione o idioma do livro</h2>
        <Select onValueChange={v => { setLanguage(Number(v)); setStep(4); }}>
          <SelectTrigger>
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Português</SelectItem>
            <SelectItem value="2">Inglês</SelectItem>
            {/* Adicione outros idiomas se necessário */}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
      </div>
    );
  }

  // Passo 4: Formulário de preenchimento/ajuste
  if (step === 4) {
    const isExemplar = addType === "exemplar" && selectedBook;
    return (
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); /* Add your submit logic here */ }}>
        {isExemplar && (
          <div className="text-sm text-gray-600 mb-2">
            Ajuste conforme necessário.
          </div>
        )}
        <Input
          placeholder="Título do Livro"
          value={isExemplar ? (title || selectedBook.title) : title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <Input
          placeholder="Autores"
          value={isExemplar ? (authors || selectedBook.author) : authors}
          onChange={e => setAuthors(e.target.value)}
          required
        />
        <Input
          placeholder="Edição"
          value={isExemplar ? (edition || selectedBook.edition) : edition}
          onChange={e => setEdition(e.target.value)}
          required
        />
        <Input
          placeholder="Volume"
          value={isExemplar ? (volume || selectedBook.volume) : volume}
          onChange={e => setVolume(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <Button type="submit" className="bg-cm-blue text-white rounded-xl">
            {isExemplar ? "Adicionar Exemplar" : "Adicionar Livro"}
          </Button>
          <Button variant="outline" type="button" onClick={() => setStep(3)}>Voltar</Button>
        </div>
      </form>
    );
  }

  return null;
}