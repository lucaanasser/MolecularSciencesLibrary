import React, { useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const faqs = [];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Navigation />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1>Perguntas Frequentes</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-8 max-h-[480px] overflow-y-auto pt-2 pr-4 pl-2 pb-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`${openIndex === idx ? 'rounded-2xl bg-cm-bg ring-2 ring-cm-purple/60' : 'rounded-2xl bg-cm-purple'} hover:bg-cm-bg/80 hover:ring-2 hover:ring-cm-purple/60 transition-all duration-0`}
                >
                  <button
                    className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none group"
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    aria-expanded={openIndex === idx}
                  >
                    <span className={`font-semibold text-lg flex items-center gap-2 ${openIndex === idx ? 'text-cm-purple' : 'text-cm-bg'} group-hover:text-cm-purple`}>
                      <span className="inline-block w-2 h-2 text-cm-purple rounded-full bg-cm-purple/60" />
                      {faq.question}
                    </span>
                    <span className={`text-2xl font-bold ${openIndex === idx ? 'text-cm-purple' : 'text-cm-bg'} group-hover:text-cm-purple`}>{openIndex === idx ? "−" : "+"}</span>
                  </button>
                  {openIndex === idx && (
                    <div className="px-6 pb-5 text-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center h-full">
              <img src="/images/erro404.svg" alt="Biblioteca do CM" className="max-w-md w-full h-auto rounded-2xl" />
            </div>
          </div>
          <div className="mt-10 text-center text-cm-purple text-base font-medium">
            Não encontrou sua dúvida? <a href="mailto:bibliotecamoleculares@gmail.com" className="underline hover:text-black">Fale conosco</a>!
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
