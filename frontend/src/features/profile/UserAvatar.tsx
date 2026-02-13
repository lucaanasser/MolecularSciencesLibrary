import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserAvatarProps {
  name: string;
  profileImage?: string;
  avatarTimestamp?: number;
  sizeClass?: string; // ex: "w-20 h-20"
  fallbackClass?: string; // ex: "text-4xl"
  buttonSizeClass?: string; // ex: "w-8 h-8"
  showEditButton?: boolean;
  onEditClick?: () => void;
}

export function UserAvatar({
  name,
  profileImage,
  avatarTimestamp,
  sizeClass = "w-20 h-20 sm:w-24 sm:h-24",
  fallbackClass = "text-4xl sm:text-6xl",
  buttonSizeClass = "w-8 h-8 p-0.5",
  showEditButton = true,
  onEditClick,
}: UserAvatarProps) {
  const avatarSrc = profileImage?.includes('/images/user-images/')
    ? `${profileImage}?t=${avatarTimestamp || Date.now()}`
    : profileImage;

  return (
    <div className={`relative inline-block`}>
      <div className="relative w-full h-full">
        <Avatar className={`ring-4 ring-default-bg ${sizeClass}`}> 
          {avatarSrc ? (
            <AvatarImage src={avatarSrc} alt={name} />
          ) : null}
          <AvatarFallback className={`primary-bg text-white font-bebas flex items-center justify-center ${fallbackClass}`}>{name?.charAt(0)}</AvatarFallback>
        </Avatar>
        {showEditButton && (
          <Button
            onClick={onEditClick}
            variant="primary"
            size="icon"
            className={`absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 shadow ${buttonSizeClass}`}
            title="Alterar foto"
            style={{zIndex: 10}}
          >
            <Camera className={`${buttonSizeClass}`} />
          </Button>
        )}
      </div>
    </div>
  );
}