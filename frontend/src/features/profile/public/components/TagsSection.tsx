import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { ProfileTag as Tag } from "@/types/publicProfile";

interface TagsSectionProps {
  tags: Tag[];
  isEditing: boolean;
  onRemoveTag: (tagId: string) => void;
  onAddTag: (label: string, category: Tag["category"]) => void;
  suggestedTags: {
    grandeArea: string[];
    area: string[];
    subarea: string[];
  };
}

const TAG_STYLES = {
  "grande-area": "bg-library-purple/10 text-library-purple border-library-purple/30",
  "area": "bg-cm-blue/10 text-cm-blue border-cm-blue/30",
  "subarea": "bg-cm-green/10 text-cm-green border-cm-green/30",
  "custom": "bg-cm-orange/10 text-cm-orange border-cm-orange/30",
};

const TagBadge = ({ tag, isEditing, onRemove }: { tag: Tag; isEditing: boolean; onRemove: (id: string) => void }) => (
  <Badge
    variant="default"
    className={cn(
      "text-xs font-medium border px-2 py-1 rounded-full flex items-center gap-1 transition-colors",
      TAG_STYLES[tag.category || "custom"]
    )}
  >
    {tag.label}
    {isEditing && (
      <button onClick={() => onRemove(tag.id)} className="hover:opacity-70" aria-label="Remover tag">
        <X className="w-3 h-3" />
      </button>
    )}
  </Badge>
);

const TagSuggestionButton = ({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "text-xs px-2 py-1 rounded-full border transition-colors",
      disabled
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-white hover:bg-gray-50 text-gray-600"
    )}
    aria-label={disabled ? `Tag já adicionada: ${label}` : `Adicionar tag: ${label}`}
  >
    + {label}
  </button>
);

export const TagsSection: React.FC<TagsSectionProps> = ({ tags, isEditing, onRemoveTag, onAddTag, suggestedTags }) => {
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagCategory, setTagCategory] = useState<Tag["category"]>("area");

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim(), tagCategory);
      setNewTag("");
    }
  };

  const categoryOptions = [
    { value: "grande-area", label: "Grande Área", color: "library-purple" },
    { value: "area", label: "Área", color: "cm-blue" },
    { value: "subarea", label: "Subárea", color: "cm-green" },
  ];

  const suggestions = tagCategory === "grande-area"
    ? suggestedTags.grandeArea.slice(0, 4)
    : tagCategory === "area"
      ? suggestedTags.area.slice(0, 6)
      : suggestedTags.subarea.slice(0, 6);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} isEditing={isEditing} onRemove={onRemoveTag} />
      ))}
      {isEditing && (
        <Popover open={showTagEditor} onOpenChange={setShowTagEditor}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="xs">
              <Plus className="w-3 h-3" />
              Adicionar tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-gray-600">Categoria</Label>
                <div className="flex gap-2 mt-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setTagCategory(cat.value as Tag["category"])}
                      className={cn(
                        "px-3 py-1 text-xs rounded-full border transition-colors",
                        tagCategory === cat.value
                          ? `bg-${cat.color} text-white border-${cat.color}`
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Nova tag</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Digite..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    className="text-sm"
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Sugestões</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {suggestions.map((sug) => (
                    <TagSuggestionButton
                      key={sug}
                      label={sug}
                      disabled={!!tags.find((t) => t.label === sug)}
                      onClick={() => onAddTag(sug, tagCategory)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
