import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BookOpen, Bell, History, Mail, Phone, Camera, X, Gift, BookMarked, TrendingUp } from "lucide-react";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";
import LoanActive from "@/features/loans/components/LoanActive";
import LoanHistoryOnly from "@/features/loans/components/LoanHistoryOnly";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProfileTabsCard, TabType } from "@/features/personalProfile/ProfileTabsCard";

console.log("🔵 [ProfilePage] Renderizando página de perfil do usuário");

const PROFILE_IMAGES = [
  ...["bio.png", "cmp.png", "fis.png", "mat.png", "qui.png", "test_qui.png", "test_mat.png"].map(img => `/images/avatars/${img}`)
];

// Mock de doações do usuário
const MOCK_DONATIONS = [
  { id: 1, title: "Cálculo Vol. 1", author: "James Stewart", date: "2025-08-15", status: "aceita" },
  { id: 2, title: "Física Básica", author: "Halliday", date: "2025-10-20", status: "aceita" },
  { id: 3, title: "Química Orgânica", author: "Solomons", date: "2025-12-01", status: "em análise" },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("ativos");

  // Função para determinar cor das abas conforme imagem de perfil
  const getTabColor = () => {
    if (!user?.profile_image) return "cm-purple";
    if (user.profile_image.includes("mat")) return "cm-red";
    if (user.profile_image.includes("fis")) return "cm-orange";
    if (user.profile_image.includes("qui")) return "cm-yellow";
    if (user.profile_image.includes("bio")) return "cm-green";
    if (user.profile_image.includes("cmp")) return "cm-blue";
    return "cm-purple";
  };
  const { user, loading: userLoading, error: userError } = useUserProfile();
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const tabs: { id: TabType; label: string; shortLabel: string; icon: React.ElementType }[] = [
    { id: "ativos", label: "Empréstimos Ativos", shortLabel: "Ativos", icon: BookOpen },
    { id: "historico", label: "Empréstimos Passados", shortLabel: "Histórico", icon: History },
    { id: "doacoes", label: "Minhas Doações", shortLabel: "Doações", icon: Gift },
  ];

  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500">Carregando perfil...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-600">{userError}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500">Nenhum dado encontrado.</div>
        </div>
        <Footer />
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
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-cm-bg">
        <div className="max-w-7xl mx-auto mb-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Header do Perfil */}
          <div className="mt-8 mb-8">
            {/* Aba colorida acima do card */}
            <div className="flex mb-[-12px] z-10 relative">
              <div className="h-3 w-1/5 rounded-tl-2xl bg-cm-red" />
              <div className="h-3 w-1/5 bg-cm-orange" />
              <div className="h-3 w-1/5 bg-cm-yellow" />
              <div className="h-3 w-1/5 bg-cm-green" />
              <div className="h-3 w-1/5 rounded-tr-2xl bg-cm-blue" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-cm-purple/20">
                  {user.profile_image ? (
                    <AvatarImage 
                      src={user.profile_image.includes('/images/user-images/') 
                        ? `${user.profile_image}?t=${Date.now()}` 
                        : user.profile_image} 
                      alt="Foto de perfil" 
                    />
                  ) : null}
                  <AvatarFallback className="bg-cm-purple text-white text-2xl sm:text-3xl font-bebas">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setShowImageSelector(true)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-cm-purple text-white rounded-full flex items-center justify-center shadow-lg hover:bg-cm-purple/90 transition-colors"
                  title="Alterar foto"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bebas text-gray-900">{user.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-gray-600">
                    {user.class && <span>Turma {user.class}</span>}
                    {user.NUSP !== undefined && <span>NUSP {user.NUSP}</span>}
                  </div>
                </div>
                {/* Contato - canto direito em telas grandes */}
                <div className="flex flex-col mt-2 sm:mt-0 text-gray-500 min-w-[140px] pl-2 sm:pl-0">
                    <div className="mb-1">
                      <span className="font-bold text-gray-700">Email</span>
                    </div>
                    <span className="flex items-center gap-1 mb-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                  {user.phone && (
                    <>
                      <div className="mb-1">
                        <span className="font-bold text-gray-700">Telefone</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Layout Principal */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar - Estatísticas */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              {/* Cards de estatísticas - horizontal em mobile, vertical em desktop */}
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:sticky lg:top-24">
                {/* Empréstimos ativos - Vermelho */}
                <div className="bg-cm-red/20 rounded-xl p-4 shadow-md text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:gap-3">
                    <div className="w-10 h-10 rounded-full bg-cm-red/50 flex items-center justify-center mb-2 lg:mb-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cm-red">{userStats.currentLoans}</p>
                      <p className="text-sm text-cm-red hidden md:block">Empréstimos ativos</p>
                      <p className="text-sm text-cm-red md:hidden">Ativos</p>
                    </div>
                  </div>
                </div>
              
                {/* Livros lidos - Azul */}
                <div className="bg-cm-blue/20 rounded-xl p-4 shadow-md text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:gap-3">
                    <div className="w-10 h-10 rounded-full bg-cm-blue/50 flex items-center justify-center mb-2 lg:mb-0">
                      <BookMarked className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cm-blue">{userStats.totalLoans}</p>
                      <p className="text-sm text-cm-blue hidden md:block">Livros lidos</p>
                      <p className="text-sm text-cm-blue md:hidden">Lidos</p>
                    </div>
                  </div>
                </div>

                
                {/* Doações feitas - Verde */}
                <div className="bg-cm-green/20 rounded-xl p-4 shadow-md text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:gap-3">
                    <div className="w-10 h-10 rounded-full bg-cm-green/50 flex items-center justify-center mb-2 lg:mb-0">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cm-green">{userStats.donations}</p>
                      <p className="text-sm text-cm-green hidden md:block">Doações feitas</p>
                      <p className="text-sm text-cm-green md:hidden">Doações</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Card com botões no topo */}
            <div className="flex-1 min-w-0">
              <ProfileTabsCard
                tabs={tabs}
                initialTab={activeTab}
                getTabColor={getTabColor}
              >
                {/* Conteúdo das abas */}
                {/* Ativos */}
                <div>
                  {user.id ? (
                    <LoanActive userId={user.id} />
                  ) : (
                    <p className="text-gray-500 text-center py-8">Não foi possível carregar os empréstimos.</p>
                  )}
                </div>
                {/* Histórico */}
                <div>
                  {user.id ? (
                    <LoanHistoryOnly userId={user.id} />
                  ) : (
                    <p className="text-gray-500 text-center py-8">Não foi possível carregar o histórico.</p>
                  )}
                </div>
                {/* Doações */}
                <div>
                  {MOCK_DONATIONS.length > 0 ? (
                    <div className="space-y-3">
                      {MOCK_DONATIONS.map((donation) => (
                        <div 
                          key={donation.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cm-purple/10 flex items-center justify-center">
                              <Gift className="w-5 h-5 text-cm-purple" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{donation.title}</p>
                              <p className="text-sm text-gray-500">{donation.author}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              donation.status === "aceita" 
                                ? "bg-cm-green/10 text-cm-green" 
                                : "bg-cm-yellow/20 text-cm-orange"
                            }`}>
                              {donation.status === "aceita" ? "Aceita" : "Em análise"}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(donation.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Você ainda não fez nenhuma doação.</p>
                      <a href="/ajude" className="text-cm-purple hover:underline text-sm mt-2 inline-block">
                        Que tal doar um livro?
                      </a>
                    </div>
                  )}
                </div>
              </ProfileTabsCard>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de seleção de imagem */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bebas text-gray-900">Escolha sua foto</h3>
              <button 
                onClick={() => setShowImageSelector(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {PROFILE_IMAGES.map((img) => (
                <button
                  key={img}
                  className={`aspect-square rounded-xl overflow-hidden ring-2 transition-all hover:scale-105 ${
                    selectedImage === img 
                      ? 'ring-cm-purple ring-offset-2' 
                      : 'ring-transparent hover:ring-cm-purple/40'
                  }`}
                  onClick={() => handleImageChange(img)}
                >
                  <img 
                    src={img} 
                    alt="Opção de avatar" 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            
            <button 
              className="w-full mt-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              onClick={() => setShowImageSelector(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;
