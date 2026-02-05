import ProAlunoPageRefactored from "../../features/admin/features/proaluno/ProAlunoPageRefactored";
import { SearchPage } from "@/features/search/molecoogle/SearchPage";
import { useMolecoogleSearchConfig } from "@/features/search/useMolecoogleSearchConfig";

export default function TestPage() {
  const modes = useMolecoogleSearchConfig();

  return (
    <SearchPage
      modes={modes}
      initialMode="disciplinas" // ou "usuarios", "livros"
      hideModeSwitcher={false}  // ou true para esconder os botões de modo
    />
  );
}