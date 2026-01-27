import { MessageCircle, BookOpen, Gift } from "lucide-react";

export const tabs = [
  { id: "feedback", label: "Críticas e sugestões", shortLabel: "Feedback", icon: MessageCircle },
  { id: "suggestion", label: "Sugestões de livros", shortLabel: "Acervo", icon: BookOpen },
  { id: "donation", label: "Doação de exemplares", shortLabel: "Doação", icon: Gift },
];

export const cardContent = {
  feedback: {
    title: 'Envie seu feedback',
    description: 'Ajude-nos a melhorar! Compartilhe suas sugestões, críticas ou ideias para tornar nossa biblioteca ainda melhor.',
    image: '/images/feedback.png',
    imageAlt: 'Feedback'
  },
  suggestion: {
    title: 'Sugira um livro',
    description: 'Você acha que o nosso acervo está incompleto? Compartilhe títulos que você considere importantes para a comunidade.',
    image: '/images/suggestion.png',
    imageAlt: 'Sugestão de livros'
  },
  donation: {
    title: 'Doe um livro',
    description: 'Contribua para a disseminação do conhecimento. Doar livros em bom estado ajuda a expandir nosso alcance e recursos.',
    image: '/images/donation.png',
    imageAlt: 'Doação de exemplares'
  }
};
