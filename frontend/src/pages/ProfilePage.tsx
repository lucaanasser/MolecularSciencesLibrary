import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BookOpen, Bell, History, Mail, Phone, Camera, X, Gift, BookMarked, TrendingUp } from "lucide-react";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";
import LoanActive from "@/features/loans/components/LoanActive";
import LoanHistoryOnly from "@/features/loans/components/LoanHistoryOnly";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

console.log("🔵 [ProfilePage] Renderizando página de perfil do usuário");

const PROFILE_IMAGES = [
  ...["bio.png", "cmp.png", "fis.png", "mat.png", "qui.png"].map(img => `/images/user-images/${img}`)
];

// Mock de doações do usuário
const MOCK_DONATIONS = [
  { id: 1, title: "Cálculo Vol. 1", author: "James Stewart", date: "2025-08-15", status: "aceita" },
  { id: 2, title: "Física Básica", author: "Halliday", date: "2025-10-20", status: "aceita" },
  { id: 3, title: "Química Orgânica", author: "Solomons", date: "2025-12-01", status: "em análise" },
];

type TabType = "ativos" | "historico" | "doacoes" | "notificacoes";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("ativos");
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
    { id: "historico", label: "Histórico", shortLabel: "Histórico", icon: History },
    { id: "doacoes", label: "Minhas Doações", shortLabel: "Doações", icon: Gift },
    { id: "notificacoes", label: "Notificações", shortLabel: "Avisos", icon: Bell },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header do Perfil */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-cm-purple/20">
                {user.profile_image ? (
                  <AvatarImage src={user.profile_image} alt="Foto de perfil" />
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
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bebas text-gray-900">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                {user.class && <span>Turma {user.class}</span>}
                {user.NUSP !== undefined && <span>NUSP: {user.NUSP}</span>}
              </div>
              {/* Contato - visível apenas em telas maiores */}
              <div className="hidden sm:flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Layout Principal */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar - Estatísticas */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              {/* Cards de estatísticas - horizontal em mobile, vertical em desktop */}
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:sticky lg:top-24">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:gap-3">
                    <div className="w-10 h-10 rounded-full bg-cm-purple/10 flex items-center justify-center mb-2 lg:mb-0">
                      <BookMarked className="w-5 h-5 text-cm-purple" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{userStats.totalLoans}</p>
                      <p className="text-xs text-gray-500">Livros lidos</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:gap-3">
                    <div className="w-10 h-10 rounded-full bg-cm-blue/10 flex items-center justify-center mb-2 lg:mb-0">
                      <TrendingUp className="w-5 h-5 text-cm-blue" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{userStats.currentLoans}</p>
                      <p className="text-xs text-gray-500">Empréstimos ativos</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:gap-3">
                    <div className="w-10 h-10 rounded-full bg-cm-green/10 flex items-center justify-center mb-2 lg:mb-0">
                      <Gift className="w-5 h-5 text-cm-green" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{userStats.donations}</p>
                      <p className="text-xs text-gray-500">Doações feitas</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Tabs Content */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-gray-200 mb-0 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 flex items-center gap-2
                        ${activeTab === tab.id
                          ? 'text-white border-cm-purple bg-cm-purple'
                          : 'text-gray-600 border-transparent hover:text-cm-purple hover:bg-gray-50'
                        }
                        rounded-t-xl
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="border border-gray-200 border-t-0 rounded-b-2xl bg-white shadow-sm p-4 sm:p-6">
                {activeTab === "ativos" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-4">Empréstimos Ativos</h2>
                    {user.id ? (
                      <LoanActive userId={user.id} />
                    ) : (
                      <p className="text-gray-500 text-center py-8">Não foi possível carregar os empréstimos.</p>
                    )}
                  </div>
                )}

                {activeTab === "historico" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-4">Histórico de Empréstimos</h2>
                    {user.id ? (
                      <LoanHistoryOnly userId={user.id} />
                    ) : (
                      <p className="text-gray-500 text-center py-8">Não foi possível carregar o histórico.</p>
                    )}
                  </div>
                )}

                {activeTab === "doacoes" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-4">Minhas Doações</h2>
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
                )}

                {activeTab === "notificacoes" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-4">Notificações</h2>
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma notificação no momento.</p>
                    </div>
                  </div>
                )}
              </div>
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

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
