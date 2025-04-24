import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Search, User } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative bg-white pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bebas mb-6">Biblioteca CM</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore nossa coleção de conhecimento interdisciplinar em Ciências Moleculares
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              "bg-[#eb0000]",
              "bg-[#ff6300]",
              "bg-[#ffcf00]",
              "bg-[#00c80e]",
              "bg-[#008cff]",
            ].map((color, index) => (
              <div
                key={index}
                className={`${color} rounded-lg aspect-square transform transition-all duration-700 hover:scale-105 animate-float`}
                style={{
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Curved transition */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-24"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M600,112C268.63,112,0,44.84,0,0v120H1200V0C1200,44.84,931.37,112,600,112z"
              className="fill-cm-bg"
            ></path>
          </svg>
        </div>
      </div>

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
