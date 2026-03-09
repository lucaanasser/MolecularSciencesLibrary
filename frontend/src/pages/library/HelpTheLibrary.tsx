import { useEffect, useState, useRef } from "react";
import HelpTabsCard from "@/features/forms/HelpTabsCard";
import { logger } from "@/utils/logger";
import { useDonatorsList } from "@/features/donators/hooks/useDonatorsList";
import { Donator } from "@/features/donators/types/Donator";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatDonatorName(donator: Donator): string {
  const name = donator.name || "";
  const tag = donator.tag?.trim();
  if (!tag) return name;
  if (tag === "Prof." || tag === "Profa.") return `${tag} ${name}`;
  if (/^T\d/i.test(tag)) return `${name} ${tag}`;
  return name;
}

function DonatorsCarousel() {
  const { donators, fetchDonators } = useDonatorsList();
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const [baseLength, setBaseLength] = useState(0);
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDonators();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const d of donators) {
      if (!d.name) continue;
      const formatted = formatDonatorName(d);
      if (!seen.has(formatted)) {
        seen.add(formatted);
        unique.push(formatted);
      }
    }
    if (unique.length === 0) return;
    const shuffled = shuffleArray(unique);
    setBaseLength(shuffled.length);
    setDisplayNames([...shuffled, ...shuffled.slice(0, 4)]);
    setIndex(0);
  }, [donators]);

  useEffect(() => {
    if (baseLength === 0) return;
    const timer = setInterval(() => {
      setIndex((i) => i + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, [baseLength]);

  useEffect(() => {
    if (!listRef.current || baseLength === 0) return;
    const itemHeight = window.innerWidth < 640 ? 2 : 2.2;
    listRef.current.style.transition = "transform 0.5s ease-in-out";
    listRef.current.style.transform = `translateY(-${index * itemHeight}rem)`;

    if (index === baseLength) {
      const transitionEnd = () => {
        if (!listRef.current) return;
        listRef.current.removeEventListener("transitionend", transitionEnd);
        listRef.current.style.transition = "none";
        listRef.current.style.transform = `translateY(0)`;
        listRef.current.offsetHeight;
        setIndex(0);
        listRef.current.style.transition = "transform 0.5s ease-in-out";
      };
      listRef.current.addEventListener("transitionend", transitionEnd);
    }
  }, [index, baseLength]);

  if (baseLength === 0) return null;

  return (
    <div className="mt-10 pt-10">
      {/* <a href="/doadores" className="text-sm text-library-purple hover:underline text-center block mb-3">Veja a lista completa de doadores &rarr;</a> */}
      <div className="text-center text-xl sm:text-2xl font-semibold flex flex-wrap justify-center items-center gap-2 px-4">
        <span className="text-gray-700">Obrigado,</span>
        <div className="overflow-hidden h-[10rem] sm:h-[11rem] relative" style={{ minWidth: "12rem" }}>
          <div ref={listRef} className="transition-transform duration-500 ease-in-out">
            {displayNames.map((name, i) => (
              <div
                key={i}
                className={`h-[2rem] sm:h-[2.2rem] flex items-center justify-center font-bold ${
                  i === index + 2 ? "text-library-purple" : "text-gray-400"
                }`}
              >
                {name}
              </div>
            ))}
          </div>
          <div className="absolute top-0 h-[4rem] w-full bg-gradient-to-b from-default-bg to-transparent pointer-events-none" />
          <div className="absolute bottom-0 h-[4rem] w-full bg-gradient-to-t from-default-bg to-transparent pointer-events-none" />
        </div>
        <span className="text-gray-700">pela doação!</span>
      </div>
    </div>
  );
}

/**
 * Página de ajuda à Biblioteca.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const HelpPageContent = () => {
  logger.info("🔵 [HelpTheLibrary] Renderizando página de ajuda");
  
  return (
    <div className="content-container">
      <h2>Ajude a Biblioteca</h2>
      <p>
        A Biblioteca conta com o apoio da comunidade para crescer e se manter relevante. 
        Você pode contribuir enviando feedbacks, sugerindo novos livros, doando exemplares ou apoiando financeiramente. 
        Toda ajuda é bem-vinda!
      </p>
      <HelpTabsCard />
      <DonatorsCarousel />
    </div>
  );
};

export default function HelpPage() {
  return (
    <HelpPageContent />
  );
}
