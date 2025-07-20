import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookHeart, Mail, Gift, PiggyBank, Lightbulb, MessageCircle, ShoppingBag, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const supporters = [
	"Ana Clara",
	"João Pedro",
	"Marina Souza",
	"Lucas Lima",
	"Beatriz Alves",
	"Felipe Costa",
	"Gabriela Rocha",
	"Rafael Martins",
	"Juliana Dias",
	"Vinícius Silva",
];

function SupportersCarousel() {
	const [displaySupporters, setDisplaySupporters] = useState<string[]>([]);
	const [index, setIndex] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Cria uma lista extendida para rotação suave
		const extended = [...supporters, ...supporters.slice(0, 4)];
		setDisplaySupporters(extended);
	}, []);

	useEffect(() => {
		const timer = setInterval(() => {
			setIndex((i) => i + 1);
		}, 2000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!listRef.current) return;
		listRef.current.style.transition = "transform 0.5s ease-in-out";
		listRef.current.style.transform = `translateY(-${index * 2.2}rem)`;

		if (index === supporters.length) {
			// Após a transição, reseta instantaneamente para o início, sem animação
			const transitionEnd = () => {
				if (!listRef.current) return;
				listRef.current.removeEventListener("transitionend", transitionEnd);
				listRef.current.style.transition = "none";
				listRef.current.style.transform = `translateY(0)`;
				// Força reflow para garantir que o browser aplique o transform sem transição
				// eslint-disable-next-line @typescript-eslint/no-unused-expressions
				listRef.current.offsetHeight;
				setIndex(0);
				// Restaura a transição para os próximos movimentos
				listRef.current.style.transition = "transform 0.5s ease-in-out";
			};
			listRef.current.addEventListener("transitionend", transitionEnd);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [index]);

	return (
		<div className="text-center text-xl md:text-2xl font-semibold flex flex-wrap justify-center items-center gap-2">
			<span className="text-black">Obrigado</span>
			<div
				className="overflow-hidden h-[12rem] relative"
				style={{ width: "auto", minWidth: "12rem" }}
			>
				<div
					ref={listRef}
					className="transition-transform duration-500 ease-in-out"
				>
					{displaySupporters.map((supporter, i) => (
						<div
							key={i}
							className={`h-[2.2rem] flex items-center justify-center font-bold ${
								i === index + 2 ? "text-cm-purple" : "text-gray-400"
							}`}
						>
							{supporter}
						</div>
					))}
				</div>
				<div className="absolute top-0 h-[4rem] w-full bg-gradient-to-b from-cm-bg to-transparent pointer-events-none" />
				<div className="absolute bottom-0 h-[4rem] w-full bg-gradient-to-t from-cm-bg to-transparent pointer-events-none" />
			</div>
			<span className="text-black">pelo apoio!</span>
		</div>
	);
}

// CardTabs Section (adaptado do prompt)
import React from "react";
type Tab = 'Feedback' | 'Sugestões de livros' | 'Doação de Livros';

interface CardData {
  title: string;
  description: string;
  image: string; // Caminho da imagem para cada tab
  imageAlt?: string;
}

const cardContent: Record<Tab, CardData> = {
  'Feedback': {
    title: 'Envie seu feedback',
    description: 'Ajude-nos a melhorar! Compartilhe suas sugestões, críticas ou ideias para tornar nossa biblioteca ainda melhor.',
    image: '/images/feedback.png',
    imageAlt: 'Feedback'
  },
  'Sugestões de livros': {
    title: 'Sugira um livro',
    description: 'Compartilhe títulos que você considera valiosos para enriquecer nosso acervo e oferecer novas perspectivas à comunidade.',
    image: '/images/suggestion.png',
    imageAlt: 'Sugestão de livros'
  },
  'Doação de Livros': {
    title: 'Doe um livro',
    description: 'Contribua para a disseminação do conhecimento. Doar livros em bom estado ajuda a expandir nosso alcance e recursos.',
    image: '/images/donation.png',
    imageAlt: 'Doação de livros'
  }
};

// Novo componente de formulário reutilizável para as tabs
const TabForm: React.FC<{ tab: Tab }> = ({ tab }) => {
  // Define assunto e placeholder conforme a tab
  let subjectPrefix = '';
  let placeholder = '';
  switch (tab) {
    case 'Feedback':
      subjectPrefix = 'Feedback';
      placeholder = 'Compartilhe suas ideias, sugestões ou feedback...';
      break;
    case 'Sugestões de livros':
      subjectPrefix = 'Sugestão de Livros';
      placeholder = 'Indique o(s) livro(s) que gostaria de sugerir...';
      break;
    case 'Doação de Livros':
      subjectPrefix = 'Doação de Livros';
      placeholder = 'Descreva os livros que deseja doar ou tire suas dúvidas...';
      break;
  }

  return (
    <form className="space-y-4 mt-4">
      <div>
        <label htmlFor={`email-${tab}`} className="block text-sm font-medium text-gray-700 mb-2">
          Seu email
        </label>
        <input
          type="email"
          id={`email-${tab}`}
          name="email"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cm-purple focus:border-transparent text-sm"
          placeholder="seu.email@exemplo.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assunto
        </label>
        <input
          type="text"
          value={subjectPrefix}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
          tabIndex={-1}
        />
      </div>
      <div>
        <label htmlFor={`message-${tab}`} className="block text-sm font-medium text-gray-700 mb-2">
          Mensagem
        </label>
        <textarea
          id={`message-${tab}`}
          name="message"
          rows={4}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cm-purple focus:border-transparent resize-none text-sm"
          placeholder={placeholder}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-cm-purple hover:bg-cm-purple/80 text-cm-bg rounded-xl font-bold py-3 flex items-center justify-center gap-2"
        onClick={e => {
          e.preventDefault();
          const form = e.currentTarget.form;
          if (form) {
            const formData = new FormData(form);
            const email = formData.get('email');
            const message = formData.get('message');
            const mailtoLink = `mailto:biblioteca.cm@usp.br?subject=${encodeURIComponent(subjectPrefix)}&body=${encodeURIComponent(`De: ${email}\n\n${message}`)}`;
            window.location.href = mailtoLink;
          }
        }}
      >
        <Send className="h-4 w-4" />
        ENVIAR
      </Button>
    </form>
  );
};

const CardTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Feedback');
  const data = cardContent[activeTab];

  return (
    <div className="w-full max-w-7xl mx-auto my-16 px-4 sm:px-6 lg:px-8">
      {/* Abas alinhadas à esquerda, estilo mais próximo dos cards */}
      <div className="flex border-b border-gray-200 mb-0">
        {(Object.keys(cardContent) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-5 font-semibold text-xl transition-colors border-b-2 -mb-px
              ${
                activeTab === tab
                  ? 'text-cm-bg border-cm-purple bg-cm-purple'
                  : 'text-gray-600 border-transparent hover:text-cm-purple hover:bg-gray-100'
              }
              rounded-t-xl
            `}
            style={{ outline: "none" }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="border border-gray-200 rounded-b-2xl p-8 flex flex-col md:flex-row justify-between items-center bg-cm-bg shadow-md">
        <div className="w-full md:w-[60%] md:pr-8">
          <h2 className="text-2xl mb-3">{data.title}</h2>
          <p className="text-gray-700 mb-4">{data.description}</p>
          {/* Formulário específico da tab */}
          <TabForm tab={activeTab} />
        </div>
        <div className="flex flex-col items-center mt-6 md:mt-0 w-full md:w-[40%]">
          <img
            src={data.image}
            alt={data.imageAlt}
            className="w-full max-w-xs md:max-w-none object-contain"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

const DonationPage = () => (
	<div className="min-h-screen flex flex-col">
		<Navigation />
		
		<CardTabs />

		{/* Texto com número de apoiadores e incentivo */}
		<div className="mt-18 flex flex-col items-center mb-24">
			<h2 className="text-5xl text-center mb-8">
				{supporters.length}+ pessoas já apoiaram a Biblioteca! 
			</h2>
			
			{/* Roleta de agradecimento aos apoiadores movida para o final */}
			<SupportersCarousel />
		</div>
		<Footer />
	</div>
);

// Animations para decoração cartunesca
const style = `
@keyframes spin-slow { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
.animate-spin-slow { animation: spin-slow 6s linear infinite; }
@keyframes wiggle { 0%, 100% { transform: rotate(-8deg);} 50% { transform: rotate(8deg);} }
.animate-wiggle { animation: wiggle 1.2s ease-in-out infinite; }
`;

const StyleInjector = () => {
	useEffect(() => {
		const styleTag = document.createElement("style");
		styleTag.innerHTML = style;
		document.head.appendChild(styleTag);
		return () => {
			document.head.removeChild(styleTag);
		};
	}, []);
	return null;
};

export default function DonationPageWithStyle() {
	return (
		<>
			<StyleInjector />
			<DonationPage />
		</>
	);
}
