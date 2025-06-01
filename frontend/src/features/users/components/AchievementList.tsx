import React from "react";
import { Trophy, Handshake, BookOpen, HeartHandshake } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// Categorias e conquistas
const CATEGORIES = [
	{
		key: "comportamento",
		label: "Bom Comportamento",
		icon: <Handshake className="w-5 h-5 mr-2 text-cm-green" />,
		achievements: [
			{
				id: 1,
				title: "Devolução em Dia",
				description: "Você devolveu todos os livros no prazo!",
			},
			{
				id: 2,
				title: "Sem Atrasos",
				description: "Nunca atrasou uma devolução.",
			},
		],
	},
	{
		key: "doador",
		label: "Doador",
		icon: <HeartHandshake className="w-5 h-5 mr-2 text-cm-yellow" />,
		achievements: [
			{
				id: 3,
				title: "Primeira Doação",
				description: "Você doou seu primeiro livro!",
			},
			{
				id: 4,
				title: "Doador Frequente",
				description: "Você já doou 5 livros.",
			},
		],
	},
	{
		key: "emprestimos",
		label: "Empréstimos",
		icon: <BookOpen className="w-5 h-5 mr-2 text-cm-blue" />,
		achievements: [
			{
				id: 5,
				title: "Primeiro Empréstimo",
				description: "Você realizou seu primeiro empréstimo!",
			},
			{
				id: 6,
				title: "Leitor Frequente",
				description: "Você já fez 10 empréstimos.",
			},
		],
	},
	{
		key: "geral",
		label: "Geral",
		icon: <Trophy className="w-5 h-5 mr-2 text-cm-purple" />,
		achievements: [
			{
				id: 7,
				title: "Usuário Ativo",
				description: "Acessou a plataforma 30 dias seguidos.",
			},
		],
	},
];

export default function AchievementList() {
	const [tab, setTab] = React.useState(CATEGORIES[0].key);
	return (
		<Tabs value={tab} onValueChange={setTab} className="w-full">
			<TabsList className="grid grid-cols-4 mb-6">
				{CATEGORIES.map((cat) => (
					<TabsTrigger key={cat.key} value={cat.key} className="rounded-xl">
						{cat.icon}
						{cat.label}
					</TabsTrigger>
				))}
			</TabsList>
			{CATEGORIES.map((cat) => (
				<TabsContent key={cat.key} value={cat.key}>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{cat.achievements.map((ach) => (
							<Card key={ach.id} className="flex flex-col items-center p-6 rounded-xl border-2 border-cm-yellow/40 shadow-sm">
								<div className="mb-2">{cat.icon}</div>
								<div className="font-bold text-lg font-bebas text-center">
									{ach.title}
								</div>
								<div className="text-gray-500 text-sm text-center">
									{ach.description}
								</div>
							</Card>
						))}
					</div>
				</TabsContent>
			))}
		</Tabs>
	);
}
