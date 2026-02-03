import { StatsGrid, StatsType } from "../components/StatsGrid";

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
    <section
      className={`${bgClass} diagonal-section`}
    >
      <div className="content-container">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className={`${textClass}`}>{title}</h2>
        </div>
        {loading ? (
          <p className={`text-center ${textClass}`}>Carregando...</p>
        ) : error ? (
          <p className="text-center text-red-200">{error}</p>
        ) : (
          <StatsGrid stats={stats} order={order} />
        )}
      </div>
    </section>
  );
}
