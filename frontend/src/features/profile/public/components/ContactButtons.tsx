
import { Mail, Linkedin, FileText, Github } from "lucide-react";
import React from "react";

interface ContactLinksProps {
  emailPublico?: string;
  linkedIn?: string;
  lattes?: string;
  github?: string;
  children?: React.ReactNode;
}

interface ContactLinkButtonProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  hoverClass: string;
  mail?: boolean;
}

const ContactLinkButton: React.FC<ContactLinkButtonProps> = ({ href, label, icon, hoverClass, mail }) => (
  <a
    href={mail ? `mailto:${href}` : href}
    target={mail ? undefined : "_blank"}
    rel={mail ? undefined : "noopener noreferrer"}
    className={`relative group p-2 rounded-full bg-gray-200 text-gray-600 hover:text-white transition-colors ${hoverClass}`}
  >
    {icon}
    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{label}</span>
  </a>
);

export const ContactLinks: React.FC<ContactLinksProps> = ({ emailPublico, linkedIn, lattes, github, children }) => (
  <div className="flex items-center gap-2 mt-2">
    {emailPublico && (
      <ContactLinkButton
        href={emailPublico}
        label="Email"
        icon={<Mail className="w-4 h-4" />}
        hoverClass="hover:bg-cm-red"
        mail
      />
    )}
    {linkedIn && (
      <ContactLinkButton
        href={linkedIn}
        label="LinkedIn"
        icon={<Linkedin className="w-4 h-4" />}
        hoverClass="hover:bg-cm-blue"
      />
    )}
    {lattes && (
      <ContactLinkButton
        href={lattes}
        label="Lattes"
        icon={<FileText className="w-4 h-4" />}
        hoverClass="hover:bg-cm-green"
      />
    )}
    {github && (
      <ContactLinkButton
        href={github}
        label="GitHub"
        icon={<Github className="w-4 h-4" />}
        hoverClass="hover:bg-gray-900"
      />
    )}
    {children}
  </div>
);
