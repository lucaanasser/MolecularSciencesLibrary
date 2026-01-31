import React from "react";
import { Button } from "@/components/ui/button";

interface BookFinishStepProps {
  onAddAnother: () => void;
}

export default function BookFinishStep({
  onAddAnother,
}: BookFinishStepProps) {
  return (
    <>
      <p>Deseja adicionar outro livro?</p>
      <Button
        variant="wide"
        className="bg-cm-green"
        onClick={onAddAnother}
      >
        Sim, adicionar outro
      </Button>
    </>
  );
}
