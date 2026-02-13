import { Camera } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BannerOption {
  name: string;
  label: string;
  image: string;
}

interface BannerSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bannerOptions: BannerOption[];
  onSelect: (bannerName: string) => void;
}

export function BannerSelectorModal({
  open,
  onOpenChange,
  bannerOptions,
  onSelect,
}: BannerSelectorModalProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button className="absolute top-[5vh] right-[5vw] xl:right-[15vw] flex items-center gap-2 px-2 sm:px-3 py-2 bg-default-bg/50 hover:bg-default-bg/70 text-black rounded-lg prose-xs backdrop-blur-sm transition-colors">
          <Camera className="w-5 h-5" />
          <span className="hidden sm:inline">Alterar banner</span>
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-700">Escolha um banner</h4>
          <div className="grid grid-cols-3 gap-3">
            {bannerOptions.map((banner) => (
              <button
                key={banner.name}
                onClick={() => onSelect(banner.name)}
                className="flex flex-col items-center gap-2 p-2 rounded-lg border-2 border-gray-200 hover:border-library-purple hover:bg-gray-50 transition-all"
              >
                <div className="w-full h-16 rounded-md overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">{banner.label}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
