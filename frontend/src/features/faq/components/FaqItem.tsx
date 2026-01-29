import React from "react";
import { FAQ } from "../types";

interface FaqItemProps {
  faq: FAQ;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  color?: string;
}

export const FaqItem: React.FC<FaqItemProps> = ({
  faq,
  isOpen,
  onToggle,
  color,
}) => {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <>
    {/* Card da pergunta*/}
    <div
      className={`rounded-xl bg-${color}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <p className="text-white font-semibold mb-0">
          {faq.question}
        </p>

        <span className="pl-1 text-2xl font-bold text-white">
          {isOpen ? "-" : "+"}
        </span>
      </button>
    </div>

    {/* Resposta (fora do card) */}
    {isOpen && (
      <div className="flex mt-0 pl-4 w-full">
        <div className={`border-l-4 border-${color} pr-3 flex-shrink-0`} />
        <p className="prose-sm mb-0 break-words w-full">
          {faq.answer}
        </p>
      </div>
    )}
    </>

  );
};
