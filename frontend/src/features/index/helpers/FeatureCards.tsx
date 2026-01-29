import { Link } from "react-router-dom";
import { ReactNode } from "react";

export type FeatureCardType = {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  colorClass: string;
  buttonClass?: string;
};

export function FeatureCards({ cards, columns = 3 }: { cards: FeatureCardType[]; columns?: number }) {
  const gridCols = columns === 4 ? "lg:grid-cols-4 md:grid-cols-2" : "md:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-12`}>
      {cards.map((card, idx) => (
        <div
          className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-md border border-gray-200"
          key={idx}
        >
          <div className={`-mt-16 mb-4 flex items-center justify-center w-24 h-24 rounded-full ${card.colorClass} border-8 border-white`}>
            {card.icon}
          </div>
          <h4>{card.title}</h4>
          <p className="prose-sm">{card.description}</p>
          <div className="flex flex-col items-center mb-4"></div>
          <button className={`btn-wide ${card.buttonClass || card.colorClass}`}>
            <Link to={card.buttonLink}>{card.buttonText}</Link>
          </button>
        </div>
      ))}
    </div>
  );
}
