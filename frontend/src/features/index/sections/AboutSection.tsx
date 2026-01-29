import { Link } from "react-router-dom";

export function AboutSection({
  title,
  paragraphs,
  buttonText,
  buttonLink,
  buttonClass = "btn-primary",
  imageSrc,
  imageAlt = "",
  reverse = false,
}: {
  title: string;
  paragraphs: string[];
  buttonText: string;
  buttonLink: string;
  buttonClass?: string;
  imageSrc: string;
  imageAlt?: string;
  reverse?: boolean;
}) {
  return (
    <section>
      <div className={`content-container grid grid-cols-1 md:grid-cols-2 gap-4 items-center${reverse ? ' md:flex-row-reverse' : ''}`}> 
        
        { /* Texto */ }
        <div>
          <h3>{title}</h3>

          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          
          <button className={buttonClass}>
            <Link to={buttonLink}>{buttonText}</Link>
          </button>
        
        </div>
        
        { /* Imagem */ }
        <div className="relative rounded-2xl overflow-hidden flex items-center justify-center">
          <img 
            src={imageSrc} 
            alt={imageAlt} 
            className="object-contain w-full h-auto max-h-[28rem] md:max-h-[36rem]"
          />
        </div>

      </div>

    </section>
  );
}
