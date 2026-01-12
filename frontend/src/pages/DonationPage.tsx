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

// Função para embaralhar um array
function shuffleArray<T>(array: T[]): T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function SupportersCarousel() {
	const [displaySupporters, setDisplaySupporters] = useState<string[]>([]);
	const [index, setIndex] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Embaralha os apoiadores antes de criar a lista extendida
		const shuffled = shuffleArray(supporters);
		const extended = [...shuffled, ...shuffled.slice(0, 4)];
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
type Tab = 'Críticas e sugestões' | 'Sugestões de livros' | 'Doação de exemplares';

interface CardData {
  title: string;
  description: string;
  image: string; // Caminho da imagem para cada tab
  imageAlt?: string;
}

const cardContent: Record<Tab, CardData> = {
  'Críticas e sugestões': {
    title: 'Envie seu feedback',
    description: 'Ajude-nos a melhorar! Compartilhe suas sugestões, críticas ou ideias para tornar nossa biblioteca ainda melhor.',
    image: '/images/feedback.png',
    imageAlt: 'Feedback'
  },
  'Sugestões de livros': {
    title: 'Sugira um livro',
    description: 'Você acha que o nosso acervo está incompleto? Compartilhe títulos que você considere importantes para a comunidade.',
    image: '/images/suggestion.png',
    imageAlt: 'Sugestão de livros'
  },
  'Doação de exemplares': {
    title: 'Doe um livro',
    description: 'Contribua para a disseminação do conhecimento. Doar livros em bom estado ajuda a expandir nosso alcance e recursos.',
    image: '/images/donation.png',
    imageAlt: 'Doação de exemplares'
  }
};

// Novo componente de formulário reutilizável para as tabs
const TabForm: React.FC<{ tab: Tab }> = ({ tab }) => {
  // Define assunto e placeholder conforme a tab
  let subjectPrefix = '';
  let placeholder = '';
  switch (tab) {
    case 'Críticas e sugestões':
      subjectPrefix = 'Críticas e sugestões';
      placeholder = 'Compartilhe suas ideias, sugestões ou feedback...';
      break;
    case 'Sugestões de livros':
      subjectPrefix = 'Sugestão de livros';
      placeholder = 'Indique o(s) livro(s) que gostaria de sugerir...';
      break;
    case 'Doação de exemplares':
      subjectPrefix = 'Doação de exemplares';
      placeholder = 'Coloque aqui quaisquer outras informações sobre o livro que deseja doar...';
      break;
  }

  // Campos extras para triagem de doação
  const isDonation = tab === 'Doação de exemplares';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form className="space-y-4 mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const email = formData.get("email") as string;
        let body = "";
        if (isDonation) {
          body =
            `Título: ${formData.get("titulo")}\n` +
            `Autor: ${formData.get("autor")}\n` +
            `Área: ${formData.get("area")}\n` +
            `Estado: ${formData.get("estado")}\n` +
            `Motivo: ${formData.get("motivo")}\n` +
            `Mensagem: ${formData.get("message")}`;
        } else {
          body = `${formData.get("message")}`;
        }
        try {
          const res = await fetch("/api/forms/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              subject: subjectPrefix,
              message: body,
              type: tab,
            }),
          });
          if (!res.ok) {
            throw new Error("Erro ao enviar. Tente novamente mais tarde.");
          }
          setSuccess("Mensagem enviada! Você receberá um email de confirmação.");
          form.reset();
        } catch (err: any) {
          setError("Erro ao enviar. Tente novamente mais tarde.");
        } finally {
          setLoading(false);
        }
      }}
    >
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
      {/* Campos extras para doação */}
      {isDonation && (
        <>
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título do livro
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cm-purple focus:border-transparent text-sm"
              placeholder="Ex: Princípios de Química"
            />
          </div>
          <div>
            <label htmlFor="autor" className="block text-sm font-medium text-gray-700 mb-2">
              Autor
            </label>
            <input
              type="text"
              id="autor"
              name="autor"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cm-purple focus:border-transparent text-sm"
              placeholder="Ex: John Smith"
            />
          </div>
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
              Área
            </label>
            <input
              type="text"
              id="area"
              name="area"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cm-purple focus:border-transparent text-sm"
              placeholder="Ex: Química, Biologia, Física..."
            />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado do livro
            </label>
            <select
              id="estado"
              name="estado"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cm-purple focus:border-transparent text-sm"
              defaultValue=""
            >
              <option value="" disabled>Selecione o estado</option>
              <option value="novo">Novo</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="danificado">Danificado</option>
            </select>
          </div>
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da doação
            </label>
            <textarea
              id="motivo"
              name="motivo"
              rows={2}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cm-purple focus:border-transparent resize-none text-sm"
              placeholder="O que esse livro pode agregar ao acervo do CM?"
            />
          </div>
        </>
      )}
      <div>
        <label htmlFor={`message-${tab}`} className="block text-sm font-medium text-gray-700 mb-2">
          Mensagem
        </label>
        <textarea
          id={`message-${tab}`}
          name="message"
          rows={4}
          required={!isDonation}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cm-purple focus:border-transparent resize-none text-sm"
          placeholder={placeholder}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-cm-purple hover:bg-cm-purple/80 text-cm-bg rounded-xl font-bold py-3 flex items-center justify-center gap-2"
        disabled={loading}
      >
        <Send className="h-4 w-4" />
        {loading ? "Enviando..." : "ENVIAR"}
      </Button>
      {success && <div className="text-green-600 mt-2">{success}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
};

const CardTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Críticas e sugestões');
  const data = cardContent[activeTab];

  return (
    <div className="w-full max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8">
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
      <div className="border border-gray-200 rounded-b-2xl p-6 flex flex-col md:flex-row justify-between items-start bg-cm-bg shadow-md">
        <div className="w-full md:w-[60%] md:pr-6">
          <h2 className="text-2xl mb-3">{data.title}</h2>
          <p className="text-gray-700 mb-4">{data.description}</p>
          {/* Formulário específico da tab */}
          <TabForm tab={activeTab} />
        </div>
        <div className="flex flex-col items-center mt-6 md:mt-0 w-full md:w-[40%]">
          <img
            src={data.image}
            alt={data.imageAlt}
            className="w-full max-w-[280px] md:max-w-none object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const DonationPage = () => (
	<div className="min-h-screen flex flex-col">
		<Navigation />

		{/* Texto introdutório sobre formas de ajudar */}
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-4xl font-bebas mb-8">Ajude a Biblioteca</h2>
			<p className="text-lg text-black">
				A Biblioteca conta com o apoio da comunidade para crescer e se manter relevante. Você pode contribuir enviando feedbacks, sugerindo novos livros, doando exemplares ou apoiando financeiramente. Toda ajuda é bem-vinda!
			</p>
		</div>
		
		<CardTabs />

		{/* Feature que pode ser implementada no futuro: Seção de apoio financeiro com doações */}
		{/*
    <section className="relative py-40 mt-20 mb-20 bg-cm-purple">
      <div className="absolute top-0 left-0 w-full h-24 bg-cm-bg transform -skew-y-3 origin-top-left"></div>
      <div className="absolute bottom-0 right-0 w-full h-24 bg-cm-bg transform -skew-y-3 origin-bottom-right"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl text-cm-bg mb-4">Apoio financeiro</h2>
        <p className="text-lg text-cm-bg mb-8">
          Sua contribuição é fundamental para a preservação do acervo.
        </p>
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/qr-donation.png"
            alt="QR Code para doação"
            className="w-64 h-64 rounded-xl border border-gray-300 shadow-lg"
          />
          <span className="text-cm-bg mt-2 font-semibold">Escaneie para doar</span>
        </div>
        <Button
          className="w-full max-w-xs bg-cm-bg hover:bg-gray-200 text-cm-purple rounded-xl font-bold py-3 flex items-center justify-center gap-2 shadow-md mx-auto"
          onClick={() => window.location.href = "/donate"}
        >
          <Gift className="h-4 w-4" />
          Ou clique aqui para doar
        </Button>
      </div>
    </section>
		*/}

		{/* Feature que pode ser implementada no futuro: Roleta com nomes dos apoiadores */}
		{/*
		<div className="mt-18 flex flex-col items-center mb-24">
			<h2 className="text-5xl text-center mb-8">
				{supporters.length}+ pessoas já apoiaram a Biblioteca! 
			</h2>
			<SupportersCarousel />
		</div>
		*/}

		<div className="mb-24"></div>
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
