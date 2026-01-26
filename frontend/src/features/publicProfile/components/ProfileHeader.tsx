import { useState, useRef, useCallback, useEffect } from "react";
import { Edit3, Camera, UserPlus, UserCheck, Save, Mail, Linkedin, FileText, Github, Globe, X, Plus, Users, Upload, ZoomIn, ZoomOut } from "lucide-react";
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
  onGithubChange: (value: string) => void;
  onAvatarUpload?: (file: File) => Promise<void>;
  onBannerChange?: (bannerChoice: string) => Promise<void>;
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
  onGithubChange,
  onAvatarUpload,
  onBannerChange,
}: ProfileHeaderProps) => {
  const [showFollowing, setShowFollowing] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagCategory, setTagCategory] = useState<ProfileTag["category"]>("area");
  const [showBannerSelector, setShowBannerSelector] = useState(false);

  // Avatar upload/crop
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleAvatarClick = () => setShowAvatarModal(true);
  
  const processFile = (file: File) => {
    if (file && file.size <= 5 * 1024 * 1024 && file.type.startsWith("image/")) {
      setAvatarUrl(URL.createObjectURL(file));
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      alert("Selecione uma imagem de até 5MB (PNG ou JPG).");
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  // Funções para arrastar a imagem dentro do preview
  const handleImageMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleImageMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingImage) return;
    const maxOffset = 100 * (zoom - 1);
    const newX = Math.max(-maxOffset, Math.min(maxOffset, e.clientX - dragStart.x));
    const newY = Math.max(-maxOffset, Math.min(maxOffset, e.clientY - dragStart.y));
    setPosition({ x: newX, y: newY });
  }, [isDraggingImage, dragStart, zoom]);

  const handleImageMouseUp = useCallback(() => {
    setIsDraggingImage(false);
  }, []);

  // Touch events para mobile
  const handleImageTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDraggingImage(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleImageTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingImage) return;
    const touch = e.touches[0];
    const maxOffset = 100 * (zoom - 1);
    const newX = Math.max(-maxOffset, Math.min(maxOffset, touch.clientX - dragStart.x));
    const newY = Math.max(-maxOffset, Math.min(maxOffset, touch.clientY - dragStart.y));
    setPosition({ x: newX, y: newY });
  }, [isDraggingImage, dragStart, zoom]);

  // Efeito para adicionar/remover listeners globais
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingImage) return;
      const maxOffset = 100 * (zoom - 1);
      const newX = Math.max(-maxOffset, Math.min(maxOffset, e.clientX - dragStart.x));
      const newY = Math.max(-maxOffset, Math.min(maxOffset, e.clientY - dragStart.y));
      setPosition({ x: newX, y: newY });
    };
    const handleGlobalMouseUp = () => setIsDraggingImage(false);
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDraggingImage) return;
      const touch = e.touches[0];
      const maxOffset = 100 * (zoom - 1);
      const newX = Math.max(-maxOffset, Math.min(maxOffset, touch.clientX - dragStart.x));
      const newY = Math.max(-maxOffset, Math.min(maxOffset, touch.clientY - dragStart.y));
      setPosition({ x: newX, y: newY });
    };
    const handleGlobalTouchEnd = () => setIsDraggingImage(false);

    if (isDraggingImage) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("touchmove", handleGlobalTouchMove);
      window.addEventListener("touchend", handleGlobalTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [isDraggingImage, dragStart, zoom]);

  const handleAvatarSave = async () => {
    if (!avatarUrl || !onAvatarUpload) return;

    try {
      // Convert data URL to File
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      const file = new File([blob], "avatar.png", { type: "image/png" });
      
      await onAvatarUpload(file);
      
      // Close modal and reset
      setShowAvatarModal(false);
      setAvatarUrl(null);
      setPosition({ x: 0, y: 0 });
      setZoom(1);
    } catch (err) {
      console.error('Erro ao salvar avatar:', err);
      alert('Erro ao salvar avatar');
    }
  };

  const handleCloseModal = () => {
    setShowAvatarModal(false);
    setAvatarUrl(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim(), tagCategory);
      setNewTag("");
    }
  };

  const handleBannerSelect = async (bannerChoice: string) => {
    if (onBannerChange) {
      try {
        await onBannerChange(bannerChoice);
        setShowBannerSelector(false);
      } catch (err) {
        console.error('Erro ao alterar banner:', err);
      }
    }
  };

  const BANNER_OPTIONS = [
    { name: "purple", color: "#7C3AED", label: "Roxo" },
    { name: "blue", color: "#3B82F6", label: "Azul" },
    { name: "green", color: "#10B981", label: "Verde" },
    { name: "red", color: "#EF4444", label: "Vermelho" },
    { name: "orange", color: "#F97316", label: "Laranja" },
    { name: "yellow", color: "#EAB308", label: "Amarelo" },
  ];

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-48 sm:h-56 bg-cm-bg relative overflow-hidden">
        <img
          src="/images/background-images/purple_background.png"
          alt="Banner mockado"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-cm-bg" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }} />
        {isOwnProfile && isEditing && (
          <Popover open={showBannerSelector} onOpenChange={setShowBannerSelector}>
            <PopoverTrigger asChild>
              <button className="absolute top-8 right-10 flex items-center gap-2 px-3 py-2 bg-cm-bg/50 hover:bg-cm-bg/70 text-black rounded-lg text-sm backdrop-blur-sm transition-colors">
                <Camera className="w-4 h-4" />
                Alterar banner
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Escolha uma cor para o banner</h4>
                <div className="grid grid-cols-3 gap-3">
                  {BANNER_OPTIONS.map((banner) => (
                    <button
                      key={banner.name}
                      onClick={() => handleBannerSelect(banner.name)}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all"
                    >
                      <div 
                        className="w-full h-12 rounded-md"
                        style={{ backgroundColor: banner.color }}
                      />
                      <span className="text-xs text-gray-600">{banner.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
              <AvatarFallback className="bg-cm-academic text-white text-5xl font-bebas">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && isEditing && (
              <button
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-cm-purple text-white rounded-full shadow-lg hover:bg-cm-purple/90 flex items-center justify-center z-10"
                style={{ marginTop: "-16px" }}
                onClick={handleAvatarClick}
              >
                <Camera className="w-6 h-6" />
              </button>
            )}
            {/* Modal de upload/crop */}
            {showAvatarModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                  <button className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors" onClick={handleCloseModal}>
                    <X className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Alterar foto de perfil</h3>
                  
                  {!avatarUrl ? (
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer",
                        isDragging ? "border-cm-purple bg-cm-purple/10" : "border-gray-300 hover:border-cm-purple/50"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => inputRef.current?.click()}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                        onChange={handleAvatarFile}
                      />
                      <div className="w-16 h-16 rounded-full bg-cm-purple/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-cm-purple" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          {isDragging ? "Solte a imagem aqui" : "Arraste uma imagem ou clique para selecionar"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG ou JPG, máximo 5MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      {/* Preview com zoom e drag */}
                      <div 
                        ref={imageContainerRef}
                        className="relative w-64 h-64 bg-gray-100 rounded-xl overflow-hidden border-4 border-gray-200 cursor-grab active:cursor-grabbing select-none"
                        onMouseDown={handleImageMouseDown}
                        onTouchStart={handleImageTouchStart}
                      >
                        <img
                          src={avatarUrl}
                          alt="Preview"
                          draggable={false}
                          className="absolute w-full h-full object-cover pointer-events-none"
                          style={{
                            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                            transformOrigin: "center center",
                          }}
                        />
                        {/* Guia visual de área de corte */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-white/50 rounded-xl" />
                      </div>
                      <p className="text-xs text-gray-500">Arraste para posicionar a imagem</p>
                      
                      {/* Controle de Zoom */}
                      <div className="flex items-center gap-3 w-full max-w-xs">
                        <ZoomOut className="w-4 h-4 text-gray-500" />
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.05}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cm-purple"
                        />
                        <ZoomIn className="w-4 h-4 text-gray-500" />
                      </div>
                      
                      <div className="flex gap-3 mt-2 w-full">
                        <Button onClick={handleAvatarSave} className="flex-1 bg-cm-green hover:bg-cm-green/90 text-white">
                          Salvar
                        </Button>
                        <Button onClick={() => setAvatarUrl(null)} variant="outline" className="flex-1">
                          Trocar imagem
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-8 sm:pt-12">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bebas text-gray-900 mt-4">{user.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-gray-600">
                  {user.class && (
                    <span className="text-sm">Turma {user.class}</span>
                  )}
                </div>
                
                {/* Social Links */}
                <div className="flex items-center gap-2 mt-3">
                  {emailPublico && (
                    <a href={`mailto:${emailPublico}`} className="relative group p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-cm-red hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">Email</span>
                    </a>
                  )}
                  {linkedIn && (
                    <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="relative group p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-cm-blue hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">LinkedIn</span>
                    </a>
                  )}
                  {lattes && (
                    <a href={lattes} target="_blank" rel="noopener noreferrer" className="relative group p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-cm-green hover:text-white transition-colors">
                      <FileText className="w-4 h-4" />
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">Lattes</span>
                    </a>
                  )}
                  {github && (
                    <a href={github} target="_blank" rel="noopener noreferrer" className="relative group p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors">
                      <Github className="w-4 h-4" />
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">GitHub</span>
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
                <div className="grid sm:grid-cols-4 gap-3">
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
                  <div>
                    <Label className="text-xs text-gray-600">GitHub</Label>
                    <Input
                      placeholder="URL do GitHub"
                      value={github || ""}
                      onChange={(e) => onGithubChange && onGithubChange(e.target.value)}
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