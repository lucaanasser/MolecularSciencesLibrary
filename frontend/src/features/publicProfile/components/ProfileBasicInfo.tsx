import { Calendar, MapPin } from "lucide-react";

interface ProfileBasicInfoProps {
  userClass?: string;
}

export const ProfileBasicInfo = ({ userClass }: ProfileBasicInfoProps) => {
  return (
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="space-y-2 text-sm">
        {userClass && (
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-cm-purple" />
            <span className="font-medium">Turma:</span> {userClass}
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4 text-cm-purple" />
          <span className="font-medium">USP</span> - São Paulo
        </div>
      </div>
    </div>
  );
};
