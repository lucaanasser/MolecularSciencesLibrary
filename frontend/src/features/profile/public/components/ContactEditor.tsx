import { Input } from "@/components/ui/input";

interface ContactSectionProps {
  emailPublico: string;
  linkedIn: string;
  lattes: string;
  github: string;
  isEditing: boolean;
  onEmailChange: (value: string) => void;
  onLinkedInChange: (value: string) => void;
  onLattesChange: (value: string) => void;
  onGithubChange: (value: string) => void;
}

export const ContactEditor = ({
  emailPublico,
  linkedIn,
  lattes,
  github,
  isEditing,
  onEmailChange,
  onLinkedInChange,
  onLattesChange,
  onGithubChange,
}: ContactSectionProps) => {
  if (!isEditing && !emailPublico && !linkedIn && !lattes && !github) {
    return null;
  }

  return (
    <>
      {isEditing && (
        <>
        <p className="prose-sm mt-2 mb-2">Dados públicos para contato:</p>
        <div className="flex flex-row gap-2">
          <div>
            <Input
              type="email"
              placeholder="Email público"
              value={emailPublico}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder="URL do LinkedIn"
              value={linkedIn}
              onChange={(e) => onLinkedInChange(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder="URL do Lattes"
              value={lattes}
              onChange={(e) => onLattesChange(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder="URL do Github"
              value={github}
              onChange={(e) => onGithubChange(e.target.value)}
            />
          </div>
        </div>
        </>
      )}
    </>
  );
};
