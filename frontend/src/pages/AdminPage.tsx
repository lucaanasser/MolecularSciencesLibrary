import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import AddBookForm from "@/features/books/components/AddBookWizard";
import RemoveBookForm from "@/features/books/components/RemoveBookWizard";
import AddUserForm from "@/features/users/components/AddUserForm";
import UserList from "@/features/users/components/UserList";
import RemoveUserForm from "@/features/users/components/RemoveUserForm";
import LoanForm from "@/features/loans/components/LoanForm"; 
import ReturnLoanForm from "@/features/loans/components/ReturnLoanForm"; 
import SendNotification from "@/features/notification/components/Sendnotification";
import NotificationList from "@/features/notification/components/NotificationList";
import AdminInboxTab from "@/features/notification/components/AdminInboxTab";
import InboxList from "@/features/notification/components/InboxList";
import { useNotification } from "@/features/notification/hooks/useNotification";
import { useAdminNotifications } from "@/features/notification/hooks/useAdminNotifications";
import { useInbox } from "@/features/notification/hooks/useInbox";

// Log de início de renderização da página Admin
console.log("🔵 [AdminPage] Renderizando painel administrativo");

// Error Boundary to prevent UI crashes
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🔴 [AdminPage] UI Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 rounded-xl border border-red-200">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Algo deu errado</h3>
          <p className="text-gray-600 mb-4">Ocorreu um erro ao renderizar este componente.</p>
          <Button 
            variant="outline" 
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Tentar novamente
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Gerenciamento de Livros ---
const ManageBooks = () => {
  const [selectedTab, setSelectedTab] = useState<"add" | "remove" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Log de início de renderização do gerenciamento de livros
  console.log("🔵 [AdminPage/ManageBooks] Renderizando gerenciamento de livros");

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Gerenciamento de Livros</h2>
      <p>Aqui você pode adicionar ou remover livros do acervo da biblioteca.</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl my-4">
          {error}
          <Button variant="link" onClick={() => setError(null)} className="ml-2">
            Fechar
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Adicionar Livro</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-cm-green hover:bg-cm-green/90 hover:scale-110" 
              onClick={() => {
                console.log("🔵 [AdminPage/ManageBooks] Selecionado: Adicionar Livro");
                setSelectedTab("add");
              }}
              disabled={isLoading}
            >
              Adicionar
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Remover Livro</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-cm-red hover:bg-cm-red/90 hover:scale-110"
              onClick={() => {
                console.log("🔵 [AdminPage/ManageBooks] Selecionado: Remover Livro");
                setSelectedTab("remove");
              }}
              disabled={isLoading}
            >
              Remover
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {selectedTab === "add" && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => {
              console.warn("🟡 [AdminPage/ManageBooks] Voltar do formulário de adicionar livro");
              setSelectedTab(null);
            }}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Adicionar Novo Livro</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <AddBookForm
                  onCancel={() => {
                    console.warn("🟡 [AdminPage/ManageBooks] Cancelar adicionar livro");
                    setSelectedTab(null);
                  }}
                  onSuccess={() => {
                    setSelectedTab(null);
                    console.log("🟢 [AdminPage/ManageBooks] Livro adicionado com sucesso");
                  }}
                  onError={(err) => {
                    setError(err.message || "Erro ao processar a requisição");
                    console.error("🔴 [AdminPage/ManageBooks] Book form error:", err);
                  }}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      )}
      
      {selectedTab === "remove" && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => {
              console.warn("🟡 [AdminPage/ManageBooks] Voltar do formulário de remover livro");
              setSelectedTab(null);
            }}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Remover Livro</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <RemoveBookForm
                  onCancel={() => {
                    console.warn("🟡 [AdminPage/ManageBooks] Cancelar remover livro");
                    setSelectedTab(null);
                  }}
                  onSuccess={() => {
                    setSelectedTab(null);
                    console.log("🟢 [AdminPage/ManageBooks] Livro removido com sucesso");
                  }}
                  onError={(err) => {
                    setError(err.message || "Erro ao remover o livro");
                    console.error("🔴 [AdminPage/ManageBooks] Book removal error:", err);
                  }}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// --- Gerenciamento de Usuários ---
const ManageUsers = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Log de início de renderização do gerenciamento de usuários
  console.log("🔵 [AdminPage/ManageUsers] Renderizando gerenciamento de usuários");

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Gerenciamento de Usuários</h2>
      <p>Cadastre, busque ou remova usuários do sistema.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Adicionar Usuário */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Adicionar Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            {showAddForm ? (
              <>
                <AddUserForm
                  onSuccess={() => {
                    setShowAddForm(false);
                    setSuccessMsg("Usuário adicionado com sucesso!");
                    console.log("🟢 [AdminPage/ManageUsers] Usuário adicionado com sucesso");
                  }}
                  onError={(err) => {
                    setSuccessMsg(`Erro: ${err.message}`);
                    console.error("🔴 [AdminPage/ManageUsers] Erro ao adicionar usuário:", err);
                  }}
                />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    console.warn("🟡 [AdminPage/ManageUsers] Cancelar adicionar usuário");
                    setShowAddForm(false);
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-green hover:bg-cm-green/90"
                onClick={() => {
                  console.log("🔵 [AdminPage/ManageUsers] Selecionado: Adicionar Usuário");
                  setShowAddForm(true);
                }}
              >
                Adicionar
              </Button>
            )}
            {successMsg && (
              <div className="mt-2 text-green-700">{successMsg}</div>
            )}
          </CardContent>
        </Card>
        {/* Lista de Usuários */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {showUserList ? (
              <>
                <UserList />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    console.warn("🟡 [AdminPage/ManageUsers] Fechar lista de usuários");
                    setShowUserList(false);
                  }}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-blue hover:bg-cm-blue/90"
                onClick={() => {
                  console.log("🔵 [AdminPage/ManageUsers] Selecionado: Ver Todos Usuários");
                  setShowUserList(true);
                }}
              >
                Ver Todos
              </Button>
            )}
          </CardContent>
        </Card>
        {/* Remover Usuário */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Remover Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            {showRemoveForm ? (
              <>
                <RemoveUserForm
                  onSuccess={() => {
                    setShowRemoveForm(false);
                    setSuccessMsg("Usuário removido com sucesso!");
                    console.log("🟢 [AdminPage/ManageUsers] Usuário removido com sucesso");
                  }}
                  onError={(err) => {
                    setSuccessMsg(`Erro: ${err.message}`);
                    console.error("🔴 [AdminPage/ManageUsers] Erro ao remover usuário:", err);
                  }}
                />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    console.warn("🟡 [AdminPage/ManageUsers] Cancelar remover usuário");
                    setShowRemoveForm(false);
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-red hover:bg-cm-red/90"
                onClick={() => {
                  console.log("🔵 [AdminPage/ManageUsers] Selecionado: Remover Usuário");
                  setShowRemoveForm(true);
                }}
              >
                Remover
              </Button>
            )}
            {successMsg && (
              <div className="mt-2 text-green-700">{successMsg}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Gerenciamento de Empréstimos ---
const ManageLoans = () => {
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  // Log de início de renderização do gerenciamento de empréstimos
  console.log("🔵 [AdminPage/ManageLoans] Renderizando gerenciamento de empréstimos");

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Gerenciamento de Empréstimos</h2>
      <p>Gerencie empréstimos, devoluções e multas dos usuários.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Novos Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            {showLoanForm ? (
              <>
                <LoanForm onSuccess={() => {
                  setShowLoanForm(false);
                  console.log("🟢 [AdminPage/ManageLoans] Empréstimo registrado com sucesso");
                }} />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    console.warn("🟡 [AdminPage/ManageLoans] Cancelar registrar empréstimo");
                    setShowLoanForm(false);
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-green hover:bg-cm-green/90"
                onClick={() => {
                  console.log("🔵 [AdminPage/ManageLoans] Selecionado: Registrar Empréstimo");
                  setShowLoanForm(true);
                }}
              >
                Registrar
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Devoluções</CardTitle>
          </CardHeader>
          <CardContent>
            {showReturnForm ? (
              <>
                <ReturnLoanForm onSuccess={() => {
                  setShowReturnForm(false);
                  console.log("🟢 [AdminPage/ManageLoans] Devolução processada com sucesso");
                }} />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    console.warn("🟡 [AdminPage/ManageLoans] Cancelar devolução");
                    setShowReturnForm(false);
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-orange hover:bg-cm-orange/90"
                onClick={() => {
                  console.log("🔵 [AdminPage/ManageLoans] Selecionado: Processar Devolução");
                  setShowReturnForm(true);
                }}
              >
                Processar
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Multas</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-red hover:bg-cm-red/90">Gerenciar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Notificações ---
const Notifications = () => {
  // Log de início de renderização das notificações
  console.log("🔵 [AdminPage/Notifications] Renderizando notificações");
  const [showSend, setShowSend] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const { notifications, loading } = useAdminNotifications();
  const { emails, loading: inboxLoading, error: inboxError, refetch } = useInbox();

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Notificações</h2>
      <p>Envie notificações para usuários sobre devoluções e eventos.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Enviar Avisos */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Enviar Avisos</CardTitle>
          </CardHeader>
          <CardContent>
            {showSend ? (
              <>
                <SendNotification />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowSend(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-green hover:bg-cm-green/90"
                onClick={() => setShowSend(true)}
              >
                Enviar Aviso
              </Button>
            )}
          </CardContent>
        </Card>
        {/* Histórico de Notificações */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Histórico de Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            {showHistory ? (
              <>
                <NotificationList notifications={notifications} loading={loading} adminSearch />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowHistory(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-blue hover:bg-cm-blue/90"
                onClick={() => setShowHistory(true)}
              >
                Ver Histórico
              </Button>
            )}
          </CardContent>
        </Card>
        {/* Caixa de Entrada */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Caixa de Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            {showInbox ? (
              <>
                <InboxList 
                  emails={emails} 
                  loading={inboxLoading} 
                  error={inboxError} 
                  onEmailDeleted={refetch}
                />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowInbox(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-orange hover:bg-cm-orange/90"
                onClick={() => setShowInbox(true)}
              >
                Ver Inbox
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Relatórios ---
const Reports = () => {
  // Log de início de renderização dos relatórios
  console.log("🔵 [AdminPage/Reports] Renderizando relatórios");
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Relatórios</h2>
      <p>Visualize estatísticas e relatórios sobre o uso da biblioteca.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-blue hover:bg-cm-blue/90">Visualizar</Button>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-orange hover:bg-cm-orange/90">Visualizar</Button>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Acervo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-green hover:bg-cm-green/90">Visualizar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Configurações ---
const Settings = () => {
  // Log de início de renderização das configurações
  console.log("🔵 [AdminPage/Settings] Renderizando configurações");
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Configurações</h2>
      <p>Ajuste as configurações do sistema da biblioteca.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gray-700 hover:bg-gray-800">Editar</Button>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Regras de Empréstimo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-blue hover:bg-cm-blue/90">Configurar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Página Principal do Admin ---
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("books");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Log de início de renderização do componente principal do Admin
  console.log("🔵 [AdminPage] Renderizando componente principal do painel admin");

  // Ensure the page is fully loaded before rendering content
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  if (!isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-cm-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bebas mb-8">Painel do Administrador</h1>
          
          <ErrorBoundary>
            <Tabs defaultValue="books" onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex gap-2 bg-white p-2 rounded-t-2xl shadow-sm relative border-b border-gray-200">
                {[
                  { value: "books", label: "Livros", color: "bg-cm-red text-white" },
                  { value: "users", label: "Usuários", color: "bg-cm-orange text-white" },
                  { value: "loans", label: "Empréstimos", color: "bg-cm-yellow text-white" },
                  { value: "notifications", label: "Notificações", color: "bg-cm-green text-white" },
                  { value: "reports", label: "Relatórios", color: "bg-cm-blue text-white" },
                  { value: "settings", label: "Configurações", color: "bg-gray-700 text-white" },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`
                      px-3 py-1 mx-1 rounded-t-2xl font-semibold transition-all duration-200 relative
                      ${activeTab === tab.value 
                        ? "!bg-gray-200 !text-gray-900 shadow-lg scale-105 z-20 border-b-0"
                        : `${tab.color} z-10 border-b-2 border-gray-200`
                      }
                      hover:scale-110 hover:shadow-xl
                    `}
                    style={{ minWidth: "120px" }}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Card className="rounded-t-none rounded-b-2xl shadow-md bg-white">
                <CardContent className="p-0">
                  <TabsContent value="books">
                    <ErrorBoundary>
                      <ManageBooks />
                    </ErrorBoundary>
                  </TabsContent>
                  <TabsContent value="users">
                    <ErrorBoundary>
                      <ManageUsers />
                    </ErrorBoundary>
                  </TabsContent>
                  <TabsContent value="loans">
                    <ErrorBoundary>
                      <ManageLoans />
                    </ErrorBoundary>
                  </TabsContent>
                  <TabsContent value="notifications">
                    <ErrorBoundary>
                      <Notifications />
                    </ErrorBoundary>
                  </TabsContent>
                  <TabsContent value="inbox">
                    <ErrorBoundary>
                      <AdminInboxTab />
                    </ErrorBoundary>
                  </TabsContent>
                  <TabsContent value="reports">
                    <ErrorBoundary>
                      <Reports />
                    </ErrorBoundary>
                  </TabsContent>
                  <TabsContent value="settings">
                    <ErrorBoundary>
                      <Settings />
                    </ErrorBoundary>
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </ErrorBoundary>
          
          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/">Voltar para o Início</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;