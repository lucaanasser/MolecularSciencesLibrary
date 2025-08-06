import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Bell, Trophy, History } from "lucide-react";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";
import LoanActive from "@/features/loans/components/LoanActive";
import LoanHistoryOnly from "@/features/loans/components/LoanHistoryOnly";
import AchievementList from "@/features/users/components/AchievementList";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Log de início de renderização da página de perfil
console.log("🔵 [ProfilePage] Renderizando página de perfil do usuário");

const PROFILE_IMAGES = [
  "/images/logoCM.png",
  "/images/generic-icon.png",
  "/images/custom-icon.png",
  "/images/placeholder.svg",
  // Adicione mais caminhos conforme necessário
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("ativos");
  const { user, loading: userLoading, error: userError } = useUserProfile();
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Delete handler for user notifications
  // const { notifications, loading: notificationsLoading, refetch } = useNotification();
  const notifications = [];
  const notificationsLoading = false;
  const handleDelete = () => {};

  const handleImageChange = async (img: string) => {
    // Garante que o caminho seja sempre /images/nomedaimagem.png
    let imagePath = img;
    if (img && !img.startsWith("/images/")) {
      const fileName = img.split("/").pop();
      imagePath = `/images/${fileName}`;
    }
    setSelectedImage(imagePath);
    setShowImageSelector(false);
    const token = localStorage.getItem("token");
    console.log("[ProfilePage] Enviando imagem de perfil:", imagePath);
    await fetch("/api/users/me/profile-image", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ profile_image: imagePath }),
    });
    window.location.reload(); // Simples, recarrega perfil
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-cm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Info Card */}
            <Card className="p-6 rounded-2xl">
              <div className="flex flex-col items-center">
                {userLoading ? (
                  <div>Carregando perfil...</div>
                ) : userError ? (
                  <div className="text-red-600">{userError}</div>
                ) : user ? (
                  <>
                    <div className="w-24 h-24 rounded-full bg-cm-purple/10 flex items-center justify-center mb-4 relative">
                      {user.profile_image ? (
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={user.profile_image} alt="Foto de perfil" />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <span className="text-3xl font-bebas text-cm-purple">
                          {user.name?.charAt(0)}
                        </span>
                      )}
                      <button
                        className="absolute bottom-0 right-0 bg-cm-purple text-white rounded-full p-1 text-xs hover:bg-cm-blue"
                        onClick={() => setShowImageSelector(true)}
                        title="Alterar imagem de perfil"
                      >
                        Trocar
                      </button>
                    </div>
                    {showImageSelector && (
                      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
                          <h3 className="mb-4 font-bebas text-lg">Escolha sua imagem de perfil</h3>
                          <div className="flex gap-4 flex-wrap mb-4">
                            {PROFILE_IMAGES.map((img) => (
                              <button
                                key={img}
                                className={`border-2 rounded-full p-1 ${selectedImage === img ? 'border-cm-blue' : 'border-transparent'}`}
                                onClick={() => handleImageChange(img)}
                              >
                                <img src={img} alt="Opção" className="w-16 h-16 rounded-full object-cover" />
                              </button>
                            ))}
                          </div>
                          <button className="cm-btn cm-btn-secondary" onClick={() => setShowImageSelector(false)}>Cancelar</button>
                        </div>
                      </div>
                    )}
                    <h2 className="text-2xl font-bebas">{user.name}</h2>
                    <p className="text-gray-500 mb-4">#{user.NUSP}</p>

                    <div className="w-full mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Email:</span>
                        <span>{user.email}</span>
                      </div>
                      {/* Adicione outros campos se existirem */}
                    </div>

                    <div className="w-full mt-6 p-4 bg-cm-blue/10 rounded-xl">
                      <h3 className="text-lg font-bebas mb-2">Status da Conta</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-cm-green"></div>
                        <span className="text-sm">Ativa</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>Nenhum dado de usuário encontrado.</div>
                )}
              </div>
            </Card>

            {/* Tabs Content */}
            <div className="col-span-1 md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="ativos" className="rounded-xl">
                    <BookOpen className="mr-2 w-6 h-6 min-w-[1rem] min-h-[1rem] max-w-[1rem] max-h-[1rem]" /> Empréstimos
                  </TabsTrigger>
                  <TabsTrigger value="historico" className="rounded-xl">
                    <History className="mr-2 w-6 h-6 min-w-[1rem] min-h-[1rem] max-w-[1rem] max-h-[1rem]" /> Histórico
                  </TabsTrigger>
                  <TabsTrigger value="notificacoes" className="rounded-xl">
                    <Bell className="mr-2 w-6 h-6 min-w-[1rem] min-h-[1rem] max-w-[1rem] max-h-[1rem]" /> Notificações
                  </TabsTrigger>
                  {/*
                  <TabsTrigger value="conquistas" className="rounded-xl">
                    <Trophy className="mr-2 h-4 w-4" /> Conquistas
                  </TabsTrigger>
                  */}
                </TabsList>

                <TabsContent value="ativos">
                  <Card className="rounded-2xl">
                    <div className="p-6">
                      <h3 className="text-xl font-bebas mb-4">Empréstimos Ativos</h3>
                      {userLoading ? (
                        <div className="text-center py-8">Carregando dados do usuário...</div>
                      ) : user && user.id ? (
                        <LoanActive userId={user.id} />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Não foi possível carregar os empréstimos ativos.</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="historico">
                  <Card className="rounded-2xl">
                    <div className="p-6">
                      <h3 className="text-xl font-bebas mb-4">Histórico de Empréstimos</h3>
                      {userLoading ? (
                        <div className="text-center py-8">Carregando dados do usuário...</div>
                      ) : user && user.id ? (
                        <LoanHistoryOnly userId={user.id} />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Não foi possível carregar o histórico de empréstimos.</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="notificacoes">
                  <Card className="rounded-2xl">
                    <div className="p-6">
                      <h3 className="text-xl font-bebas mb-4">Notificações</h3>
                      <div>Notificações indisponíveis no momento.</div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="conquistas">
                  <Card className="rounded-2xl">
                    <div className="p-6">
                      <h3 className="text-xl font-bebas mb-4">Conquistas</h3>
                      <AchievementList />
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
