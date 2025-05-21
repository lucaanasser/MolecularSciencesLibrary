import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Bell } from "lucide-react";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";

const mockHistory = [
  {
    id: "h1",
    bookTitle: "Princípios de Bioquímica",
    borrowDate: "2023-12-01",
    returnDate: "2023-12-15",
    returned: true,
  },
  {
    id: "h2",
    bookTitle: "Cálculo: Volume 1",
    borrowDate: "2024-01-10",
    returnDate: "2024-01-24",
    returned: false,
  },
  {
    id: "h3",
    bookTitle: "Física para Cientistas e Engenheiros",
    borrowDate: "2023-11-05",
    returnDate: "2023-11-19",
    returned: true,
  },
];

const mockNotifications = [
  {
    id: "n1",
    message: "Livro 'Cálculo: Volume 1' deve ser devolvido em 2 dias.",
    date: "2024-01-22",
    read: false,
  },
  {
    id: "n2",
    message: "Sua reserva para 'Química Orgânica' está disponível para retirada.",
    date: "2024-01-18",
    read: true,
  },
  {
    id: "n3",
    message: "Livro 'Princípios de Bioquímica' foi devolvido com sucesso.",
    date: "2023-12-15",
    read: true,
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("emprestimos");
  const { user, loading, error } = useUserProfile();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-cm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Info Card */}
            <Card className="p-6 rounded-2xl">
              <div className="flex flex-col items-center">
                {loading ? (
                  <div>Carregando...</div>
                ) : error ? (
                  <div className="text-red-600">{error}</div>
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
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="emprestimos" className="rounded-xl">
                    <BookOpen className="mr-2 h-4 w-4" /> Empréstimos
                  </TabsTrigger>
                  <TabsTrigger value="notificacoes" className="rounded-xl">
                    <Bell className="mr-2 h-4 w-4" /> Notificações
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="emprestimos">
                  <Card className="rounded-2xl">
                    <div className="p-6">
                      <h3 className="text-xl font-bebas mb-4">Histórico de Empréstimos</h3>
                      {/* Substitua mockHistory por dados reais quando implementar */}
                      {mockHistory.length > 0 ? (
                        <div className="space-y-4">
                          {mockHistory.map((item) => (
                            <div
                              key={item.id}
                              className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{item.bookTitle}</h4>
                                  <div className="flex space-x-4 mt-1 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <Clock className="mr-1 h-3 w-3" />
                                      <span>
                                        Empréstimo: {formatDate(item.borrowDate)}
                                      </span>
                                    </div>
                                    <div>
                                      <span>
                                        Devolução: {formatDate(item.returnDate)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs ${
                                    item.returned
                                      ? "bg-cm-green/10 text-cm-green"
                                      : "bg-cm-yellow/10 text-cm-orange"
                                  }`}
                                >
                                  {item.returned ? "Devolvido" : "Em andamento"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            Nenhum histórico de empréstimos encontrado.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="notificacoes">
                  <Card className="rounded-2xl">
                    <div className="p-6">
                      <h3 className="text-xl font-bebas mb-4">Notificações</h3>
                      {/* Substitua mockNotifications por dados reais quando implementar */}
                      {mockNotifications.length > 0 ? (
                        <div className="space-y-4">
                          {mockNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 rounded-xl ${
                                notification.read
                                  ? "bg-white"
                                  : "bg-cm-blue/5 border-l-4 border-cm-blue"
                              }`}
                            >
                              <p
                                className={`${
                                  notification.read ? "text-gray-600" : "font-medium"
                                }`}
                              >
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDate(notification.date)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            Nenhuma notificação encontrada.
                          </p>
                        </div>
                      )}
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
