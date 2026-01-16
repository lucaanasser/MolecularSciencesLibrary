import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ProfileTag, SUGGESTED_TAGS } from "@/types/publicProfile";
import { cn } from "@/lib/utils";

interface TagSectionProps {
  category: "grande-area" | "area" | "subarea";
  title: string;
  tags: ProfileTag[];
  isEditing: boolean;
  newTag: string;
  activeCategory: string | null;
  onAddClick: () => void;
  onRemoveTag: (tagId: string) => void;
  onNewTagChange: (value: string) => void;
  onAddTag: () => void;
  onAddSuggestedTag: (label: string, category: ProfileTag["category"]) => void;
}

const TAG_COLORS = {
  "grande-area": { bg: "bg-cm-purple", text: "text-cm-purple" },
  "area": { bg: "bg-cm-blue", text: "text-cm-blue" },
  "subarea": { bg: "bg-cm-green", text: "text-cm-green" },
};

export const TagSection = ({
  category,
  title,
  tags,
  isEditing,
  newTag,
  activeCategory,
  onAddClick,
  onRemoveTag,
  onNewTagChange,
  onAddTag,
  onAddSuggestedTag,
}: TagSectionProps) => {
  const filteredTags = tags.filter((t) => t.category === category);
  const colors = TAG_COLORS[category];
  const isActive = activeCategory === category;

  const getSuggestions = () => {
    switch (category) {
      case "grande-area": return SUGGESTED_TAGS.grandeArea.slice(0, 3);
      case "area": return SUGGESTED_TAGS.area.slice(0, 5);
      case "subarea": return SUGGESTED_TAGS.subarea.slice(0, 6);
    }
  };

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase">{title}</h3>
          {isEditing && (
            <button
              onClick={onAddClick}
              className={cn("hover:opacity-80", colors.text)}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <Badge key={tag.id} className={cn(colors.bg, "text-white text-xs")}>
                {tag.label}
                {isEditing && (
                  <button onClick={() => onRemoveTag(tag.id)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">Nenhuma {title.toLowerCase()}</span>
          )}
        </div>
      </div>

      {isEditing && isActive && (
        <div className="px-6 py-4 bg-gray-50">
          <Label className="text-xs text-gray-600 mb-2 block">Adicionar tag</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Digite..."
              value={newTag}
              onChange={(e) => onNewTagChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddTag()}
              className="text-sm"
            />
            <Button onClick={onAddTag} size="sm" className={colors.bg}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-gray-500">Sugestões:</p>
            <div className="flex flex-wrap gap-1">
              {getSuggestions().map((sug) => (
                <button
                  key={sug}
                  onClick={() => onAddSuggestedTag(sug, category)}
                  disabled={!!tags.find((t) => t.label === sug)}
                  className={cn(
                    "text-xs px-2 py-1 rounded border transition-colors",
                    tags.find((t) => t.label === sug)
                      ? "bg-gray-100 text-gray-400 cursor-default"
                      : "bg-white hover:border-current"
                  )}
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
