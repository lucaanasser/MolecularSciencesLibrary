import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Bell } from "lucide-react";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";
import LoanActive from "@/features/loans/components/LoanActive";
import LoanHistoryOnly from "@/features/loans/components/LoanHistoryOnly";
import NotificationList from "@/features/notification/components/NotificationList";
import { useNotification } from "@/features/notification/hooks/useNotification";

// Log de início de renderização da página de perfil
console.log("🔵 [ProfilePage] Renderizando página de perfil do usuário");

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("ativos");
  const { user, loading: userLoading, error: userError } = useUserProfile();
  const { notifications, loading: notificationsLoading, refetch } = useNotification();

  // Delete handler for user notifications
  const handleDelete = async (id: string | number) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });
    refetch();
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
                    <div className="w-24 h-24 rounded-full bg-cm-blue/10 flex items-center justify-center mb-4">
                      <span className="text-3xl font-bebas text-cm-blue">
                        {user.name?.charAt(0)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bebas">{user.name}</h2>
                    <p className="text-gray-500 mb-4">#{user.NUSP}</p>

                    <div className="w-full mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Email:</span>
                        <span>{user.email}</span>
                      </div>
                      {/* Adicione outros campos se existirem */}
                    </div>

                    <div className="w-full mt-6 p-4 bg-cm-yellow/10 rounded-xl">
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
                    <BookOpen className="mr-2 h-4 w-4" /> Empréstimos Ativos
                  </TabsTrigger>
                  <TabsTrigger value="historico" className="rounded-xl">
                    <BookOpen className="mr-2 h-4 w-4" /> Histórico
                  </TabsTrigger>
                  <TabsTrigger value="notificacoes" className="rounded-xl">
                    <Bell className="mr-2 h-4 w-4" /> Notificações
                  </TabsTrigger>
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
                      <NotificationList notifications={notifications} loading={notificationsLoading} onDelete={handleDelete} />
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
