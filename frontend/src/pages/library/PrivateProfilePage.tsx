import { logger } from "@/utils/logger";
import { useEffect, useState } from "react";
import { UsersService } from "@/services/UsersService";
import { ProfileHeader } from "@/features/profile/private/PrivateHeader";
import { ProfileImageSelector } from "@/features/profile/ProfileImageSelector";
import { PrivateStats } from "@/features/profile/private/PrivateStats";
import { ProfileTabsCard } from "@/features/profile/private/PrivateTabsCard";

/**
 * Página de perfil do usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// Dados mockados (futuramente puxar do backend)
const MOCK_DONATIONS = [
  { id: 1, title: "Cálculo Vol. 1", author: "James Stewart", date: "2025-08-15", status: "aceita" },
  { id: 2, title: "Física Básica", author: "Halliday", date: "2025-10-20", status: "aceita" },
  { id: 3, title: "Química Orgânica", author: "Solomons", date: "2025-12-01", status: "em análise" },
];
const userStats = {
  totalLoans: 12,
  currentLoans: 2,
  donations: MOCK_DONATIONS.filter(d => d.status === "aceita").length,
};

const PrivateProfilePage = () => {
  
  // Log de início de renderização da página de perfil
  logger.info("🔵 [ProfilePage] Renderizando página de perfil");
  
  // Estados para dados do usuário, carregamento, erros e seleção de imagem
  const [activeTab, setActiveTab] = useState("ativos");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Busca do perfil do usuário autenticado ao carregar a página
  useEffect(() => {
    let isMounted = true;
    setUserLoading(true);
    setUserError(null);
    UsersService.getProfile()
      .then((data) => {
        if (isMounted) setUser(data);
      })
      .catch((err) => {
        if (isMounted) setUserError(err.message || "Erro ao buscar perfil");
      })
      .finally(() => {
        if (isMounted) setUserLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Handler para mudança de imagem de perfil
  const handleImageChange = async (img: string) => {
    setSelectedImage(img);
    setShowImageSelector(false);
    try {
      await UsersService.updateProfileImage({ id: user.id, profile_image: img });
    } catch (err) {
      logger.error("🔴 [ProfilePage] Erro ao atualizar imagem de perfil:", err);
    }
    window.location.reload();
  };

  return (
    <div className="content-container">

      {/* Renderização em contextos de erro */}
      {userLoading || userError || !user ? (
        <div className="flex items-center justify-center">
          <p>
            {userLoading 
              ? "Carregando perfil..." 
              : userError 
                ? "Erro ao carregar perfil." 
                : "Nenhum dado encontrado."
            }
          </p>
        </div>
      ):

      <div>

      {/* Modal de seleção de imagem */}
      <ProfileImageSelector
        show={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={handleImageChange}
      />

      {/* Header do perfil */}
      <ProfileHeader 
        user={user} 
        onShowImageSelector={() => setShowImageSelector(true)} 
      />

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar com estatísticas */}
        <PrivateStats userStats={userStats} />
        
        {/* Card de empréstimos e doações */}
        <div className="flex-1 min-w-0">
          <ProfileTabsCard
              user={user}
              donations={MOCK_DONATIONS}
              initialTabId={activeTab}
            />
        </div>
        
      </div>

      </div>
      }
  
    </div>
  );
};

export default PrivateProfilePage;
