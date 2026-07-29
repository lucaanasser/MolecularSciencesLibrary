import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renderiza conteúdo em Markdown (GFM) com suporte a código e LaTeX (KaTeX).
 * react-markdown NÃO interpreta HTML cru por padrão — seguro contra XSS.
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  return (
    <div
      className={`prose prose-sm max-w-none text-gray-700 break-words prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-academic-blue prose-a:text-academic-blue ${
        className || ""
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
