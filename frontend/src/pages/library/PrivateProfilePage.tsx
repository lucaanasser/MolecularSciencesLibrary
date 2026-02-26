import { logger } from "@/utils/logger";
import { useEffect, useState } from "react";
import { UsersService } from "@/services/UsersService";
import { ProfileHeader } from "@/features/profile/private/PrivateHeader";
import { ProfileImageSelector } from "@/features/profile/ProfileImageSelector";
import { PrivateStats } from "@/features/profile/private/PrivateStats";
import { ProfileTabsCard } from "@/features/profile/private/PrivateTabsCard";
import { LoansService } from "@/services/LoansService";

/**
 * Página de perfil do usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const PrivateProfilePage = () => {
  
  // Log de início de renderização da página de perfil
  logger.info("🔵 [ProfilePage] Renderizando página de perfil");
  
  // Busca do perfil do usuário autenticado ao carregar a página
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
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

  // Busca estatísticas do usuário
  const [userStats, setUserStats] = useState({
    totalLoans: 0,
    currentLoans: 0,
    donations: 0,
  });
  useEffect(() => {
    if (!user) return;

    // Buscar empréstimos totais e ativos
    Promise.all([
      LoansService.getLoansByUser(user.id, "all"),
      LoansService.getLoansByUser(user.id, "active"),
    ]).then(([allLoans, activeLoans]) => {
      setUserStats((prev) => ({
        ...prev,
        totalLoans: allLoans.length,
        currentLoans: activeLoans.length,
      }));
    }).catch((err) => {
      logger.error("🔴 [ProfilePage] Erro ao buscar estatísticas de empréstimos:", err);
    });

    setUserStats((prev) => ({
      ...prev,
    }));
  }, [user]);

  // Handler para mudança de imagem de perfil
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
              donations={[]}
              initialTabId={"ativos"}
            />
        </div>
        
      </div>

      </div>
      }
  
    </div>
  );
};

export default PrivateProfilePage;
