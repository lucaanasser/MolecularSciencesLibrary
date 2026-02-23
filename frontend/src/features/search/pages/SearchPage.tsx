/**
 * Página inicial de busca.
 *
 * Exibe:
 * - Logo Molecoogle em destaque.
 * - Barra de busca centralizada com sugestões e histórico de buscas.
 *
 * Props (SearchPageProps): veja types/index.ts.
 */

import { motion } from "framer-motion";
import { MolecoogleLogo, SearchPropsConfig, SearchPanel } from "..";

export default function SearchPage(props: SearchPropsConfig){
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-8 md:gap-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <MolecoogleLogo fontSize="text-5xl md:text-8xl" onLogoClick={props?.onLogoClick} />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-[80vw] md:w-[60vw] lg:w-[40vw]"
      >
        <SearchPanel {...props} size="lg" />      
      </motion.div>
    </div>
  )
};