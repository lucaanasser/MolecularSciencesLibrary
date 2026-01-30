import React from "react";

interface BookSpineStepProps {
  onSelect: (spineType: 'normal' | 'fina') => void;
  onPrevious: () => void;
}

export default function BookSpineStep({ onSelect, onPrevious }: BookSpineStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-xl font-bold">A lombada do livro é fina?</h2>
      <div className="flex gap-4">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => onSelect('fina')}
        >
          Sim, é fina
        </button>
        <button
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={() => onSelect('normal')}
        >
          Não, é normal
        </button>
      </div>
      <button className="mt-8 text-blue-500 underline" onClick={onPrevious}>
        Voltar
      </button>
    </div>
  );
}
