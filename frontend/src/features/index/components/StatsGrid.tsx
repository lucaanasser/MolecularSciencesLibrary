import { Users, BookOpen, Lightbulb, BookMarked } from "lucide-react";
import { useCountUp } from "../../../hooks/useCountUp";

export type StatsType = Record<string, number | null>;

const ICON_STYLE = "h-8 w-8 text-default-bg";

const ICONS: Record<string, JSX.Element> = {
  users: <Users className={ICON_STYLE} />,
  books: <BookMarked className={ICON_STYLE} />,
  subareas: <Lightbulb className={ICON_STYLE} />,
  disciplines: <BookOpen className={ICON_STYLE} />,
  areas: <Lightbulb className={ICON_STYLE} />,
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mx-auto">
      {order.map((key) => (
        <div className="text-center flex flex-col items-center" key={key}>
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-default-bg/20 flex items-center justify-center">
              {ICONS[key]}
            </div>
          </div>
          <p className="mb-1 md:mb-2 font-bold text-white prose-lg">
            {stats[key] == null ? '-' : useCountUp(stats[key], 1200)}
          </p>
          <p className="font-semibold text-white prose-lg">
            {LABELS[key]}
          </p>
          <p className="text-white leading-tight">
            {DESCRIPTIONS[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
