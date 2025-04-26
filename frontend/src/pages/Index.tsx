import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Search, User } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-white">
        {/* Geometric Background */}
        <div className="absolute inset-0 bg-cm-bg">
          <motion.div className="absolute inset-0 overflow-hidden">
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
              className="absolute h-80 w-80 -left-32 top-16 bg-cm-blue rounded-full opacity-25"
            />
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, 250]) }}
              className="absolute h-56 w-56 -right-24 top-24 bg-cm-red rounded-full opacity-25"
            />
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, -180]) }}
              className="absolute h-40 w-40 -left-20 bottom-24 bg-cm-orange rounded-full opacity-25"
            />
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, 220]) }}
              className="absolute h-64 w-64 -right-32 bottom-16 bg-cm-green rounded-full opacity-25"
            />
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, -160]) }}
              className="absolute h-32 w-32 left-1/4 top-1/4 bg-cm-yellow rounded-full opacity-25"
            />
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, 190]) }}
              className="absolute h-52 w-52 right-1/4 bottom-1/4 bg-cm-blue rounded-full opacity-25"
            />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="min-h-[90vh] flex items-center">
            <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Logo */}
              <motion.div 
                style={{ y: translateY }}
                className="order-2 md:order-1 flex justify-center"
              >
                <img 
                  src="/images/logoCM.png"
                  alt="Ciências Moleculares"
                  className="w-72 h-auto md:w-96"
                />
              </motion.div>

              {/* Right Column - Content */}
              <motion.div
                style={{ y: translateY }}
                className="order-1 md:order-2 flex flex-col items-center md:items-start text-center md:text-left gap-6"
              >
                
                <p className="text-lg md:text-xl text-gray-700 max-w-md mb-4">
                  Explore nossa biblioteca digital unificada.<br />
                  Todo o conhecimento do curso de <span className="font-semibold text-cm-green">Ciências Moleculares</span> em um só lugar.
                </p>
                <div className="flex gap-4 mb-6">
                  <Button asChild className="bg-cm-blue hover:bg-cm-blue/90 text-white rounded-2xl px-6 py-3 text-lg font-semibold shadow-lg">
                    <Link to="/search">Explorar Acervo</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-cm-blue text-cm-blue rounded-2xl px-6 py-3 text-lg font-semibold shadow-lg bg-white">
                    <Link to="/virtual-shelf">Estante Virtual</Link>
                  </Button>
                </div>
                {/* Colorful Stats */}
                <div className="flex gap-8 mt-2">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-cm-blue">1000+</span>
                    <span className="text-xs text-gray-500">Livros</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-cm-red">24/7</span>
                    <span className="text-xs text-gray-500">Acesso</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-cm-green">6</span>
                    <span className="text-xs text-gray-500">Áreas</span>
                  </div>
                </div>
                {/* Decorative color bars */}
                <div className="flex gap-2 mt-6">
                  <div className="h-2 w-8 rounded bg-cm-red"></div>
                  <div className="h-2 w-8 rounded bg-cm-yellow"></div>
                  <div className="h-2 w-8 rounded bg-cm-green"></div>
                  <div className="h-2 w-8 rounded bg-cm-blue"></div>
                  <div className="h-2 w-8 rounded bg-cm-orange"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <div className="py-16 bg-cm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bebas text-center mb-12">Recursos da Biblioteca</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md">
              <div className="h-16 w-16 rounded-full bg-cm-red/10 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-cm-red" />
              </div>
              <h3 className="text-xl font-bebas mb-2">Estante Virtual</h3>
              <p className="text-gray-600">
                Navegue por nossa coleção através de uma interface visual inspirada 
                na Library of Babel.
              </p>
              <Button asChild variant="link" className="mt-4 text-cm-red">
                <Link to="/virtual-shelf">Explorar Estante</Link>
              </Button>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md">
              <div className="h-16 w-16 rounded-full bg-cm-blue/10 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-cm-blue" />
              </div>
              <h3 className="text-xl font-bebas mb-2">Busca Avançada</h3>
              <p className="text-gray-600">
                Encontre exatamente o que precisa com nossa busca por título, autor, 
                categoria ou palavra-chave.
              </p>
              <Button asChild variant="link" className="mt-4 text-cm-blue">
                <Link to="/search">Buscar Livros</Link>
              </Button>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md">
              <div className="h-16 w-16 rounded-full bg-cm-green/10 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-cm-green" />
              </div>
              <h3 className="text-xl font-bebas mb-2">Área do Usuário</h3>
              <p className="text-gray-600">
                Acesse seu histórico de empréstimos, verifique datas de devolução e 
                receba notificações.
              </p>
              <Button asChild variant="link" className="mt-4 text-cm-green">
                <Link to="/login">Fazer Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* About Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bebas mb-4">
                Ciências Moleculares para todos
              </h2>
              <p className="text-gray-600 mb-4">
                O Curso de Ciências Moleculares oferece interdisciplinaridade e inovação em uma comunidade de 
                estudantes motivada a descobrir conexões entre os muitos saberes da ciência. 
              </p>
              <p className="text-gray-600 mb-6">
                Nossa biblioteca é um ponto de encontro do saber, onde alunos e professores podem 
                explorar diferentes áreas do conhecimento.
              </p>
              <Button asChild className="bg-cm-orange hover:bg-cm-orange/90 rounded-2xl">
                <Link to="/search">Explorar Acervo</Link>
              </Button>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
              <img 
                src="/images/prateleira.png" 
                alt="Ciências Moleculares" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="py-16 bg-cm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bebas text-center mb-12">Explore por Categoria</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Física", "Química", "Biologia", "Matemática", "Computação", "Variados"].map(
              (category, index) => (
                <div 
                  key={category} 
                  className={`
                    p-6 rounded-2xl shadow-md text-center cursor-pointer transition-transform hover:scale-105
                    ${index === 0 ? "bg-cm-red text-white" : ""}
                    ${index === 1 ? "bg-cm-orange text-white" : ""}
                    ${index === 2 ? "bg-cm-green text-white" : ""}
                    ${index === 3 ? "bg-cm-yellow text-gray-900" : ""}
                    ${index === 4 ? "bg-cm-blue text-white" : ""}
                    ${index === 5 ? "bg-gray-700 text-white" : ""}
                  `}
                >
                  <h3 className="text-xl font-bebas">{category}</h3>
                  <p className="text-sm mt-1 opacity-80">Explorar</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
