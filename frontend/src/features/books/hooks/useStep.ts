import { useState } from "react";

export default function useStep(initial = 1) {
  const [step, setStep] = useState(initial);
  const next = () => setStep(s => s + 1);
  const previous = () => setStep(s => s - 1);
  const goTo = (n: number) => setStep(n);
  return { step, setStep, next, previous, goTo };
}