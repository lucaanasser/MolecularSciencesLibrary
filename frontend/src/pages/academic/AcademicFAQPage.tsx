import FAQPage from "../../features/faq/FAQPage";

{ /* FAQ Mockado */ }
const faqs = [
  {
    question: "Como faço para acessar os materiais das disciplinas acadêmicas?",
    answer: "Os materiais estão disponíveis na área do aluno, na seção 'Disciplinas'. Basta selecionar a disciplina desejada para visualizar e baixar os arquivos disponibilizados pelos professores.",
  },
  {
    question: "Posso sugerir novos conteúdos para as disciplinas?",
    answer: "Sim! Utilize o formulário de sugestão disponível na página de cada disciplina ou envie um e-mail para academic@bibliotecamoleculares.com.",
  },
  {
    question: "Como funcionam as avaliações acadêmicas?",
    answer: "As avaliações são realizadas online, dentro do próprio sistema, e o acesso é liberado conforme o cronograma definido pelo professor responsável.",
  },
  {
    question: "Consigo acompanhar meu desempenho nas disciplinas?",
    answer: "Sim, o histórico de notas e feedbacks está disponível na área do aluno, em 'Meu Desempenho'.",
  },
  {
    question: "Quem posso procurar em caso de dúvidas acadêmicas?",
    answer: "Você pode entrar em contato diretamente com o professor da disciplina ou com a equipe de suporte acadêmico pelo e-mail academic@bibliotecamoleculares.com.",
  },
];


export default function FAQAcademic() {
  return (
    <FAQPage
      faqs={faqs}
      color="academic-blue"
      imageSrc="/images/faqAcademic.png"
      intro="Aqui você encontra respostas para as dúvidas mais comuns sobre o funcionamento da modalidade acadêmica desse site."
    />
  );
}