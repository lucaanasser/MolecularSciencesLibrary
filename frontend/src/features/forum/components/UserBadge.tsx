import React from "react";
import { Award, Star, Zap } from "lucide-react";

export type BadgeType = "gold" | "silver" | "bronze";

interface UserBadgeProps {
  type: BadgeType;
  count: number;
  size?: "sm" | "md" | "lg";
}

const UserBadge: React.FC<UserBadgeProps> = ({ type, count, size = "md" }) => {
  const colors = {
    gold: "text-yellow-500",
    silver: "text-gray-400",
    bronze: "text-orange-700",
  };

  const bgColors = {
    gold: "bg-yellow-50",
    silver: "bg-gray-50",
    bronze: "bg-orange-50",
  };

  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`${bgColors[type]} rounded-full p-0.5`}>
        <div className={`${colors[type]} ${sizes[size]} rounded-full bg-current`} />
      </div>
      <span className={`${textSizes[size]} font-medium text-gray-700`}>
        {count}
      </span>
    </div>
  );
};

export default UserBadge;
