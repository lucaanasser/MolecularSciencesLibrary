import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Search, Users, BookOpen, GraduationCap, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchCategory = "disciplinas" | "usuarios" | "recursos";

/**
 * Página de busca do modo acadêmico.
 * Permite buscar disciplinas, usuários e recursos acadêmicos.
 */
const AcademicSearchPage: React.FC = () => {
  console.log("🔵 [AcademicSearchPage] Renderizando página de busca acadêmica");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("disciplinas");
  const [showResults, setShowResults] = useState(false);

  // Mock de resultados (substituir por API real)
  const mockResults = {
    disciplinas: searchQuery.length > 0 ? [
      { id: 1, nome: "Cálculo I", codigo: "MAT0111", instituto: "IME", creditos: 6 },
      { id: 2, nome: "Física I", codigo: "4302111", instituto: "IF", creditos: 4 },
      { id: 3, nome: "Química Geral", codigo: "QFL0230", instituto: "IQ", creditos: 4 },
    ] : [],
    usuarios: searchQuery.length > 0 ? [
      { id: 1, nome: "Ana Silva", turma: "Turma 33", curso: "CM" },
      { id: 2, nome: "João Santos", turma: "Turma 34", curso: "CM" },
    ] : [],
    recursos: searchQuery.length > 0 ? [
      { id: 1, titulo: "Apostila de Cálculo", tipo: "PDF", disciplina: "MAT0111" },
      { id: 2, titulo: "Lista de Exercícios - Física", tipo: "PDF", disciplina: "4302111" },
    ] : [],
  };

  useEffect(() => {
    setShowResults(searchQuery.length > 0);
  }, [searchQuery]);

  const categories = [
    { id: "disciplinas" as SearchCategory, label: "Disciplinas", icon: BookOpen, color: "text-cm-academic" },
    { id: "usuarios" as SearchCategory, label: "Usuários", icon: Users, color: "text-cm-blue" },
    { id: "recursos" as SearchCategory, label: "Recursos", icon: GraduationCap, color: "text-cm-green" },
  ];

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cm-academic/5 via-white to-cm-bg">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl">
          {/* Logo/Título Estilizado - Inspirado no Molecoogle */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-1">
              <span className="text-7xl font-bold text-[#4285F4]">M</span>
              <span className="text-7xl font-bold text-[#EA4335]">o</span>
              <span className="text-7xl font-bold text-[#FBBC05]">l</span>
              <span className="text-7xl font-bold text-[#4285F4]">e</span>
              <span className="text-7xl font-bold text-[#34A853]">c</span>
              <span className="text-7xl font-bold text-[#EA4335]">o</span>
              <span className="text-7xl font-bold text-[#4285F4]">o</span>
              <span className="text-7xl font-bold text-[#FBBC05]">g</span>
              <span className="text-7xl font-bold text-[#34A853]">l</span>
              <span className="text-7xl font-bold text-[#EA4335]">e</span>
            </div>
          </motion.div>

          {/* Search Box Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            {/* Abas de Categoria */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
                      "border-2 font-medium",
                      isActive
                        ? "bg-cm-academic text-white border-cm-academic shadow-lg scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:border-cm-academic/50 hover:shadow-md"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Campo de Busca */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-6 w-6 h-6 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Buscar ${categories.find(c => c.id === activeCategory)?.label.toLowerCase()}...`}
                  className="w-full pl-14 pr-14 py-7 text-lg rounded-full border-2 border-gray-200 focus:border-cm-academic focus:ring-4 focus:ring-cm-academic/20 shadow-lg transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Resultados */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
              >
                {/* Header dos Resultados */}
                <div className="bg-gradient-to-r from-cm-academic to-cm-academic-light px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                      {React.createElement(categories.find(c => c.id === activeCategory)?.icon || Search, {
                        className: "w-5 h-5"
                      })}
                      Resultados de {categories.find(c => c.id === activeCategory)?.label}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>

                {/* Lista de Resultados */}
                <div className="divide-y divide-gray-100">
                  {activeCategory === "disciplinas" && mockResults.disciplinas.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500">
                      Nenhuma disciplina encontrada. Tente outra busca.
                    </div>
                  )}
                  
                  {activeCategory === "disciplinas" && mockResults.disciplinas.map((disc) => (
                    <div
                      key={disc.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg mb-1">
                            {disc.nome}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {disc.codigo} • {disc.instituto} • {disc.creditos} créditos
                          </p>
                        </div>
                        <Button size="sm" className="bg-cm-academic hover:bg-cm-academic/90">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}

                  {activeCategory === "usuarios" && mockResults.usuarios.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500">
                      Nenhum usuário encontrado. Tente outra busca.
                    </div>
                  )}
                  
                  {activeCategory === "usuarios" && mockResults.usuarios.map((user) => (
                    <div
                      key={user.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-cm-blue/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-cm-blue" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{user.nome}</h3>
                            <p className="text-sm text-gray-500">{user.turma} • {user.curso}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Ver Perfil
                        </Button>
                      </div>
                    </div>
                  ))}

                  {activeCategory === "recursos" && mockResults.recursos.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500">
                      Nenhum recurso encontrado. Tente outra busca.
                    </div>
                  )}
                  
                  {activeCategory === "recursos" && mockResults.recursos.map((rec) => (
                    <div
                      key={rec.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded bg-cm-green/20 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-cm-green" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{rec.titulo}</h3>
                            <p className="text-sm text-gray-500">{rec.tipo} • {rec.disciplina}</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-cm-green hover:bg-cm-green/90">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sugestões quando não há busca */}
          {!showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-12"
            >
              <p className="text-gray-500 mb-6">Ou explore por:</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {["Cálculo", "Física", "Química", "Programação", "Biologia"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full hover:border-cm-academic hover:text-cm-academic transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AcademicSearchPage;
