interface Stats {
  icon: any;
  value: string | number;
  label: string;
  shortLabel: string;
  bgColor: string;
  textColor: string;
  iconBg: string;
}

const StatCard = (Stat: Stats) => {
  const { icon: Icon, value, label, shortLabel, bgColor, textColor, iconBg } = Stat;
  return (
    <div className={`${bgColor} rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      <div className="flex flex-col items-center md:items-start justify-center">
        <p className={`prose-md mb-0 font-bold ${textColor}`}>{value}</p>
        <p className={`prose-sm mb-0 ${textColor} md:hidden`}>
          {shortLabel}
        </p>
        <p className={`prose-sm mb-0 ${textColor} hidden md:block`}>
          {label}
        </p>
      </div>
    </div>
  </div>
);};

export const StatsSidebar = ({ stats }: { stats: Stats[] }) => {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            shortLabel={stat.shortLabel}
            bgColor={stat.bgColor}
            textColor={stat.textColor}
            iconBg={stat.iconBg}
          />
        ))}
      </div>
    </aside>
  );
};