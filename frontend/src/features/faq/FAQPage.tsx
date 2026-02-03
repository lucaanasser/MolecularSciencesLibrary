import { FaqList } from ".";
import type { FAQ } from ".";

type FAQPageProps = { faqs: FAQ[]; color: string; imageSrc: string; intro?: string };

const FAQPage = ({ faqs, color, imageSrc, intro }: FAQPageProps) => {
    const textColor = `text-${color}`;
    return (
        <div className="content-container">
            <h2>Perguntas Frequentes</h2>
            {intro && <p>{intro}</p>}
            <div className="grid grid-cols-1 gap-8 items-start md:[grid-template-columns:1fr_2fr]">
                <div className="flex justify-center items-center mb-6 md:mb-0 md:h-full md:min-h-[400px] md:items-center">
                    <img
                        src={imageSrc}
                        alt="Biblioteca do CM"
                        className="object-contain rounded-2xl max-w-[220px] w-full md:max-w-full"
                    />
                </div>
                <FaqList faqs={faqs} color={color} />
            </div>
            <p className={`mt-4 md:mt-8 mb-0 text-center`}>
                Não encontrou sua dúvida? <a href="mailto:bibliotecamoleculares@gmail.com" className="link">Fale conosco</a>!
            </p>
        </div>
    );
};

export default FAQPage;
