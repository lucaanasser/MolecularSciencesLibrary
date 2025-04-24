import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = {
  "Física": ["Física Geral", "Física Moderna", "Astrofísica"],
  "Química": ["Orgânica", "Inorgânica", "Analítica"],
  "Biologia": ["Molecular", "Celular", "Genética"],
  "Matemática": ["Álgebra", "Cálculo", "Geometria"],
  "Computação": ["Algoritmos", "Estruturas de Dados", "Teoria da Computação"],
  "Variados": ["Outro"]
};

export default function AddBookForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const [available, setAvailable] = useState(true);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory(""); // Reset subcategory when category changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode fazer a requisição para adicionar o livro
    alert("Livro adicionado (mock)!");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        placeholder="Título do Livro"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <Input
        placeholder="Autor"
        value={author}
        onChange={e => setAuthor(e.target.value)}
        required
      />
      <Input
        placeholder="Ano"
        type="number"
        value={year}
        onChange={e => setYear(e.target.value)}
        required
      />
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(categories).map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={subcategory}
        onValueChange={setSubcategory}
        disabled={!category}
      >
        <SelectTrigger>
          <SelectValue placeholder="Subcategoria" />
        </SelectTrigger>
        <SelectContent>
          {category && categories[category].map(sub => (
            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={available}
          onChange={e => setAvailable(e.target.checked)}
          id="available"
        />
        <label htmlFor="available">Disponível para empréstimo</label>
      </div>
      <Button type="submit" className="bg-cm-blue text-white rounded-xl">Adicionar Livro</Button>
    </form>
  );
}