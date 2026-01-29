import { FeatureCards, FeatureCardType } from "../helpers/FeatureCards";

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
    <section className={`${bgClass}`}>
      <div className={`content-container py-20 md:py-30`}>
        <h2 className={`text-center mb-16 ${textClass}`}>{title}</h2>
        <FeatureCards cards={cards} columns={columns} />
      </div>
    </section>
  );
}
