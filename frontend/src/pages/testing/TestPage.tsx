import { useState } from "react";
import ResultPage from "@/features/result-page/ResultPage";
import { BookOpen, Info, MessageSquare } from "lucide-react";

// Exemplo de dados fictícios
const book = {
  title: "Título do Livro",
  subtitle: "Subtítulo",
  authors: "Autor 1, Autor 2",
  code: "ABC123",
};

const highlightColor = "library-purple";

// HeaderInfo
const headerInfo = (
  <>
    <h3 className="my-0">
      {book.title}
      {book.subtitle && <span className="text-gray-600">: {book.subtitle}</span>}
    </h3>
    <p className="my-0">{book.authors}</p>
    <span className="px-3 py-1 secondary-bg text-white font-mono text-sm rounded-lg font-semibold">
      {book.code}
    </span>
  </>
);

// Sidebar (exemplo)
const sidebar = (
  <div>
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
      <p className="text-sm text-gray-500 mb-2">Avaliação Geral</p>
      <div className="border-t border-gray-100 pt-4 space-y-3">
        {/* Avaliações fictícias */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-library-purple">4.5</span>
          <span className="text-gray-600">Qualidade</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-cm-blue">4.2</span>
          <span className="text-gray-600">Legibilidade</span>
        </div>
      </div>
    </div>
    <button className="w-full bg-library-purple text-white rounded-xl font-bold py-3">
      Avaliar Livro
    </button>
  </div>
);

// Tabs e conteúdos
const tabs = [
  { id: "info", label: "Informações", shortLabel: "Info", icon: Info },
  { id: "avaliacoes", label: "Avaliações", shortLabel: "Avaliações", icon: MessageSquare },
];

const tabContents = [
  // Conteúdo da aba "Informações"
  <div key="info">
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>Status: <span className="text-green-600 font-bold">Disponível</span></div>
        <div>Reservado: <span className="text-gray-600">Não</span></div>
      </div>
      <div className="p-4 rounded-xl border bg-green-50 border-green-200">
        <span className="font-semibold">Disponível para empréstimo</span>
      </div>
    </div>
  </div>,
  // Conteúdo da aba "Avaliações"
  <div key="avaliacoes">
    <div className="space-y-6">
      <div>Aqui vão as avaliações e formulário de avaliação...</div>
    </div>
  </div>,
];

export default function TestPage() {
  return (
    <ResultPage
      icon={<BookOpen className="h-full w-full"/>}
      headerInfo={headerInfo}
      highlightColor={highlightColor}
      tabs={tabs}
      tabContents={tabContents}
      onBack={() => window.history.back()}
      ratingCardProps={{
        isLoading: false,
        mediaAvaliacoes: {
          geral: 4.5,
          qualidade: 4.2,
          legibilidade: 4.0
        },
        totalAvaliacoes: 120,
        criterios: [
          { key: "qualidade", label: "Qualidade", icon: Info, color: "library-purple" },
          { key: "legibilidade", label: "Legibilidade", icon: MessageSquare, color: "cm-blue" }
        ],
        isLoggedIn: false,
        myEvaluation: null,
        onEdit: () => console.log("Editar avaliação"),
        onDelete: () => console.log("Deletar avaliação"),
        onCreate: () => console.log("Criar avaliação"),
        onLogin: () => console.log("Fazer login")
      }}
    />
  );
}