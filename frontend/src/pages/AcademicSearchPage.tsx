import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Search, Users, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Página de busca do modo acadêmico.
 * Permite buscar disciplinas, usuários e recursos acadêmicos.
 */
const AcademicSearchPage: React.FC = () => {
  console.log("🔵 [AcademicSearchPage] Renderizando página de busca acadêmica");

  return (
    <div className="min-h-screen bg-gradient-to-br from-cm-academic-bg via-white to-cm-academic-light/10">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cm-academic/10 mb-6">
            <Search className="w-10 h-10 text-cm-academic" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bebas text-cm-academic mb-4">
            Busca Acadêmica
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Encontre disciplinas, colegas e recursos para o Ciclo Avançado do Ciências Moleculares.
          </p>
        </motion.div>

        {/* Em Construção */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-dashed border-cm-academic/30"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-cm-academic/10 mb-6">
            <GraduationCap className="w-12 h-12 text-cm-academic animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bebas text-gray-800 mb-4">
            🚧 Em Construção 🚧
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Estamos trabalhando para trazer uma experiência completa de busca acadêmica. 
            Em breve você poderá buscar por:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="p-6 rounded-2xl bg-cm-academic/5 border border-cm-academic/20">
              <BookOpen className="w-8 h-8 text-cm-academic mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Disciplinas</h3>
              <p className="text-sm text-gray-600">Catálogo completo de disciplinas do ciclo avançado</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-cm-academic/5 border border-cm-academic/20">
              <Users className="w-8 h-8 text-cm-academic mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Usuários</h3>
              <p className="text-sm text-gray-600">Encontre colegas e forme grupos de estudo</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-cm-academic/5 border border-cm-academic/20">
              <GraduationCap className="w-8 h-8 text-cm-academic mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Recursos</h3>
              <p className="text-sm text-gray-600">Materiais e recursos de apoio ao estudo</p>
            </div>
          </div>

          <Button asChild className="bg-cm-academic hover:bg-cm-academic/90 text-white">
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AcademicSearchPage;
