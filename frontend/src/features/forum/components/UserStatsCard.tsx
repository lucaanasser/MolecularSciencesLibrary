import React from "react";
import { Trophy, MessageSquare, ThumbsUp, CheckCircle } from "lucide-react";
import UserBadge from "./UserBadge";

interface UserStatsCardProps {
  userName: string;
  reputation: number;
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
  badges: {
    gold: number;
    silver: number;
    bronze: number;
  };
}

/**
 * Card de estatísticas do usuário no fórum
 * Inspirado no perfil do Stack Overflow
 */
const UserStatsCard: React.FC<UserStatsCardProps> = ({
  userName,
  reputation,
  questionsAsked,
  answersGiven,
  acceptedAnswers,
  badges,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {userName[0]}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{userName}</h3>
          <div className="flex items-center gap-1 text-sm">
            <Trophy className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-gray-700">
              {reputation.toLocaleString()}
            </span>
            <span className="text-gray-500">pontos</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      {(badges.gold > 0 || badges.silver > 0 || badges.bronze > 0) && (
        <div className="flex gap-3 mb-4 pb-4 border-b border-gray-200">
          {badges.gold > 0 && <UserBadge type="gold" count={badges.gold} />}
          {badges.silver > 0 && <UserBadge type="silver" count={badges.silver} />}
          {badges.bronze > 0 && <UserBadge type="bronze" count={badges.bronze} />}
        </div>
      )}

      {/* Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare className="w-4 h-4" />
            <span>Perguntas</span>
          </div>
          <span className="font-semibold text-gray-900">{questionsAsked}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-600">
            <ThumbsUp className="w-4 h-4" />
            <span>Respostas</span>
          </div>
          <span className="font-semibold text-gray-900">{answersGiven}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Aceitas</span>
          </div>
          <span className="font-semibold text-green-700">{acceptedAnswers}</span>
        </div>
        {answersGiven > 0 && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Taxa de aceitação:{" "}
            <span className="font-semibold text-green-600">
              {Math.round((acceptedAnswers / answersGiven) * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStatsCard;
