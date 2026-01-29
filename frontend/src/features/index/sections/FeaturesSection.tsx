import { FeatureCard, FeatureCardType } from "../helpers/FeatureCard";

export function FeatureSection({
  title,
  cards,
  columns,
}: {
  title: string;
  cards: FeatureCardType[];
  columns: string;
}) {
  
  return (
    <section className="bg-gray-100">
      <div className={`content-container py-20 md:py-30`}>
        <h2 className={`text-center mb-16`}>{title}</h2>
        <div className={`grid grid-cols-1 ${columns} gap-16 items-stretch`}>
          <FeatureCard cards={cards}/>
        </div>
      </div>
    </section>
  );
}
