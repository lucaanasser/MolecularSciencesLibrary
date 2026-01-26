

import React from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { FaqList, FAQ } from "../features/faq";

type FAQPageProps = { faqs: FAQ[]; color?: string };

const FAQPage = ({ faqs, color = "cm-purple" }: FAQPageProps) => {
  const textColor = `text-${color}`;
  return (
    <>
      <Navigation />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bebas mb-8">Perguntas Frequentes</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <FaqList faqs={faqs} color={color} />
            <div className="flex justify-center items-center h-full">
              <img src="/images/erro404.svg" alt="Biblioteca do CM" className="max-w-md w-full h-auto rounded-2xl" />
            </div>
          </div>
          <div className={`mt-10 text-center text-base font-medium`}>
            Não encontrou sua dúvida? <a href="mailto:bibliotecamoleculares@gmail.com" className={`underline hover:${textColor}`}>Fale conosco</a>!
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQPage;
