import { Users, BookOpen, Lightbulb, BookMarked } from "lucide-react";
import { useCountUp } from "../../../hooks/useCountUp";

export type StatsType = Record<string, number | null>;

const ICONS: Record<string, JSX.Element> = {
  users: <Users className="h-8 w-8 text-default-bg" />,
  books: <BookMarked className="h-8 w-8 text-default-bg" />,
  subareas: <Lightbulb className="h-8 w-8 text-default-bg" />,
  disciplines: <BookOpen className="h-8 w-8 text-default-bg" />,
  areas: <Lightbulb className="h-8 w-8 text-default-bg" />,
};

const LABELS: Record<string, string> = {
  users: "Usuários ativos",
  books: "Exemplares disponíveis",
  subareas: "Áreas do conhecimento",
  disciplines: "Disciplinas disponíveis",
  areas: "Áreas de concentração",
};

const DESCRIPTIONS: Record<string, string> = {
  users: "Conectando leitores e promovendo o acesso ao conhecimento.",
  books: "Encontre facilmente o livro que procura no nosso acervo organizado.",
  subareas: "Navegue pelas disciplinas e descubra conteúdos de diversas especialidades.",
  disciplines: "Catálogo completo de disciplinas para seu planejamento.",
  areas: "Escolha sua especialização e trace seu caminho.",
};

export function StatsGrid({ stats, order }: { stats: StatsType, order: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
      {order.map((key) => (
        <div className="text-center" key={key}>
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-default-bg/20 flex items-center justify-center">
              {ICONS[key]}
            </div>
          </div>
          <p className="bigtext mb-2 font-bold text-default-bg">
            {stats[key] == null ? '-' : useCountUp(stats[key], 1200)}
          </p>
          <p className="bigtext text-default-bg">
            {LABELS[key]}
          </p>
          <p className="text-default-bg leading-tight">
            {DESCRIPTIONS[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
