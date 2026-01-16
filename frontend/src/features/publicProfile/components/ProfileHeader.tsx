import { useState } from "react";
import { Edit3, Camera, UserPlus, UserCheck, Save, Mail, Linkedin, FileText, Github, Globe, X, Plus, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProfileTag, SUGGESTED_TAGS } from "@/types/publicProfile";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProfileHeaderProps {
  user: {
    name: string;
    profile_image?: string;
    class?: string;
  };
  isOwnProfile: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isFollowing: boolean;
  isPublic: boolean;
  tags: ProfileTag[];
  seguindo: Array<{ id: number; nome: string; turma: string; avatar: string | null }>;
  emailPublico: string;
  linkedIn: string;
  lattes: string;
  github?: string;
  site?: string;
  onEdit: () => void;
  onSave: () => void;
  onFollow: () => void;
  onPublicToggle: (value: boolean) => void;
  onAddTag: (label: string, category: ProfileTag["category"]) => void;
  onRemoveTag: (tagId: string) => void;
  onEmailChange: (value: string) => void;
  onLinkedInChange: (value: string) => void;
  onLattesChange: (value: string) => void;
}

const TAG_STYLES = {
  "grande-area": "bg-cm-purple/10 text-cm-purple border-cm-purple/30",
  "area": "bg-cm-blue/10 text-cm-blue border-cm-blue/30",
  "subarea": "bg-cm-green/10 text-cm-green border-cm-green/30",
  "custom": "bg-cm-orange/10 text-cm-orange border-cm-orange/30",
};

export const ProfileHeader = ({
  user,
  isOwnProfile,
  isEditing,
  isSaving,
  isFollowing,
  isPublic,
  tags,
  seguindo,
  emailPublico,
  linkedIn,
  lattes,
  github,
  site,
  onEdit,
  onSave,
  onFollow,
  onPublicToggle,
  onAddTag,
  onRemoveTag,
  onEmailChange,
  onLinkedInChange,
  onLattesChange,
}: ProfileHeaderProps) => {
  const [showFollowing, setShowFollowing] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagCategory, setTagCategory] = useState<ProfileTag["category"]>("area");

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim(), tagCategory);
      setNewTag("");
    }
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-48 sm:h-56 bg-cm-purple relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }} />
        
        {isOwnProfile && isEditing && (
          <button className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm backdrop-blur-sm transition-colors">
            <Camera className="w-4 h-4" />
            Alterar banner
          </button>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-36 h-36 sm:w-40 sm:h-40 border-4 border-white shadow-xl">
              {user.profile_image ? (
                <AvatarImage src={user.profile_image} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-cm-blue text-white text-5xl font-bebas">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && isEditing && (
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-cm-purple text-white rounded-full shadow-lg hover:bg-cm-purple/90 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 sm:pt-12">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bebas text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-gray-600">
                  {user.class && (
                    <span className="text-sm">Turma {user.class}</span>
                  )}
                  <span className="text-gray-300">•</span>
                  <span className="text-sm">Ciências Moleculares - USP</span>
                </div>
                
                {/* Social Links */}
                <div className="flex items-center gap-2 mt-3">
                  {emailPublico && (
                    <a href={`mailto:${emailPublico}`} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-cm-purple hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {linkedIn && (
                    <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-cm-blue hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {lattes && (
                    <a href={lattes} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-cm-green hover:text-white transition-colors">
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                  {github && (
                    <a href={github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {site && (
                    <a href={site} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-cm-orange hover:text-white transition-colors">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  
                  {/* Following Button (Instagram style) */}
                  {isOwnProfile && seguindo.length > 0 && (
                    <Popover open={showFollowing} onOpenChange={setShowFollowing}>
                      <PopoverTrigger asChild>
                        <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-cm-purple/10 hover:text-cm-purple transition-colors relative">
                          <Users className="w-4 h-4" />
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-cm-purple text-white text-[10px] rounded-full flex items-center justify-center">
                            {seguindo.length}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" align="start">
                        <div className="p-3 border-b border-gray-100">
                          <h4 className="font-semibold text-sm text-gray-900">Seguindo</h4>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {seguindo.map((pessoa) => (
                            <div key={pessoa.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                              <Avatar className="w-8 h-8">
                                {pessoa.avatar ? (
                                  <AvatarImage src={pessoa.avatar} alt={pessoa.nome} />
                                ) : null}
                                <AvatarFallback className="bg-cm-blue text-white text-xs">
                                  {pessoa.nome?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{pessoa.nome}</p>
                                <p className="text-xs text-gray-500">{pessoa.turma}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {!isOwnProfile ? (
                  <Button
                    onClick={onFollow}
                    size="lg"
                    className={cn(
                      "rounded-full px-6",
                      isFollowing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-cm-purple text-white hover:bg-cm-purple/90"
                    )}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Seguindo
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Seguir
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    {isEditing ? (
                      <Button
                        onClick={onSave}
                        disabled={isSaving}
                        size="lg"
                        className="rounded-full px-6 bg-cm-green text-white hover:bg-cm-green/90"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Salvando..." : "Salvar"}
                      </Button>
                    ) : (
                      <Button
                        onClick={onEdit}
                        size="lg"
                        className="rounded-full px-6 bg-cm-purple text-white hover:bg-cm-purple/90"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar perfil
                      </Button>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch id="public" checked={isPublic} onCheckedChange={onPublicToggle} />
                      <Label htmlFor="public" className="text-sm text-gray-600 cursor-pointer">Público</Label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tags Section - Horizontal */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={cn("text-xs font-medium border", TAG_STYLES[tag.category || "custom"])}
                >
                  {tag.label}
                  {isEditing && (
                    <button onClick={() => onRemoveTag(tag.id)} className="ml-1 hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              
              {isEditing && (
                <Popover open={showTagEditor} onOpenChange={setShowTagEditor}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded-full hover:border-cm-purple hover:text-cm-purple transition-colors">
                      <Plus className="w-3 h-3" />
                      Adicionar tag
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-600">Categoria</Label>
                        <div className="flex gap-2 mt-2">
                          {[
                            { value: "grande-area", label: "Grande Área", color: "cm-purple" },
                            { value: "area", label: "Área", color: "cm-blue" },
                            { value: "subarea", label: "Subárea", color: "cm-green" },
                          ].map((cat) => (
                            <button
                              key={cat.value}
                              onClick={() => setTagCategory(cat.value as ProfileTag["category"])}
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
                          {(tagCategory === "grande-area" ? SUGGESTED_TAGS.grandeArea.slice(0, 4) :
                            tagCategory === "area" ? SUGGESTED_TAGS.area.slice(0, 6) :
                            SUGGESTED_TAGS.subarea.slice(0, 6)).map((sug) => (
                            <button
                              key={sug}
                              onClick={() => onAddTag(sug, tagCategory)}
                              disabled={!!tags.find((t) => t.label === sug)}
                              className={cn(
                                "text-xs px-2 py-1 rounded-full border transition-colors",
                                tags.find((t) => t.label === sug)
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-white hover:bg-gray-50 text-gray-600"
                              )}
                            >
                              + {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Edit Contact Section */}
            {isEditing && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Links de contato</h4>
                <div className="grid sm:grid-cols-3 gap-3">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
