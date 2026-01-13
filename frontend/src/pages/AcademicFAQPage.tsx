import React, { useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const faqs = [
  {
    question: "Como fazer cadastro na Biblioteca?",
    answer:
      "Envie um e-mail para bibliotecamoleculares@gmail.com com seu nome completo, número USP, email, telefone e turma. Em breve, você receberá um e-mail para criar uma senha pessoal.",
  },
  {
    question: "O que significam as cores na página de busca?",
    answer: (
      <ul className="list-disc pl-6">
        <li><span className="font-bold text-cm-green">Verde:</span> Disponível para empréstimo</li>
        <li><span className="font-bold text-cm-yellow">Amarelo:</span> Emprestado</li>
        <li><span className="font-bold text-cm-orange">Laranja:</span> Estendido</li>
        <li><span className="font-bold text-cm-red">Vermelho:</span> Atrasado</li>
        <li><span className="font-bold text-cm-purple">Roxo:</span> Reserva didática (não disponível para empréstimo)</li>
      </ul>
    ),
  },
  {
    question: "Como funcionam os códigos dos livros?",
    answer:
      "Cada livro possui 2 códigos: um código de localização (no formato 'ABC-01.01') e um código de barras. O código de barras é único para cada exemplar e utilizado para empréstimos, sendo facilmente encontrado na etiqueta do livro. Já no código de localização, as letras indicam a área do conhecimento (ex. Biologia), o primeiro número indica a subárea (ex. Bioquímica), e o segundo número é o identificador sequencial do livro (ex. 07 - sétimo livro da subárea).",
  },
  {
    question: "Como funciona a Estante Virtual?",
    answer:
      "A Estante Virtual permite visualizar com precisão a localização dos livros no acervo físico do CM. Ao passar o mouse sobre cada livro, você poderá ver detalhes como título, autor, código de localização e status do livro (disponível, emprestado, estendido, atrasado ou reserva didática).",
  },
  {
    question: "Como funciona a Reserva Didática?",
    answer:
      "A Reserva Didática é um serviço que permite aos professores reservar livros da bibliografia básica para uso restrito nas dependências do CM. No início de cada semestre, a equipe da biblioteca entra em contato com os professores do curso para fazer as reservas. É importante ressaltar que os livros reservados não podem ser emprestados ao longo do semestre em questão, garantindo assim que todos os alunos tenham acesso ao material necessário para suas aulas e estudos.",
  },
  {
    question: "Como faço um empréstimo de livro?",
    answer:
      "Vá até o PC da Biblioteca, acesse o 'Portal Pró Aluno' e selecione a opção 'Empréstimo'. Em seguida, preencha o seu Número USP e senha pessoal e escaneie o código de barras presente na etiqueta do livro. Prontinho! Em breve você receberá um email confirmando o empréstimo.",
  },
  {
    question: "O que fazer caso o Painel Pró Aluno não esteja logado?",
    answer:
      "Mande um email para bibliotecamoleculares@gmail.com informando o código de barras do livro desejado e o seu Número USP, e iremos cadastrar o empréstimo manualmente.",
  },
  {
    question: "Qual o prazo de empréstimo?",
    answer:
      "O prazo padrão de empréstimo é de 7 dias, com possibilidade de renovação por mais 7 dias 3 vezes, desde que não haja pendências do usuário. Além disso, o livro pode ser estendido por mais 21 dias (verifique a pergunta 'O que é uma extensão?').",
  },
  {
    question: "Como renovar um empréstimo?",
    answer:
      "Acesse a 'Área do Usuário' com seu NUSP e senha pessoal, vá até a seção de empréstimos e clique em 'Renovar' ao lado do livro desejado. Você pode renovar o empréstimo até 3 vezes, desde que não haja pendências.",
  },
  {
    question: "O que significa cutucar?",
    answer:
      "Cutucar é uma forma de notificar o usuário de que ele está com um livro atrasado ou estendido que outro usuário deseja emprestar. Ao receber o cutucão, o usuário é informado por e-mail com a solicitação de devolução do exemplar.",
  },
  {
    question: "O que é uma extensão?",
    answer:
      "Uma extensão permite prolongar o prazo de devolução do livro por mais 21 dias, desde que não haja pendências do usuário em outros livros. Porém, livros estendidos podem receber cutucadas por outros usuários, e nesse caso a extensão será interrompida e o livro deverá ser devolvido em até 5 dias.",
  },
  {
    question: "O que acontece se eu atrasar a devolução?",
    answer:
      "Você receberá notificações de atraso, poderá ser cutucado por outros usuários que desejem o livro atrasado e terá restrições para novos empréstimos ou renovações.",
  },
  {
    question: "Como doar livros para a biblioteca?",
    answer:
      "Futuramente, será possível fazer doações diretamente pelo site. Por enquanto, estamos terminando de organizar o acervo.",
  },
];

export default function AcademicFAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Navigation />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bebas mb-8">Perguntas Frequentes</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-8 max-h-[480px] overflow-y-auto pt-2 pr-4 pl-2 pb-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`${openIndex === idx ? 'rounded-2xl bg-cm-bg ring-2 ring-cm-academic/60' : 'rounded-2xl bg-cm-academic'} hover:bg-cm-bg/80 hover:ring-2 hover:ring-cm-academic/60 transition-all duration-0`}
                >
                  <button
                    className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none group"
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    aria-expanded={openIndex === idx}
                  >
                    <span className={`font-semibold text-lg flex items-center gap-2 ${openIndex === idx ? 'text-cm-academic' : 'text-cm-bg'} group-hover:text-cm-academic`}>
                      <span className="inline-block w-2 h-2 text-cm-academic rounded-full bg-cm-academic/60" />
                      {faq.question}
                    </span>
                    <span className={`text-2xl font-bold ${openIndex === idx ? 'text-cm-academic' : 'text-cm-bg'} group-hover:text-cm-academic`}>{openIndex === idx ? "−" : "+"}</span>
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
          <div className="mt-10 text-center text-cm-academic text-base font-medium">
            Não encontrou sua dúvida? <a href="mailto:bibliotecamoleculares@gmail.com" className="underline hover:text-cm-bg">Fale conosco</a>!
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
