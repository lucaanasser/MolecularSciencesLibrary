import { useCallback, useEffect, useState, useRef } from "react";
import { X, Upload, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cropper, { ReactCropperElement } from "react-cropper";
import ProfileService from "@/services/ProfileService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";

type ProfilePhotoPreset = "272" | "544";

const PHOTO_PRESETS: Record<ProfilePhotoPreset, { size: number; maxBytes: number; label: string }> = {
  "272": {
    size: 272,
    maxBytes: 50 * 1024,
    label: "272 x 272 (max 50KB)",
  },
  "544": {
    size: 544,
    maxBytes: 100 * 1024,
    label: "544 x 544 (max 100KB)",
  },
};

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageFile: File, rosterName?: string) => Promise<void>;
  onSelectDefault: (imagePath: string) => Promise<void>;
  onRemoveAvatar?: () => Promise<void>;
  currentImage?: string;
  userId?: number;
}

const DEFAULT_AVATARS = [
  "/images/avatars/bio.png",
  "/images/avatars/cmp.png",
  "/images/avatars/fis.png",
  "/images/avatars/mat.png",
  "/images/avatars/qui.png",
  "/images/avatars/test_qui.png",
  "/images/avatars/test_mat.png",
];

export const AvatarSelectorModal = ({
  isOpen,
  onClose,
  onSelectImage,
  onSelectDefault,
  onRemoveAvatar,
  currentImage,
  userId,
}: AvatarSelectorModalProps) => {
  const [selectedTab, setSelectedTab] = useState<"upload" | "default">("default");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ProfilePhotoPreset>("272");
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCustomAvatar = Boolean(currentImage && String(currentImage).includes('/images/user-images/'));
  
  // Avatar naming (roster selection)
  const [rosterOptions, setRosterOptions] = useState<string[]>([]);
  const [selectedRosterName, setSelectedRosterName] = useState("");
  const [showRosterSelection, setShowRosterSelection] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  const applyPresetCropBoxSize = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const container = cropper.getContainerData();
    if (!container?.width || !container?.height) return;

    // Use different ratios for each preset to make the difference visible
    const ratio = selectedPreset === "544" ? 0.75 : 0.55;
    const side = Math.floor(Math.min(container.width, container.height) * ratio);
    const left = Math.floor((container.width - side) / 2);
    const top = Math.floor((container.height - side) / 2);

    cropper.setCropBoxData({
      width: side,
      height: side,
      left,
      top,
    });
  }, [selectedPreset]);

  useEffect(() => {
    applyPresetCropBoxSize();
  }, [applyPresetCropBoxSize, uploadedImage]);

  useEffect(() => {
    if (!showRosterSelection || !userId) return;

    let isMounted = true;
    setRosterLoading(true);

    ProfileService.getAvatarRosterOptions(userId)
      .then(data => {
        if (!isMounted) return;
        const students = Array.isArray(data?.students) ? data.students : [];
        setRosterOptions(students);
        // If only one option, auto-select it
        if (students.length === 1) {
          setSelectedRosterName(students[0]);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Erro ao carregar opções de roster:', err);
        }
      })
      .finally(() => {
        if (isMounted) setRosterLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showRosterSelection, userId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande! Máximo 5MB.");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      alert("Formato invalido. Use JPG, JPEG ou PNG.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const compressCanvasToJpeg = async (canvas: HTMLCanvasElement, maxBytes: number): Promise<Blob | null> => {
    const qualitySteps = [0.92, 0.86, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5, 0.44, 0.38, 0.32, 0.26, 0.2];

    for (const quality of qualitySteps) {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), "image/jpeg", quality);
      });

      if (blob && blob.size <= maxBytes) {
        return blob;
      }
    }

    return null;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCropAndSave = async () => {
    console.log("🔵 [AvatarSelectorModal] handleCropAndSave CHAMADO");
    console.log("🔵 [AvatarSelectorModal] cropperRef.current:", cropperRef.current);
    console.log("🔵 [AvatarSelectorModal] cropper:", cropperRef.current?.cropper);
    
    if (!cropperRef.current?.cropper) {
      console.error("🔴 [AvatarSelectorModal] Cropper não encontrado!");
      return;
    }

    try {
      console.log("🔵 [AvatarSelectorModal] Iniciando crop e save");
      
      const preset = PHOTO_PRESETS[selectedPreset];
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: preset.size,
        height: preset.size,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      console.log("🔵 [AvatarSelectorModal] Canvas criado");

      const compressedBlob = await compressCanvasToJpeg(canvas, preset.maxBytes);
      if (!compressedBlob) {
        alert(`Nao foi possivel comprimir para ${preset.label}. Tente outro recorte ou a opcao 272 x 272.`);
        return;
      }

      console.log("🔵 [AvatarSelectorModal] Blob comprimido:", compressedBlob.size, "bytes");

      const fileName = selectedPreset === "544" ? "avatar-profile@2x.jpg" : "avatar-profile.jpg";
      const file = new File([compressedBlob], fileName, { type: "image/jpeg" });
      const sizeInKB = Math.round(compressedBlob.size / 1024);
      const maxKB = Math.round(preset.maxBytes / 1024);
      setCompressionInfo(`✅ Imagem pronta: ${preset.size}x${preset.size}px, ${sizeInKB}KB (limite: ${maxKB}KB).`);

      // Check if we need to ask for roster name
      if (rosterOptions.length > 1) {
        console.log("🔵 [AvatarSelectorModal] Múltiplas opções de roster encontradas");
        setPendingImageFile(file);
        setShowRosterSelection(true);
      } else if (rosterOptions.length === 1) {
        console.log("🔵 [AvatarSelectorModal] Uma opção de roster encontrada, usando automaticamente");
        setSaving(true);
        await onSelectImage(file, rosterOptions[0]);
        setUploadedImage(null);
        setCompressionInfo(null);
        onClose();
        setSaving(false);
      } else {
        // If no roster options available, try to fetch them
        if (!userId) {
          console.error("🔴 [AvatarSelectorModal] userId não disponível");
          alert("Erro: userId não encontrado");
          return;
        }
        setPendingImageFile(file);
        setShowRosterSelection(true);
      }
    } catch (err) {
      console.error("🔴 [AvatarSelectorModal] Erro ao salvar avatar:", err);
      alert("Erro ao salvar avatar");
    }
  };

  const handleRosterNameConfirm = async () => {
    if (!selectedRosterName || !pendingImageFile) {
      alert("Selecione seu nome na lista");
      return;
    }

    setSaving(true);
    try {
      console.log("🔵 [AvatarSelectorModal] Enviando imagem com rosterName:", selectedRosterName);
      await onSelectImage(pendingImageFile, selectedRosterName);
      
      console.log("🟢 [AvatarSelectorModal] Upload concluído");
      setUploadedImage(null);
      setCompressionInfo(null);
      setPendingImageFile(null);
      setShowRosterSelection(false);
      onClose();
    } catch (err) {
      console.error("🔴 [AvatarSelectorModal] Erro ao enviar avatar:", err);
      alert("Erro ao enviar avatar");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDefault = async (imagePath: string) => {
    setSaving(true);
    try {
      await onSelectDefault(imagePath);
      onClose();
    } catch (err) {
      console.error("Erro ao selecionar avatar padrão:", err);
      alert("Erro ao selecionar avatar");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setUploadedImage(null);
    setCompressionInfo(null);
    onClose();
  };

  const handleRemoveAvatar = async () => {
    if (!onRemoveAvatar) return;
    const shouldRemove = window.confirm("Deseja excluir sua foto personalizada atual?");
    if (!shouldRemove) return;

    setSaving(true);
    try {
      await onRemoveAvatar();
      onClose();
    } catch (err) {
      console.error("Erro ao remover avatar:", err);
      alert("Erro ao remover avatar");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bebas text-gray-900">Escolher Foto de Perfil</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab("default")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              selectedTab === "default"
                ? "bg-library-purple text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Avatares Padrão
          </button>
          <button
            onClick={() => setSelectedTab("upload")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              selectedTab === "upload"
                ? "bg-library-purple text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Fazer Upload
          </button>
        </div>

        {hasCustomAvatar && onRemoveAvatar && (
          <div className="px-6 py-3 border-b border-gray-200 flex justify-end">
            <Button
              onClick={handleRemoveAvatar}
              disabled={saving}
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir foto atual
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === "default" && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {DEFAULT_AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => handleSelectDefault(avatar)}
                  disabled={saving}
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-library-purple transition-all hover:scale-105 disabled:opacity-50"
                >
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  {currentImage === avatar && (
                    <div className="absolute inset-0 bg-library-purple/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-library-purple rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedTab === "upload" && (
            <div className="space-y-4">
              {!uploadedImage ? (
                <div className="text-center py-12">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={handleUploadClick}
                    className="bg-library-purple hover:bg-library-purple/90 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher Imagem
                  </Button>
                  <p className="text-sm text-gray-500 mt-4">
                    Escolha PNG/JPG e depois selecione o recorte oficial de PR
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-800 mb-2">Selecione um formato:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {(Object.keys(PHOTO_PRESETS) as ProfilePhotoPreset[]).map((presetKey) => {
                      const preset = PHOTO_PRESETS[presetKey];
                      const selected = selectedPreset === presetKey;

                      return (
                        <button
                          key={presetKey}
                          type="button"
                          onClick={() => setSelectedPreset(presetKey)}
                          className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                            selected
                              ? "border-library-purple bg-library-purple/10 text-library-purple"
                              : "border-gray-300 bg-white text-gray-700 hover:border-library-purple/50"
                          }`}
                          disabled={saving}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ maxHeight: "320px" }}>
                    <Cropper
                      ref={cropperRef}
                      src={uploadedImage}
                      style={{ height: 320, width: "100%" }}
                      aspectRatio={1}
                      guides={true}
                      viewMode={1}
                      dragMode="move"
                      cropBoxMovable={false}
                      cropBoxResizable={false}
                      background={true}
                      responsive={true}
                      autoCropArea={selectedPreset === "544" ? 0.75 : 0.55}
                      center={true}
                      highlight={true}
                      zoomOnWheel={true}
                      toggleDragModeOnDblclick={false}
                      ready={applyPresetCropBoxSize}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Arraste a imagem para posicionar • Use a roda do mouse para zoom
                  </p>
                  {compressionInfo && (
                    <p className="text-xs text-green-700 text-center">{compressionInfo}</p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCropAndSave}
                      disabled={saving}
                      className="flex-1 bg-library-purple hover:bg-library-purple/90 text-white"
                    >
                      {saving ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button
                      onClick={() => setUploadedImage(null)}
                      variant="default"
                      className="flex-1"
                      disabled={saving}
                    >
                      Trocar Imagem
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showRosterSelection} onOpenChange={setShowRosterSelection}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecione seu nome completo</DialogTitle>
            <DialogDescription>
              Escolha seu nome na lista para que a imagem seja salva com a nomenclatura correta do website.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Seu nome <span className="text-red-600">*</span>
              </label>
              <Select
                value={selectedRosterName}
                onValueChange={setSelectedRosterName}
                disabled={rosterLoading || saving}
              >
                <SelectTrigger className={!selectedRosterName ? "border-red-300" : ""}>
                  <SelectValue
                    placeholder={rosterLoading ? "Carregando nomes..." : "Escolha seu nome"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {rosterOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowRosterSelection(false);
                setPendingImageFile(null);
                setSelectedRosterName("");
              }}
              variant="ghost"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRosterNameConfirm}
              disabled={saving || !selectedRosterName || rosterLoading}
              variant="primary"
            >
              {saving ? "Enviando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
