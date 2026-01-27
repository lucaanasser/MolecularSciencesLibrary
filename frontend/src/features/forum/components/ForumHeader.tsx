import React from "react";

const ForumHeader: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-cyan-50 via-white to-teal-50 border-b-2 border-academic-blue/20 py-8 px-6 overflow-hidden">
      {/* Padrão de fundo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-academic-blue rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-40 h-40 bg-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-teal-300 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Logo estilo Stack Overflow */}
            <div className="flex items-center gap-3">
              {/* Ícone de pilha/stack */}
              <svg
                width="40"
                height="46"
                viewBox="0 0 32 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0 drop-shadow-sm"
              >
                {/* Camadas empilhadas coloridas: Vermelho, Laranja, Amarelo, Verde, Azul */}
                <path
                  d="M26 33v-9h4v13H0V24h4v9h22z"
                  fill="#64748b"
                />
                <path
                  d="M23.5 26H6v4h17.5v-4z"
                  fill="#EF4444"
                />
                <path
                  d="M6.5 21.5l17.1 3.6.8-4-17.1-3.5-.8 3.9z"
                  fill="#F97316"
                />
                <path
                  d="M8.3 15.1l15.8 7.4 1.7-3.6-15.8-7.4-1.7 3.6z"
                  fill="#FBBF24"
                />
                <path
                  d="M12.1 9.1l13.2 11 2.5-3-13.2-11-2.5 3z"
                  fill="#10B981"
                />
                <path
                  d="M18.4 3.5l8.8 14.6 3.4-2-8.8-14.7-3.4 2.1z"
                  fill="#3B82F6"
                />
              </svg>
              {/* Texto do logo */}
              <div className="flex flex-col">
                <span className="text-3xl font-semibold text-gray-800 leading-tight">
                  molec<span className="font-bold text-academic-blue">overflow</span>
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  Where students <s className="text-gray-400">panic</s> learn together
                </span>
              </div>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-academic-blue">1.2k</div>
              <div className="text-gray-600 text-xs">perguntas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-academic-blue">3.4k</div>
              <div className="text-gray-600 text-xs">respostas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-academic-blue">87%</div>
              <div className="text-gray-600 text-xs">respondidas</div>
            </div>
          </div>
        </div>
        
        {/* Subtítulo */}
        <p className="mt-4 text-gray-700 text-sm max-w-3xl">
          Tire dúvidas sobre o curso, créditos, projetos, orientadores e muito mais.
          Uma comunidade onde <em className="text-academic-blue font-medium">todas</em> as perguntas são bem-vindas.
        </p>
      </div>
    </div>
  );
};

export default ForumHeader;
