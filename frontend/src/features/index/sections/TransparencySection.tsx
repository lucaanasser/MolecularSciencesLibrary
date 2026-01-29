import React from "react";
import { TrendingUp } from "lucide-react";

export interface TransparencySectionProps {
  className?: string;
}

export const TransparencySection: React.FC<TransparencySectionProps> = ({ className }) => (
  <section className={className}>
    <div className="content-container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative rounded-2xl overflow-hidden flex items-center justify-center bg-gray-100 p-12">
          <TrendingUp className="h-48 w-48 text-cm-blue opacity-20" />
        </div>
        <div>
          <h3>
            Conheça melhor nossos números
          </h3>
          <p>
            Acreditamos que a transparência fortalece a confiança e o engajamento da comunidade.
            Por isso, disponibilizamos dados e estatísticas atualizadas sobre o funcionamento da biblioteca.
          </p>
          <p>
            Confira gráficos detalhados sobre empréstimos, acervo e usuários.
            Todos os dados são apresentados de forma agregada, sem expor informações pessoais.
          </p>
          <a className="primary-btn" href="/transparencia">
            Biblioteca em Dados
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default TransparencySection;
