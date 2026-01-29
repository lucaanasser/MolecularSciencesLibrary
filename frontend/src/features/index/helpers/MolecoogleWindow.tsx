import { useState, useEffect } from "react";
import { Search } from "lucide-react";

// Perguntas ilustrativas
const SUGGESTIONS = [
  "como faço para encontrar um orientador?",
  "como faço para montar minha grade?",
  "como faço para cursar disciplinas da pós?",
  "onde encontro os horários das disciplinas?",
  "onde encontro os contatos dos professores?",
  "é possível me formar ou estou fadado a virar uma capivara da raia?"
];

// Sequência de digitação simulada
const TYPED_SEQUENCES = [
  { text: "como faço para", suggestions: SUGGESTIONS.filter(q => q.toLowerCase().startsWith("como faço para")).slice(0, 3) },
  { text: "onde encontro", suggestions: SUGGESTIONS.filter(q => q.toLowerCase().startsWith("onde encontro")).slice(0, 3) },
  { text: "é possível", suggestions: SUGGESTIONS.filter(q => q.toLowerCase().startsWith("é possível")).slice(0, 3) }
];

const MolecoogleWindow = () => {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    let timeout;
    const currentSeq = TYPED_SEQUENCES[phase];
    if (typed.length < currentSeq.text.length) {
      if (typed.length >= 2) setShowOptions(true);
      else setShowOptions(false);
      timeout = setTimeout(() => {
        setTyped(currentSeq.text.slice(0, typed.length + 1));
      }, 140);
    } else {
      setShowOptions(true);
      timeout = setTimeout(() => {
        setShowOptions(false);
        setTyped("");
        setPhase((prev) => (prev + 1) % TYPED_SEQUENCES.length);
      }, 2200);
    }
    return () => clearTimeout(timeout);
  }, [typed, phase]);

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-2xl py-24 px-8 flex flex-col items-center border border-gray-200 relative">
      {/* Falsa abinha superior à esquerda */}
      <div className="absolute left-5 -top-8 z-0">
        <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 30 Q15 12 30 10 H145 Q160 10 175 30 V60 H0 Z"
            fill="#e5e7eb"
            stroke="#d1d5db"
            strokeWidth="1"
          />
        </svg>
        <div className="absolute top-3 right-6 text-sm font-semibold text-gray-400 select-none">x</div>
      </div>
      {/* Falsa barra superior */}
      <div className="absolute left-0 top-0 w-full h-12 flex items-center px-6 rounded-t-2xl bg-gray-100 border-b border-gray-300 z-10"
           style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
        <div className="flex items-center gap-2">
          <span className="inline-block text-gray-400 text-lg font-bold select-none">&larr;</span>
          <span className="inline-block px-2 text-gray-400 text-lg font-bold select-none">&rarr;</span>
        </div>
        <div className="flex-1 flex justify-center">
          <span className="bg-white w-full px-4 py-1 rounded text-gray-400 text-sm select-none shadow-sm border border-gray-200 text-center">
            https://molecoogle.com
          </span>
        </div>
      </div>
      <div style={{ height: "1rem" }} />
      {/* Logo fake Molecoogle */}
      <div className="flex items-center gap-1 mb-8 mt-2">
        <span className="text-3xl font-bold text-[#4285F4]">M</span>
        <span className="text-3xl font-bold text-[#EA4335]">o</span>
        <span className="text-3xl font-bold text-[#FBBC05]">l</span>
        <span className="text-3xl font-bold text-[#4285F4]">e</span>
        <span className="text-3xl font-bold text-[#34A853]">c</span>
        <span className="text-3xl font-bold text-[#EA4335]">o</span>
        <span className="text-3xl font-bold text-[#4285F4]">o</span>
        <span className="text-3xl font-bold text-[#FBBC05]">g</span>
        <span className="text-3xl font-bold text-[#34A853]">l</span>
        <span className="text-3xl font-bold text-[#EA4335]">e</span>
      </div>
      <div className="w-full flex flex-col items-center">
        <div className="relative w-full">
          <input
            type="text"
            className="w-full px-6 py-4 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-academic-blue text-xl bg-gray-50"
            value={typed}
            readOnly
            placeholder="Faça uma pergunta..."
            autoComplete="off"
          />
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-6 h-6" />
          </span>
          {/* Autocomplete options */}
          {showOptions && (
            <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              {TYPED_SEQUENCES[phase].suggestions.map((option) => {
                const typedLower = typed.toLowerCase();
                const optionLower = option.toLowerCase();
                const startIdx = optionLower.indexOf(typedLower);
                let before = startIdx >= 0 ? option.slice(0, startIdx) : "";
                let match = startIdx >= 0 ? option.slice(startIdx, startIdx + typed.length) : "";
                let after = startIdx >= 0 ? option.slice(startIdx + typed.length) : option;
                let afterWithSpace = after;
                if (
                  afterWithSpace &&
                  match &&
                  match.length > 0 &&
                  match[match.length - 1] === " " &&
                  afterWithSpace[0] === " "
                ) {
                  afterWithSpace = afterWithSpace.slice(1);
                }
                return (
                  <li key={option} className="px-6 py-3 text-gray-700">
                    {startIdx >= 0 ? (
                      <>
                        {before}
                        <span className="font-bold whitespace-nowrap">{match}</span>
                        {afterWithSpace}
                      </>
                    ) : (
                      option
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MolecoogleWindow;
