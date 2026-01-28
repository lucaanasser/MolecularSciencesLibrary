import React, { useState } from "react";
import { FAQ } from "../types";
import { FaqItem } from "./FaqItem";

interface FaqListProps {
  faqs: FAQ[];
  color: string;
}

export const FaqList: React.FC<FaqListProps> = ({
  faqs,
  color,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-8 max-h-[480px] overflow-y-auto pt-2 pr-4 pl-2 pb-2">
      {faqs.map((faq, idx) => (
        <FaqItem
          key={idx}
          faq={faq}
          index={idx}
          isOpen={openIndex === idx}
          onToggle={() => handleToggle(idx)}
          color={color}
        />
      ))}
    </div>
  );
};
