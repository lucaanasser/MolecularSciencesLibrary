import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

import { useEffect, useState, useRef } from "react";

const supporters = [
  "Ana Clara",
  "João Pedro",
  "Marina Souza",
  "Lucas Lima",
  "Beatriz Alves",
  "Felipe Costa",
  "Gabriela Rocha",
  "Rafael Martins",
  "Juliana Dias",
  "Vinícius Silva",
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function SupportersCarousel() {
  const [displaySupporters, setDisplaySupporters] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shuffled = shuffleArray(supporters);
    const extended = [...shuffled, ...shuffled.slice(0, 4)];
    setDisplaySupporters(extended);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => i + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const itemHeight = window.innerWidth < 640 ? 2 : 2.2;
    listRef.current.style.transition = "transform 0.5s ease-in-out";
    listRef.current.style.transform = `translateY(-${index * itemHeight}rem)`;

    if (index === supporters.length) {
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
  }, [index]);

  return (
    <div className="text-center text-lg sm:text-xl md:text-2xl font-semibold flex flex-wrap justify-center items-center gap-2 px-4">
      <span className="text-black">Obrigado</span>
      <div className="overflow-hidden h-[10rem] sm:h-[12rem] relative" style={{ width: "auto", minWidth: "10rem" }}>
        <div ref={listRef} className="transition-transform duration-500 ease-in-out">
          {displaySupporters.map((supporter, i) => (
            <div key={i} className={`h-[2rem] sm:h-[2.2rem] flex items-center justify-center font-bold text-sm sm:text-base ${i === index + 2 ? "text-cm-purple" : "text-gray-400"}`}>
              {supporter}
            </div>
          ))}
        </div>
        <div className="absolute top-0 h-[4rem] w-full bg-gradient-to-b from-cm-bg to-transparent pointer-events-none" />
        <div className="absolute bottom-0 h-[4rem] w-full bg-gradient-to-t from-cm-bg to-transparent pointer-events-none" />
      </div>
      <span className="text-black">pelo apoio!</span>
    </div>
  );
}

// Página de doações financeiras para a biblioteca
export default function DonationsPage() {
  return (
    <section className="relative py-40 mt-20 mb-20 bg-cm-purple">
            {/* Feature: Roleta com nomes dos apoiadores */}
            <div className="mt-18 flex flex-col items-center mb-24">
              <h2 className="text-5xl text-center mb-8">
                {supporters.length}+ pessoas já apoiaram a Biblioteca!
              </h2>
              <SupportersCarousel />
            </div>
      <div className="absolute top-0 left-0 w-full h-24 bg-cm-bg transform -skew-y-3 origin-top-left"></div>
      <div className="absolute bottom-0 right-0 w-full h-24 bg-cm-bg transform -skew-y-3 origin-bottom-right"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl text-cm-bg mb-4">Apoio financeiro</h2>
        <p className="text-lg text-cm-bg mb-8">
          Sua contribuição é fundamental para a preservação do acervo.
        </p>
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/qr-donation.png"
            alt="QR Code para doação"
            className="w-64 h-64 rounded-xl border border-gray-300 shadow-lg"
          />
          <span className="text-cm-bg mt-2 font-semibold">Escaneie para doar</span>
        </div>
        <Button
          className="w-full max-w-xs bg-cm-bg hover:bg-gray-200 text-cm-purple rounded-xl font-bold py-3 flex items-center justify-center gap-2 shadow-md mx-auto"
          onClick={() => window.location.href = "/donate"}
        >
          <Gift className="h-4 w-4" />
          Ou clique aqui para doar
        </Button>
      </div>
    </section>
  );
}
