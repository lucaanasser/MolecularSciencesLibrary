
import React, { useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const faqs = [
  {
    question: "Como faço um empréstimo de livro?",
    answer:
      "Acesse sua conta, vá até a página de busca, escolha o livro desejado e clique em 'Solicitar Empréstimo'. Aguarde a confirmação por notificação ou e-mail.",
  },
  {
    question: "O que significam as cores na página de busca?",
    answer: (
      <ul className="list-disc pl-6">
        <li><span className="font-bold text-green-600">Verde:</span> Disponível para empréstimo.</li>
        <li><span className="font-bold text-yellow-500">Amarelo:</span> Reservado ou devolução próxima.</li>
        <li><span className="font-bold text-red-600">Vermelho:</span> Emprestado ou indisponível.</li>
        <li><span className="font-bold text-blue-600">Azul:</span> Livro digital disponível.</li>
      </ul>
    ),
  },
  {
    question: "Como funcionam os códigos dos livros?",
    answer:
      "Cada livro possui um código único, como 'ABC-1234'. As letras indicam a categoria ou coleção, e os números identificam o exemplar.",
  },
  {
    question: "Posso reservar um livro que está emprestado?",
    answer:
      "Sim! Clique em 'Reservar' na página do livro. Você será avisado quando ele estiver disponível.",
  },
  {
    question: "Como renovar um empréstimo?",
    answer:
      "Acesse sua área de empréstimos e clique em 'Renovar' ao lado do livro desejado, se a renovação estiver disponível.",
  },
  {
    question: "O que acontece se eu atrasar a devolução?",
    answer:
      "Você receberá notificações de atraso e poderá ter restrições temporárias para novos empréstimos.",
  },
  {
    question: "Como doar livros para a biblioteca?",
    answer:
      "Acesse a página 'Ajude a Biblioteca' e siga as instruções para doação. Toda contribuição é bem-vinda!",
  },
  {
    question: "Como funciona a Estante Virtual?",
    answer:
      "A Estante Virtual permite visualizar livros digitais disponíveis para leitura online, sem necessidade de empréstimo físico.",
  },
  {
    question: "Como entro em contato com a equipe?",
    answer:
      "Envie um e-mail para bibliotecamoleculares@gmail.com ou utilize o formulário de contato no site.",
  },
  {
    question: "Quais documentos preciso para cadastro?",
    answer:
      "É necessário um documento oficial com foto e o número USP para alunos e funcionários.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Navigation />
      <div className="min-h-[80vh] bg-gradient-to-br from-cm-purple/10 via-cm-bg/10 to-cm-purple/5 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-cm-purple drop-shadow">Perguntas Frequentes</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`rounded-xl shadow-lg border-2 border-cm-purple/30 bg-white/80 hover:bg-cm-purple/10 transition-all duration-300 ${openIndex === idx ? 'ring-2 ring-cm-purple/60' : ''}`}
              >
                <button
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  aria-expanded={openIndex === idx}
                >
                  <span className="font-semibold text-lg text-cm-purple flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-cm-purple/60 animate-pulse" />
                    {faq.question}
                  </span>
                  <span className={`text-2xl font-bold ${openIndex === idx ? 'text-cm-purple' : 'text-gray-400'}`}>{openIndex === idx ? "−" : "+"}</span>
                </button>
                {openIndex === idx && (
                  <div className="px-6 pb-5 text-gray-700 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center text-cm-purple text-base font-medium">
            Não encontrou sua dúvida? <a href="mailto:bibliotecamoleculares@gmail.com" className="underline hover:text-cm-bg">Fale conosco</a>!
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
