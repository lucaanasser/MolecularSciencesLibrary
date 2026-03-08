import { useEffect, useState, useCallback } from "react";
import { Heart, BookOpen, DollarSign, ChevronDown } from "lucide-react";
import { logger } from "@/utils/logger";
import confetti from "canvas-confetti";

interface RawDonator {
  name: string;
  tag?: string | null;
  donation_type: "book" | "money";
  book_id?: number | null;
  amount?: number | null;
  created_at?: string;
  book_title?: string | null;
  book_authors?: string | null;
  book_code?: string | null;
}

interface BookEntry {
  book_id?: number | null;
  book_title?: string | null;
  book_authors?: string | null;
  book_code?: string | null;
}

interface GroupedDonator {
  displayName: string;
  books: BookEntry[];
  moneyCount: number;
  totalAmount: number;
}

function formatName(name: string, tag?: string | null): string {
  const t = tag?.trim();
  if (!t) return name;
  if (t === "Prof." || t === "Profa.") return `${t} ${name}`;
  if (/^T\d/i.test(t)) return `${name} ${t}`;
  return name;
}

function DonatorCard({ g, onCelebrate }: { g: GroupedDonator; onCelebrate: (name: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      {/* Header - always visible */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => onCelebrate(g.displayName)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <p className="font-semibold text-library-purple text-sm truncate">{g.displayName}</p>
          <span className="bg-cm-blue/15 text-cm-blue text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0">
            {g.books.length} {g.books.length === 1 ? "livro" : "livros"}
          </span>
        </div>
        {g.books.length > 0 && (
          <button
            className="ml-2 p-1 text-gray-400 hover:text-library-purple transition-colors flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            aria-label={expanded ? "Recolher" : "Expandir"}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      {/* Collapsible book list */}
      {expanded && g.books.length > 0 && (
        <div className="border-t border-gray-100 px-4 pb-3 pt-2">
          <ul className="space-y-1.5">
            {g.books.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <BookOpen className="h-3.5 w-3.5 text-cm-blue flex-shrink-0 mt-0.5" />
                {b.book_title ? (
                  <a
                    href={`/biblioteca/livro/${b.book_code}`}
                    className="text-gray-700 hover:text-library-purple transition-colors"
                  >
                    {b.book_title}
                    {b.book_authors && <span className="text-gray-400"> — {b.book_authors}</span>}
                  </a>
                ) : (
                  <span className="text-gray-400">Livro doado</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function DonatorsWallPage() {
  const [raw, setRaw] = useState<RawDonator[]>([]);
  const [loading, setLoading] = useState(true);
  const [celebratedName, setCelebratedName] = useState<string | null>(null);

  const handleCelebrate = useCallback((name: string) => {
    setCelebratedName(name);
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.6 } }), 150);
    setTimeout(() => confetti({ particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.5 } }), 300);
    setTimeout(() => setCelebratedName(null), 3000);
  }, []);

  useEffect(() => {
    logger.info("🔵 [DonatorsWallPage] Buscando doadores");
    fetch("/api/donators/wall")
      .then((res) => res.json())
      .then((data) => {
        console.log("Raw donators data:", data);
        setRaw(data);
        logger.info(`🟢 [DonatorsWallPage] ${data.length} registros carregados`);
      })
      .catch(() => logger.error("🔴 [DonatorsWallPage] Erro ao buscar doadores"))
      .finally(() => setLoading(false));
  }, []);

  // Group by display name
  const grouped = raw.reduce<Record<string, GroupedDonator>>((acc, d) => {
    const display = formatName(d.name, d.tag);
    if (!acc[display]) acc[display] = { displayName: display, books: [], moneyCount: 0, totalAmount: 0 };
    if (d.donation_type === "book") {
      acc[display].books.push({
        book_id: d.book_id,
        book_title: d.book_title,
        book_authors: d.book_authors,
        book_code: d.book_code,
      });
    } else {
      acc[display].moneyCount += 1;
      acc[display].totalAmount += d.amount || 0;
    }
    return acc;
  }, {});

  const allGrouped = Object.values(grouped).sort((a, b) => (b.books.length + b.moneyCount) - (a.books.length + a.moneyCount));
  const bookDonators = allGrouped.filter((g) => g.books.length > 0);
  const moneyOnlyDonators = allGrouped.filter((g) => g.books.length === 0 && g.moneyCount > 0);
  const totalBooks = bookDonators.reduce((s, g) => s + g.books.length, 0);

  return (
    <div className="content-container">
      {/* Thank you overlay */}
      {celebratedName && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ animation: "fadeInOut 3s ease-in-out forwards" }}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-10 py-8 text-center max-w-md mx-4 pointer-events-auto">
            <Heart className="h-10 w-10 text-library-purple mx-auto mb-3" />
            <p className="text-2xl font-bold text-library-purple">Obrigado,</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{celebratedName}!</p>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.8); }
          15% { opacity: 1; transform: scale(1); }
          75% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
      `}</style>

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="h-20 w-20 rounded-full bg-library-purple/20 flex items-center justify-center mb-6">
          <Heart className="h-10 w-10 text-library-purple" />
        </div>
        <h2>Mural de Doadores</h2>
        <p className="max-w-2xl">
          A Biblioteca existe graças à generosidade de cada pessoa que contribuiu com livros ou
          apoio financeiro. Este mural é a nossa forma de dizer <strong>obrigado</strong>.
        </p>
      </div>

      {/* Stats */}
      {!loading && allGrouped.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          <div className="bg-library-purple/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-library-purple">{allGrouped.length}</p>
            <p className="text-sm text-gray-600 mt-1">Doadores</p>
          </div>
          <div className="bg-cm-blue/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-cm-blue">{totalBooks}</p>
            <p className="text-sm text-gray-600 mt-1">Livros doados</p>
          </div>
          <div className="bg-cm-green/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-cm-green">{moneyOnlyDonators.length}</p>
            <p className="text-sm text-gray-600 mt-1">Contribuições financeiras</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : allGrouped.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum doador cadastrado ainda.</p>
      ) : (
        <>
          {/* Book donations */}
          {bookDonators.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-cm-blue/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-cm-blue" />
                </div>
                <h3 className="!mb-0">Doações de Livros</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bookDonators.map((g) => (
                  <DonatorCard key={g.displayName} g={g} onCelebrate={handleCelebrate} />
                ))}
              </div>
            </section>
          )}

          {/* Money donations */}
          {moneyOnlyDonators.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-cm-green/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-cm-green" />
                </div>
                <h3 className="!mb-0">Apoio Financeiro</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {moneyOnlyDonators.map((g) => (
                  <div
                    key={g.displayName}
                    className="bg-cm-green/10 rounded-full px-4 py-1.5 text-sm font-medium text-cm-green cursor-pointer hover:bg-cm-green/20 transition-colors"
                    onClick={() => handleCelebrate(g.displayName)}
                  >
                    {g.displayName}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Thank you note */}
      <div className="flex items-start gap-4 bg-library-purple/10 rounded-xl p-6 mt-8">
        <div className="h-12 w-12 rounded-full bg-library-purple/20 flex items-center justify-center flex-shrink-0">
          <Heart className="h-6 w-6 text-library-purple" />
        </div>
        <div>
          <h4>Obrigado por fazer a diferença!</h4>
          <p>
            Cada doação — seja um livro que ganha uma nova vida nas mãos de outro leitor, ou um apoio
            financeiro que mantém a biblioteca funcionando — faz parte dessa história. Você também
            pode contribuir! Visite a página{" "}
            <a href="/ajude" className="text-library-purple underline font-medium">
              Ajude a Biblioteca
            </a>{" "}
            para saber como.
          </p>
        </div>
      </div>
    </div>
  );
}
