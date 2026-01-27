import { Edit3 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  name: string;
  profileImage?: string;
  isOwnProfile: boolean;
  isEditing: boolean;
  avatarTimestamp?: number;
}

export const ProfileAvatar = ({ name, profileImage, isOwnProfile, isEditing, avatarTimestamp }: ProfileAvatarProps) => {
  // Add cache-buster for custom uploaded images
  const avatarSrc = profileImage?.includes('/images/user-images/') 
    ? `${profileImage}?t=${avatarTimestamp || Date.now()}` 
    : profileImage;

  return (
    <div className="p-6 bg-gradient-to-b from-cm-purple/5 to-white">
      <div className="relative mx-auto w-48 h-48 mb-4">
        <Avatar className="w-full h-full border-4 border-white shadow-lg">
          {avatarSrc ? (
            <AvatarImage src={avatarSrc} alt={name} />
          ) : null}
          <AvatarFallback className="bg-cm-purple text-white text-6xl font-bebas">
            {name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {isOwnProfile && isEditing && (
          <button className="absolute bottom-2 right-2 w-10 h-10 bg-cm-purple text-white rounded-full shadow-lg hover:bg-cm-purple/90">
            <Edit3 className="w-5 h-5 mx-auto" />
          </button>
        )}
      </div>
      <h1 className="text-2xl font-bebas text-center text-gray-900 mb-2">{name}</h1>
    </div>
  );
};
