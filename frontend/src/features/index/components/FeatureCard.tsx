import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export type FeatureCardType = {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  colorClass: string;
};

export function FeatureCard({ cards }: { cards: FeatureCardType[] }) {
  return (
    <>
      {cards.map((card, idx) => (
        <article className="card" key={idx}>
          <div className={`card-icon ${card.colorClass}`}>
            {card.icon}
          </div>

          <h4>{card.title}</h4>
          <p className="prose-sm">{card.description}</p>

          <Button variant="wide" size="sm" className={`mt-auto ${card.colorClass}`}>
            <Link to={card.buttonLink} className="w-full h-full flex items-center justify-center">
              {card.buttonText}
            </Link>
          </Button>
        </article>
      ))}
    </>
  );
}
