import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookHeart, Mail, Gift, PiggyBank } from "lucide-react";
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
		listRef.current.style.transform = `translateY(-${index * 3.5}rem)`;

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
		<div className="text-center text-2xl md:text-4xl font-bold flex flex-wrap justify-center items-center gap-2">
			<span className="text-black">Obrigado</span>
			<div
				className="overflow-hidden h-[17.5rem] relative"
				style={{ width: "auto", minWidth: "12rem" }}
			>
				<div
					ref={listRef}
					className="transition-transform duration-500 ease-in-out"
				>
					{displaySupporters.map((supporter, i) => (
						<div
							key={i}
							className={`h-[3.5rem] flex items-center justify-center ${
								i === index + 2 ? "text-cm-purple" : "text-gray-400"
							}`}
						>
							{supporter}
						</div>
					))}
				</div>
				<div className="absolute top-0 h-[3.5rem] w-full bg-gradient-to-b from-cm-bg to-transparent pointer-events-none" />
				<div className="absolute bottom-0 h-[3.5rem] w-full bg-gradient-to-t from-cm-bg to-transparent pointer-events-none" />
			</div>
			<span className="text-black">pelo apoio!</span>
		</div>
	);
}

// Mock de produtos
const products = [
	{
		name: "Caneca CM",
		description: "Caneca personalizada do Ciências Moleculares. Ideal para café, chá ou decorar sua mesa.",
		price: "R$ 35,00",
		image: "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=400&q=80", // imagem ilustrativa
	},
	{
		name: "Caderno CM",
		description: "Caderno exclusivo com capa do CM. Perfeito para suas anotações e estudos.",
		price: "R$ 28,00",
		image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
	},
	{
		name: "Adesivos CM",
		description: "Kit com 5 adesivos divertidos do CM para personalizar seus itens.",
		price: "R$ 12,00",
		image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
	},
];

const bentoColors = [
	"bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100",
	"bg-gradient-to-br from-blue-100 via-cyan-50 to-green-100",
	"bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100",
];


const DonationPage = () => (
	<div className="min-h-screen flex flex-col">
		<Navigation />
		{/* Roleta de agradecimento aos apoiadores */}
		<div className="mt-24 flex flex-col items-center">
			<h2 className="text-5xl font-bold mb-4">Apoiadores</h2>
			<SupportersCarousel />
		</div>
		<section className="flex-1 bg-cm-bg py-20">
			<div className="mx-auto px-4">
				<div className="flex flex-col items-center text-center mb-12">
					<BookHeart className="w-20 h-20 text-cm-purple mb-4" />
					<h1 className="text-5xl font-bold mb-4">Ajude a Biblioteca</h1>
					<p className="text-xl text-gray-700 max-w-2xl">
						Sua colaboração é fundamental para mantermos nosso acervo atualizado e acessível a todos os estudantes do
						Ciências Moleculares. Doe livros, colabore com ideias, seja voluntário ou contribua financeiramente!
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
					{/* Card 1 - Doação de Livros */}
					<div className="flex flex-col items-center text-center p-8 bg-cm-bg rounded-2xl shadow-md border border-gray-200">
						<div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-green border-8 border-cm-bg">
							<Gift className="h-10 w-10 text-cm-bg" />
						</div>
						<h3 className="text-2xl mb-2">Doe Livros</h3>
						<p className="text-gray-600 mb-4 text-base">
							Tem livros usados ou novos que possam ajudar outros alunos? Sua doação faz a diferença!
						</p>
						<Button asChild className="w-full bg-cm-green hover:bg-cm-green/80 text-cm-bg rounded-xl font-bold py-3 mt-auto">
							<a href="mailto:biblioteca.cm@usp.br?subject=Doação de Livros - Biblioteca CM">Entrar em contato</a>
						</Button>
					</div>
					{/* Card 2 - Colabore com Ideias */}
					<div className="flex flex-col items-center text-center p-8 bg-cm-bg rounded-2xl shadow-md border border-gray-200">
						<div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-blue border-8 border-cm-bg">
							<Mail className="h-10 w-10 text-cm-bg" />
						</div>
						<h3 className="text-2xl mb-2">Colabore com Ideias</h3>
						<p className="text-gray-600 mb-4 text-base">Sugestões de melhorias, projetos ou eventos? Fale conosco!</p>
						<Button asChild className="w-full bg-cm-blue hover:bg-cm-blue/80 text-cm-bg rounded-xl font-bold py-3 mt-auto">
							<a href="mailto:biblioteca.cm@usp.br?subject=Colaboração - Biblioteca CM">Enviar sugestão</a>
						</Button>
					</div>
					{/* Card 3 - Doação Financeira */}
					<div className="flex flex-col items-center text-center p-8 bg-cm-bg rounded-2xl shadow-md border border-gray-200">
						<div className="-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-cm-purple border-8 border-cm-bg">
							<PiggyBank className="h-10 w-10 text-cm-bg" />
						</div>
						<h3 className="text-2xl mb-2">Doação Financeira</h3>
						<p className="text-gray-600 mb-4 text-base">
							Contribua financeiramente para projetos, compra de livros e melhorias na biblioteca.
						</p>
						<Button asChild className="w-full bg-cm-purple hover:bg-cm-purple/80 text-cm-bg rounded-xl font-bold py-3 mt-auto">
							<a href="mailto:biblioteca.cm@usp.br?subject=Doação Financeira - Biblioteca CM">Apoiar financeiramente</a>
						</Button>
					</div>
				</div>
				{/* Seção de Produtos à Venda - Bento Grid */}
				<div className="mb-16">
					<h2 className="text-3xl font-semibold mb-8 text-cm-purple text-center">Produtos à venda</h2>
					<div
						className="grid gap-6"
						style={{
							gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
							gridTemplateRows: "masonry",
						}}
					>
						{products.map((product, idx) => (
							<div
								key={idx}
								className={`
									relative flex flex-col items-center text-center
									rounded-3xl shadow-xl border-2 border-cm-bg/70
									${bentoColors[idx % bentoColors.length]}
									${idx === 0 ? "md:row-span-2 md:h-[370px]" : ""}
									${idx === 1 ? "md:col-span-2 md:h-[220px]" : ""}
									${idx === 2 ? "md:row-span-1 md:h-[180px]" : ""}
									transition-transform hover:scale-105
									overflow-hidden
								`}
								style={{
									padding: idx === 0 ? "2.5rem 1.5rem" : "1.5rem 1rem",
									boxShadow: "0 8px 32px 0 rgba(76, 34, 112, 0.10)",
								}}
							>
								<img
									src={product.image}
									alt={product.name}
									className={`
										rounded-2xl border-4 border-cm-bg shadow-lg mb-2
										${idx === 0 ? "w-28 h-28" : idx === 1 ? "w-20 h-20" : "w-16 h-16"}
										bg-cm-bg object-cover
									`}
									style={{
										marginTop: idx === 0 ? "1.5rem" : "2.5rem",
										marginBottom: "0.5rem",
									}}
								/>
								<h3 className="text-xl font-extrabold mb-1 text-cm-purple drop-shadow-sm">{product.name}</h3>
								<p className="text-gray-700 mb-2 text-base font-medium max-w-xs mx-auto">
									{product.description}
								</p>
								<span className="text-cm-purple font-bold text-lg mb-3 block">{product.price}</span>
								<Button
									asChild
									className="bg-cm-purple/90 hover:bg-cm-purple text-cm-bg rounded-xl font-bold px-6 py-2 mt-auto shadow-md"
									style={{
										fontSize: "1rem",
										marginTop: "0.5rem",
										boxShadow: "0 2px 8px 0 rgba(108, 62, 165, 0.10)",
									}}
								>
									<a href={`mailto:biblioteca.cm@usp.br?subject=Quero comprar: ${encodeURIComponent(product.name)}`}>
										Quero este produto
									</a>
								</Button>
							</div>
						))}
					</div>
				</div>
				<div className="text-center text-gray-700">
					<p>
						Toda ajuda é bem-vinda! Juntos, construímos uma biblioteca cada vez melhor para a comunidade do CM.
					</p>
					
				</div>
				
			</div>
		</section>
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
