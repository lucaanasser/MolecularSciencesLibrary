import { Mail, Linkedin, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactSectionProps {
  emailPublico: string;
  linkedIn: string;
  lattes: string;
  isEditing: boolean;
  onEmailChange: (value: string) => void;
  onLinkedInChange: (value: string) => void;
  onLattesChange: (value: string) => void;
}

export const ContactSection = ({
  emailPublico,
  linkedIn,
  lattes,
  isEditing,
  onEmailChange,
  onLinkedInChange,
  onLattesChange,
}: ContactSectionProps) => {
  if (!isEditing && !emailPublico && !linkedIn && !lattes) {
    return null;
  }

  return (
    <>
      {!isEditing && (emailPublico || linkedIn || lattes) && (
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Contato</h3>
          <div className="space-y-2 text-sm">
            {emailPublico && (
              <a href={`mailto:${emailPublico}`} className="flex items-center gap-2 text-library-purple hover:underline">
                <Mail className="w-4 h-4" />
                Email
              </a>
            )}
            {linkedIn && (
              <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cm-blue hover:underline">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}
            {lattes && (
              <a href={lattes} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cm-green hover:underline">
                <FileText className="w-4 h-4" />
                Lattes
              </a>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="px-6 py-4 bg-gray-50 space-y-3">
          <div>
            <Label className="text-xs text-gray-600">Email público</Label>
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={emailPublico}
              onChange={(e) => onEmailChange(e.target.value)}
              className="text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">LinkedIn</Label>
            <Input
              placeholder="URL do LinkedIn"
              value={linkedIn}
              onChange={(e) => onLinkedInChange(e.target.value)}
              className="text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Lattes</Label>
            <Input
              placeholder="URL do Lattes"
              value={lattes}
              onChange={(e) => onLattesChange(e.target.value)}
              className="text-sm mt-1"
            />
          </div>
        </div>
      )}
    </>
  );
};
