import { Book, Dna, Atom, Orbit, Pi, Braces } from "lucide-react";
import { Loan } from "../../loans/types/loan";

export function AreaIcon({ area }: { area?: string }) {
  switch (area) {
    case "BIO":
      return <Dna className="w-8 md:w-10 h-auto text-cm-green" />;
    case "QUI":
      return <Atom className="w-8 md:w-10 h-auto text-cm-yellow" />;
    case "FIS":
      return <Orbit className="w-8 md:w-10 h-auto text-cm-orange" />;
    case "MAT":
      return <Pi className="w-8 md:w-10 h-auto text-cm-red" />;
    case "CMP":
      return <Braces className="w-8 md:w-10 h-auto text-cm-blue" />;
    default:
      return <Book className="w-8 md:w-10 h-auto text-library-purple" />;
  }
}
