import React from "react";
import { BookOpen, FileText } from "lucide-react";
import type { FullDiscipline } from "@/services/DisciplinesService";

interface DisciplineHeaderProps {
  disciplina: FullDiscipline;
}

const DisciplineHeader: React.FC<DisciplineHeaderProps> = ({ disciplina }) => (
  <>
    <div className="flex flex-wrap items-center gap-2 mb-1">
      <span className="px-3 py-1 bg-academic-blue/10 text-academic-blue font-mono text-sm rounded-lg font-semibold">
        {disciplina.codigo}
      </span>
      <span className={`px-3 py-1 text-sm rounded-lg font-semibold ${
        disciplina.is_postgrad ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
      }`}>
        {disciplina.is_postgrad ? "Pós-Graduação" : "Graduação"}
      </span>
      {disciplina.unidade && <span className="text-sm text-gray-500">{disciplina.unidade}</span>}
      {disciplina.campus && <span className="text-sm text-gray-400">• {disciplina.campus}</span>}
    </div>
    <h1 className="text-3xl sm:text-4xl font-bebas text-gray-900">{disciplina.nome}</h1>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
      <span className="flex items-center gap-1">
        <BookOpen className="w-4 h-4" />
        {disciplina.creditos_aula} créditos aula
      </span>
      <span className="flex items-center gap-1">
        <FileText className="w-4 h-4" />
        {disciplina.creditos_trabalho} créditos trabalho
      </span>
    </div>
  </>
);

export default DisciplineHeader;
