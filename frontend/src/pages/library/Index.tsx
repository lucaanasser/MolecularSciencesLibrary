import { BookOpen, Search, User } from "lucide-react";
import { TextSection, StatsSection, FeatureSection, HeroSection, AreasHeroText, useLibraryStats } from "@/features/index";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";


const Index = () => {
  // Log de início de renderização da página inicial
  logger.info("🔵 [Index] Renderizando página inicial");
  const { stats, loading: loadingStats, error: statsError } = useLibraryStats();
  return (
    <>
      <HeroSection variant="library">
        <h1><AreasHeroText /></h1>
        <p className="prose-lg">
          Explore nosso acervo de livros, cuidadosamente selecionado para apoiar seu aprendizado e progresso durante o curso de Ciências Moleculares.
        </p>
        <Button variant="primary" size="lg" className="prose-lg" asChild>
          <a href="/buscar">
            Explorar Acervo
          </a>
        </Button>
      </HeroSection>

      <TextSection
        title="Biblioteca: um espaço que cresce com você"
        paragraphs={[
          "A biblioteca é um lugar de encontros e descobertas. Aqui, cada livro, cada conversa e cada pesquisa ajudam a abrir caminhos para novas ideias e novas possibilidades.",
          "Mas para que esse espaço continue vivo e acessível a todos, precisamos de cuidado coletivo. Apoiar a biblioteca é investir no futuro do conhecimento e na oportunidade de aprender juntos."
        ]}
        buttonText="Ajude a biblioteca"
        buttonLink="/ajude"
        imageSrc="/images/prateleira.png"
        imageAlt="Ciências Moleculares"
        reverse={true}
      />
      
      <StatsSection
        stats={stats}
        order={["users", "subareas", "books"]}
        title="A biblioteca em números"
        loading={loadingStats}
        error={statsError}
        bgClass="bg-library-purple"
        textClass="text-white"
      />

      <TextSection
        title="Conheça melhor nossos números"
        paragraphs={[
          "Acreditamos que a transparência fortalece a confiança e o engajamento da comunidade. Por isso, disponibilizamos dados e estatísticas atualizadas sobre o funcionamento da biblioteca.",
          "Confira gráficos detalhados sobre empréstimos, acervo e usuários. Todos os dados são apresentados de forma agregada, sem expor informações pessoais."
        ]}
        buttonText="Biblioteca em Dados"
        buttonLink="/transparencia"
        imageSrc="/images/image.png"
        imageAlt=""
        reverse={false}
      />
      
      <FeatureSection
        title="Recursos do site"
        cards={[
          {
            icon: <Search className="h-10 w-10 text-white" />,
            title: "Encontre livros no acervo",
            description: "Busque rapidamente por autor, título, tema ou área e descubra tudo o que a biblioteca oferece.",
            buttonText: "Buscar Livros",
            buttonLink: "/buscar",
            colorClass: "bg-cm-red"
          },
          {
            icon: <User className="h-10 w-10 text-white" />,
            title: "Acompanhe seus empréstimos",
            description: "Acesse sua área pessoal para renovar livros e consultar prazos de forma simples e rápida.",
            buttonText: "Fazer Login",
            buttonLink: "/entrar",
            colorClass: "bg-cm-blue"
          },
          {
            icon: <BookOpen className="h-10 w-10 text-white" />,
            title: "Explore a estante virtual",
            description: "Navegue pelo acervo de maneira visual e interativa, como se estivesse dentro da biblioteca.",
            buttonText: "Explorar Estante",
            buttonLink: "/estante-virtual",
            colorClass: "bg-cm-green"
          }
        ]}
        columns='md:grid-cols-3 md:gap-8 lg:gap-12'
      />
    </>
  );
};

export default Index;
