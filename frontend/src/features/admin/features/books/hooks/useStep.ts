/**
 * Hook para controle de etapas (wizard).
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
import { useState } from "react";

export default function useStep(initial = 1) {
  const [step, setStep] = useState(initial);
  const next = () => {
    console.log("🔵 [useStep] Avançando para o próximo passo");
    setStep(s => s + 1);
  };
  const previous = () => {
    console.warn("🟡 [useStep] Voltando para o passo anterior");
    setStep(s => s - 1);
  };
  const goTo = (n: number) => {
    console.log(`🔵 [useStep] Indo para o passo ${n}`);
    setStep(n);
  };
  return { step, setStep, next, previous, goTo };
}