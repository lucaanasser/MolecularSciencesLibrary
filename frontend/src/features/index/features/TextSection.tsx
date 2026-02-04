import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

export function TextSection({
  title,
  paragraphs,
  buttonText,
  buttonLink,
  imageSrc,
  imageAlt = "",
  reverse = false,
}: {
  title: string;
  paragraphs: string[];
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  imageAlt?: string;
  reverse?: boolean;
}) {
  return (
    <section>
      <div className={`content-container flex flex-col md:flex-row gap-4 items-center${reverse ? ' md:flex-row-reverse' : ''}`}> 
        

        {/* Imagem */}
        <div className="relative rounded-2xl flex items-center justify-center w-full md:w-[50%] lg:w-[40%]">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Texto */}
        <div className="w-full md:w-[50%] lg:w-[60%]">
          <h3>{title}</h3>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <Button variant="primary">
            <Link to={buttonLink}>{buttonText}</Link>
          </Button>
        </div>
        
      </div>

    </section>
  );
}
