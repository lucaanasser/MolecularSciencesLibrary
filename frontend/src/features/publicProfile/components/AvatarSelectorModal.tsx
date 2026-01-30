import { useState, useRef } from "react";
import { X, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cropper, { ReactCropperElement } from "react-cropper";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageFile: File) => Promise<void>;
  onSelectDefault: (imagePath: string) => Promise<void>;
  currentImage?: string;
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
  currentImage,
}: AvatarSelectorModalProps) => {
  const [selectedTab, setSelectedTab] = useState<"upload" | "default">("default");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande! Máximo 5MB.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
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

    setSaving(true);
    try {
      console.log("🔵 [AvatarSelectorModal] Iniciando crop e save");
      
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: 400,
        height: 400,
      });

      console.log("🔵 [AvatarSelectorModal] Canvas criado");

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("🔴 [AvatarSelectorModal] Blob é null");
          alert("Erro ao processar imagem");
          setSaving(false);
          return;
        }

        console.log("🔵 [AvatarSelectorModal] Blob criado:", blob.size, "bytes");
        
        const file = new File([blob], "avatar.png", { type: "image/png" });
        console.log("🔵 [AvatarSelectorModal] Chamando onSelectImage");
        
        await onSelectImage(file);
        
        console.log("🟢 [AvatarSelectorModal] Upload concluído");
        setUploadedImage(null);
        onClose();
        setSaving(false);
      }, "image/png");
    } catch (err) {
      console.error("🔴 [AvatarSelectorModal] Erro ao salvar avatar:", err);
      alert("Erro ao salvar avatar");
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
    onClose();
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
                    Máximo 5MB • PNG, JPG ou JPEG
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ maxHeight: "400px" }}>
                    <Cropper
                      ref={cropperRef}
                      src={uploadedImage}
                      style={{ height: 400, width: "100%" }}
                      aspectRatio={1}
                      guides={true}
                      viewMode={2}
                      dragMode="move"
                      cropBoxMovable={false}
                      cropBoxResizable={false}
                      background={true}
                      responsive={true}
                      autoCropArea={0.8}
                      center={true}
                      highlight={true}
                      zoomOnWheel={true}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Arraste a imagem para posicionar • Use a roda do mouse para zoom
                  </p>
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
    </div>
  );
};
