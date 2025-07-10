import React from "react";

interface BookFinishStepProps {
  onAddAnother: () => void;
}

export default function BookFinishStep({
  onAddAnother,
}: BookFinishStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-xl font-bold">Deseja adicionar outro livro?</h2>
      <div className="flex gap-4">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onAddAnother}
        >
          Sim, adicionar outro
        </button>
      </div>
    </div>
  );
}
