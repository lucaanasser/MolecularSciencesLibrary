import { FeatureCards, FeatureCardType } from "./helpers/FeatureCards";

export function FeatureSection({
  title,
  cards,
  columns = 3,
  bgClass = "bg-gray-100",
  textClass = "",
}: {
  title: string;
  cards: FeatureCardType[];
  columns?: number;
  bgClass?: string;
  textClass?: string;
}) {
  return (
    <section className={`section py-20 md:py-30 ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className={`text-center mb-16 ${textClass}`}>{title}</h2>
        <FeatureCards cards={cards} columns={columns} />
      </div>
    </section>
  );
}
