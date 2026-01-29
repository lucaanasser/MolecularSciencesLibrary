import { Link } from "react-router-dom";
import { ReactNode } from "react";

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

          <Link
            to={card.buttonLink}
            className={`btn-wide ${card.colorClass} mt-auto`}
          >
            {card.buttonText}
          </Link>
        </article>
      ))}
    </>
  );
}
