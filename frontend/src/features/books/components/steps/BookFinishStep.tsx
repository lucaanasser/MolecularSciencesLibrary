import React from "react";
import { BookOption } from "@/features/books/types/book";

interface BookFinishStepProps {
  onAddAnother: () => void;
  onGeneratePdf: () => void;
  isGenerating: boolean;
  pdfUrl: string | null;
  books: BookOption[];
}

export default function BookFinishStep({
  onAddAnother,
  onGeneratePdf,
  isGenerating,
  pdfUrl,
  books,
}: BookFinishStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-xl font-bold">Deseja adicionar outro livro?</h2>
      <div className="flex gap-4">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onAddAnother}
        >
          Sim, adicionar outro
        </button>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="text-lg font-semibold">Ou gere o PDF das etiquetas:</span>
        <button
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          onClick={onGeneratePdf}
          disabled={isGenerating || books.length === 0}
        >
          {isGenerating ? "Gerando PDF..." : "Gerar PDF"}
        </button>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="etiquetas.pdf"
            className="mt-2 text-blue-500 underline"
          >
            Baixar etiquetas
          </a>
        )}
      </div>
    </div>
  );
}
