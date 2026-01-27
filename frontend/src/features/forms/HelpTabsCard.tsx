import { TabsCard } from "@/lib/TabsCard";
import TabForm from "./TabForm";
import { tabs, cardContent } from "./formsConfig";

const HelpTabsCard: React.FC = () => {
   
    const imageSize = "relative flex flex-col justify-center items-center w-full md:w-[30%] h-full min-h-[400px]";
    const imageFormatting = "absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full object-contain";

    return (
        <div className="w-full max-w-6xl mx-auto px-3 mt-[-24px] sm:px-6 lg:px-12">
        <TabsCard tabs={tabs} initialTabId="feedback">

            {/* Feedback */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-stretch gap-4 md:gap-6 min-h-[500px]">
                <div className="w-full md:w-[60%]">
                    <h3>{cardContent.feedback.title}</h3>
                    <p className="leading-tight">{cardContent.feedback.description}</p>
                    <TabForm tab="Críticas e sugestões" />
                </div>
                <div className={imageSize}>
                    <img
                        src={cardContent.feedback.image}
                        alt={cardContent.feedback.imageAlt}
                        className={imageFormatting}
                    />
                </div>
            </div>
        
            {/* Sugestão de livros */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-stretch gap-4 md:gap-6 min-h-[500px]">
                <div className="w-full md:w-[60%]">
                    <h3>{cardContent.suggestion.title}</h3>
                    <p className="leading-tight">{cardContent.suggestion.description}</p>
                    <TabForm tab="Sugestões de livros" />
                </div>
                <div className={imageSize}>
                    <img
                        src={cardContent.suggestion.image}
                        alt={cardContent.suggestion.imageAlt}
                        className={imageFormatting}
                    />
                </div>
            </div>
        
            {/* Doação de exemplares */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-stretch gap-4 md:gap-6 min-h-[500px]">
                <div className="w-full md:w-[60%]">
                    <h3>{cardContent.donation.title}</h3>
                    <p className="leading-tight">{cardContent.donation.description}</p>
                    <TabForm tab="Doação de exemplares" />
                </div>
                <div className={imageSize}>
                    <img
                        src={cardContent.donation.image}
                        alt={cardContent.donation.imageAlt}
                        className={imageFormatting}
                    />
                </div>
            </div>
            
        </TabsCard>
        </div>
    );
};

export default HelpTabsCard;
