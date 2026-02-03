import { useState } from "react";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";
import { ProfileHeader, ProfileImageSelector } from "@/features/personalProfile/features/ProfileHeader";
import { ProfileStatsSidebar } from "@/features/personalProfile/features/ProfileStatsSidebar";
import { ProfileTabsCard } from "@/features/personalProfile/features/ProfileTabsCard";


const MOCK_DONATIONS = [
  { id: 1, title: "Cálculo Vol. 1", author: "James Stewart", date: "2025-08-15", status: "aceita" },
  { id: 2, title: "Física Básica", author: "Halliday", date: "2025-10-20", status: "aceita" },
  { id: 3, title: "Química Orgânica", author: "Solomons", date: "2025-12-01", status: "em análise" },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("ativos");
  const { user, loading: userLoading, error: userError } = useUserProfile();
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getTabColor = () => {
    if (!user?.profile_image) return "library-purple";
    if (user.profile_image.includes("mat")) return "cm-red";
    if (user.profile_image.includes("fis")) return "cm-orange";
    if (user.profile_image.includes("qui")) return "cm-yellow";
    if (user.profile_image.includes("bio")) return "cm-green";
    if (user.profile_image.includes("cmp")) return "cm-blue";
    return "library-purple";
  };

  const handleImageChange = async (img: string) => {
    let imagePath = img;
    if (img && !img.startsWith("/images/")) {
      const fileName = img.split("/").pop();
      imagePath = `/images/${fileName}`;
    }
    setSelectedImage(imagePath);
    setShowImageSelector(false);
    const token = localStorage.getItem("token");
    await fetch("/api/users/me/profile-image", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ profile_image: imagePath }),
    });
    window.location.reload();
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500">Carregando perfil...</div>
        </div>
        
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen flex flex-col">
        
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-600">{userError}</div>
        </div>
        
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500">Nenhum dado encontrado.</div>
        </div>
      </div>
    );
  }

  // Stats mockadas (futuramente puxar do backend)
  const userStats = {
    totalLoans: 12,
    currentLoans: 2,
    donations: MOCK_DONATIONS.filter(d => d.status === "aceita").length,
  };

  return (
    <div className="content-container">

      {/* Header do perfil */}
      <ProfileHeader user={user} onShowImageSelector={() => setShowImageSelector(true)} />

      {/* Layout principal */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar com estatísticas */}
        <ProfileStatsSidebar userStats={userStats} />
        
        {/* Card com botões no topo */}
        <div className="flex-1 min-w-0">
          {user.id ? (
            <ProfileTabsCard
              userId={user.id}
              donations={MOCK_DONATIONS.filter(d => d.status === "aceita")}
              getTabColor={getTabColor}
              initialTabId={activeTab}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">Não foi possível carregar os dados.</p>
          )}
        </div>
      </div>

      {/* Modal de seleção de imagem */}
      <ProfileImageSelector
        show={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={handleImageChange}
        selectedImage={selectedImage}
      />
  
    </div>
  );
};

export default ProfilePage;
