import { StatsGrid, StatsType } from "./helpers/StatsGrid";

export function StatsSection({
  stats,
  order,
  title,
  loading,
  error,
  bgClass = "bg-library-purple",
  textClass = "text-default-bg",
  diagonal = true,
}: {
  stats: StatsType;
  order: string[];
  title: string;
  loading?: boolean;
  error?: string | null;
  bgClass?: string;
  textClass?: string;
  diagonal?: boolean;
}) {
  return (
    <section className={`relative py-40 ${bgClass}`}>
      {diagonal && (
        <>
          <div className="absolute top-0 left-0 w-full h-24 bg-default-bg transform -skew-y-3 origin-top-left"></div>
          <div className="absolute bottom-0 right-0 w-full h-24 bg-default-bg transform -skew-y-3 origin-bottom-right"></div>
        </>
      )}
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className={textClass}>{title}</h2>
        </div>
        {loading ? (
          <div className={`text-center ${textClass} text-xl`}>Carregando...</div>
        ) : error ? (
          <div className="text-center text-red-200 text-xl">{error}</div>
        ) : (
          <StatsGrid stats={stats} order={order} />
        )}
      </div>
    </section>
  );
}
