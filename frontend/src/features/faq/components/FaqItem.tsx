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
  color = "library-purple",
}) => {
  const bgColor = `bg-${color}`;
  const textColor = `text-${color}`;
  const ringColor = `ring-${color}/60`;

  return (
    <div
      className={`${
        isOpen
          ? `rounded-2xl bg-default-bg ring-2 ${ringColor}`
          : `rounded-2xl ${bgColor}`
      } hover:bg-default-bg/80 hover:ring-2 ${ringColor} transition-all duration-0`}
    >
      <button
        className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none group"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span
          className={`font-semibold text-lg flex items-center gap-2 ${
            isOpen ? textColor : "text-white"
          } group-hover:${textColor}`}
        >
          <span className={`inline-block w-2 h-2 ${textColor} rounded-full ${bgColor}/60`} />
          {faq.question}
        </span>
        <span
          className={`text-2xl font-bold ${
            isOpen ? textColor : "text-white"
          } group-hover:${textColor}`}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && <div className="px-6 pb-5 text-gray-700">{faq.answer}</div>}
    </div>
  );
};
