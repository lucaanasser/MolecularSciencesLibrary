import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

export function TextSection({
  title,
  paragraphs,
  buttonText,
  buttonLink,
  buttonVariant,
  imageSrc,
  imageAlt = "",
  reverse = false,
}: {
  title: string;
  paragraphs: string[];
  buttonText: string;
  buttonLink: string;
  buttonVariant: VariantProps<typeof buttonVariants>["variant"];
  imageSrc: string;
  imageAlt?: string;
  reverse?: boolean;
}) {
  return (
    <section>
      <div className={`content-container flex flex-col md:flex-row gap-8 items-center${reverse ? ' md:flex-row-reverse' : ''}`}> 
        
        { /* Imagem */ }
        <div className="relative rounded-2xl overflow-hidden flex items-center justify-center min-w-[40vw]">
          <img 
            src={imageSrc} 
            alt={imageAlt} 
            className="object-contain w-full h-auto md:max-w-[30rem]"
          />
        </div>

        { /* Texto */ }
        <div>
          <h3>{title}</h3>

          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          
          <Button variant={buttonVariant}>
            <Link to={buttonLink}>{buttonText}</Link>
          </Button>
        </div>
        
      </div>

    </section>
  );
}
