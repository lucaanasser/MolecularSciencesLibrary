import React from "react";

export const MolecoooogleLogo: React.FC<{ oCount?: number, textSize?: string }> = ({ oCount = 2, textSize = "text-4xl" }) => {
  
  // Letras iniciais
  const logoLetters = [
    { char: "M", color: "text-cm-blue" },
    { char: "o", color: "text-cm-red" },
    { char: "l", color: "text-cm-yellow" },
    { char: "e", color: "text-cm-blue" },
    { char: "c", color: "text-cm-green" },
  ];
  
  // Cores para os "o" variáveis
  const oColors = ["text-cm-red", "text-cm-yellow", "text-cm-blue", "text-cm-green", "text-cm-red"];
  
  // Letras finais
  const endLetters = [
    { char: "g", color: "text-cm-blue" },
    { char: "l", color: "text-cm-green" },
    { char: "e", color: "text-cm-red" },
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
        : <span className={`${textSize} font-bold text-cm-red`}>o</span>
      }
      {endLetters.map((l, i) => (
        <span key={"end"+i} className={`${textSize} font-bold ${l.color}`}>{l.char}</span>
      ))}
    </span>
  );
};