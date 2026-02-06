import React from "react";

export const MolecoooogleLogo: React.FC<{ oCount?: number, textSize?: string }> = ({ oCount = 2, textSize = "text-4xl" }) => {
  
  // Letras iniciais
  const logoLetters = [
    { char: "M", color: "text-google-blue" },
    { char: "o", color: "text-google-red" },
    { char: "l", color: "text-google-yellow" },
    { char: "e", color: "text-google-blue" },
    { char: "c", color: "text-google-green" },
  ];
  
  // Cores para os "o" variáveis
  const oColors = ["text-google-red", "text-google-yellow", "text-google-blue", "text-google-green", "text-google-red"];
  
  // Letras finais
  const endLetters = [
    { char: "g", color: "text-google-blue" },
    { char: "l", color: "text-google-green" },
    { char: "e", color: "text-google-red" },
  ];
  return (
    <span className="flex items-center gap-0">
      {logoLetters.map((l, i) => (
        <span key={i} className={`${textSize} font-bold ${l.color}`}>{l.char}</span>
      ))}
      {/* o's variáveis para paginação */}
      {oCount
        ? Array.from({ length: oCount }).map((_, i) => (
            <span key={"o"+i} className={`${textSize} font-bold ${oColors[i % oColors.length]}`}>o</span>
          ))
        : <span className={`${textSize} font-bold text-google-red`}>o</span>
      }
      {endLetters.map((l, i) => (
        <span key={"end"+i} className={`${textSize} font-bold ${l.color}`}>{l.char}</span>
      ))}
    </span>
  );
};