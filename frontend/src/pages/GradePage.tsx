import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar, Clock, BookOpen, GraduationCap, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Página da Grade Interativa do modo acadêmico.
 * Permite visualizar e montar a grade de disciplinas.
 */
const GradePage: React.FC = () => {
  console.log("🔵 [GradePage] Renderizando página da grade interativa");

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
            <Grid3X3 className="w-10 h-10 text-cm-academic" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bebas text-cm-academic mb-4">
            Grade Interativa
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Monte sua grade de horários de forma visual e organize suas disciplinas do Ciclo Avançado.
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
            <Calendar className="w-12 h-12 text-cm-academic animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bebas text-gray-800 mb-4">
            🚧 Em Construção 🚧
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            A grade interativa está sendo desenvolvida para ajudar você a organizar 
            seu semestre no Ciclo Avançado. Funcionalidades planejadas:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="p-6 rounded-2xl bg-cm-academic/5 border border-cm-academic/20">
              <Calendar className="w-8 h-8 text-cm-academic mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Visualização</h3>
              <p className="text-sm text-gray-600">Grade visual com horários e dias da semana</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-cm-academic/5 border border-cm-academic/20">
              <BookOpen className="w-8 h-8 text-cm-academic mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Disciplinas</h3>
              <p className="text-sm text-gray-600">Arraste e solte disciplinas na grade</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-cm-academic/5 border border-cm-academic/20">
              <Clock className="w-8 h-8 text-cm-academic mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Conflitos</h3>
              <p className="text-sm text-gray-600">Detecção automática de choques de horário</p>
            </div>
          </div>

          {/* Preview da grade */}
          <div className="max-w-4xl mx-auto mb-8 opacity-50">
            <div className="grid grid-cols-6 gap-1 text-xs">
              <div className="p-2 bg-gray-100 rounded font-semibold">Horário</div>
              <div className="p-2 bg-gray-100 rounded font-semibold">Seg</div>
              <div className="p-2 bg-gray-100 rounded font-semibold">Ter</div>
              <div className="p-2 bg-gray-100 rounded font-semibold">Qua</div>
              <div className="p-2 bg-gray-100 rounded font-semibold">Qui</div>
              <div className="p-2 bg-gray-100 rounded font-semibold">Sex</div>
              
              {["08:00", "10:00", "14:00", "16:00"].map((time) => (
                <React.Fragment key={time}>
                  <div className="p-2 bg-gray-50 rounded text-gray-500">{time}</div>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <div 
                      key={`${time}-${day}`} 
                      className="p-2 bg-gray-50 rounded border border-dashed border-gray-200 min-h-[40px]"
                    />
                  ))}
                </React.Fragment>
              ))}
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

export default GradePage;
