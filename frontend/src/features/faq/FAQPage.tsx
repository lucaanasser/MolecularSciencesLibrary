import { FaqList } from "@/features/faq/FaqList";
import type { FAQ } from "@/features/faq/FaqItem";
import { logger } from "@/utils/logger";

/**
 * Página de FAQ da Biblioteca.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

type FAQPageProps = { 
  faqs: FAQ[]; 
  imageSrc: string; 
  intro?: string;
  reverse?: boolean;
 };

const FAQPage = ({ faqs, imageSrc, intro, reverse = false }: FAQPageProps) => {
    
    // Log de início de renderização da página
    logger.info("🔵 [FAQPage] Renderizando página de FAQ");
        
    return (
        <div className="content-container">
            <h2>Perguntas Frequentes</h2>
            {intro && <p>{intro}</p>}
            <div className={`grid grid-cols-1 gap-8 items-start ${reverse? 'md:[grid-template-columns:2fr_1fr]' : 'md:[grid-template-columns:1fr_2fr]'}`}>
                <div className={`flex justify-center items-center mb-6 md:mb-0 md:h-full md:min-h-[400px] md:items-center ${reverse ? 'md:order-2' : ''}`}> 
                    <img
                        src={imageSrc}
                        alt="Biblioteca do CM"
                        className="object-contain rounded-2xl max-w-[220px] w-full md:max-w-full"
                    />
                </div>
                <div className={`${reverse ? 'md:order-1' : 'md:order-2'}`}> 
                    <FaqList faqs={faqs} />
                </div>
            </div>
            <p className="mt-4 md:mt-8 mb-0 text-center">
                Não encontrou sua dúvida? <a href="mailto:bibliotecamoleculares@gmail.com" className="link">Fale conosco</a>!
            </p>
        </div>
    );
};

export default FAQPage;
