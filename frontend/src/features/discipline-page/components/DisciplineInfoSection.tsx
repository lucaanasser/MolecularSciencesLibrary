import React from "react";
import { motion } from "framer-motion";
import type { FullDiscipline } from "@/services/DisciplinesService";

interface DisciplineInfoSectionProps {
  disciplina: FullDiscipline;
}

const DisciplineInfoSection: React.FC<DisciplineInfoSectionProps> = ({ disciplina }) => (
  <div className="space-y-6">
    {disciplina.ementa && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-3">Ementa</h2>
        <p className="text-gray-600 leading-relaxed">{disciplina.ementa}</p>
      </motion.div>
    )}
    {disciplina.objetivos && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-3">Objetivos</h2>
        <p className="text-gray-600 leading-relaxed">{disciplina.objetivos}</p>
      </motion.div>
    )}
    {disciplina.conteudo_programatico && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-3">Conteúdo Programático</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{disciplina.conteudo_programatico}</p>
      </motion.div>
    )}
    {!disciplina.ementa && !disciplina.objetivos && !disciplina.conteudo_programatico && (
      <p className="text-gray-500 text-center py-8">
        Informações detalhadas não disponíveis para esta disciplina.
      </p>
    )}
  </div>
);

export default DisciplineInfoSection;
