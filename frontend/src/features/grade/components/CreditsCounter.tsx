import { motion } from 'framer-motion';
import { BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditsCounterProps {
  creditos_aula: number;
  creditos_trabalho: number;
  className?: string;
}

/**
 * Componente que exibe o total de créditos da grade
 */
export function CreditsCounter({ creditos_aula, creditos_trabalho, className }: CreditsCounterProps) {
  const total = creditos_aula + creditos_trabalho;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-lg",
        "bg-gradient-to-r from-academic-blue-bg to-white dark:from-gray-800 dark:to-gray-900",
        "border border-academic-blue/20",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-academic-blue/10">
          <BookOpen className="w-4 h-4 text-academic-blue" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Créditos Aula</p>
          <p className="text-lg font-bold text-academic-blue">{creditos_aula}</p>
        </div>
      </div>

      <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-academic-blue/10">
          <Clock className="w-4 h-4 text-academic-blue" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Créditos Trabalho</p>
          <p className="text-lg font-bold text-academic-blue">{creditos_trabalho}</p>
        </div>
      </div>

      <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-academic-blue-dark/20">
          <BookOpen className="w-4 h-4 text-academic-blue-dark" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-lg font-bold text-academic-blue-dark">{total}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default CreditsCounter;
