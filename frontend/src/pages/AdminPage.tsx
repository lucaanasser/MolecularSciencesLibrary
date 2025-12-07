import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import AddBookForm from "@/features/books/components/AddBookWizard";
import RemoveBookForm from "@/features/books/components/RemoveBookWizard";
import BooksList from "@/features/books/components/BooksList";
import AddUserForm from "@/features/users/components/AddUserForm";
import UserList from "@/features/users/components/UserList";
import RemoveUserForm from "@/features/users/components/RemoveUserForm";
import LoanForm from "@/features/loans/components/LoanForm"; 
import ActiveLoansList from "@/features/loans/components/ActiveLoansList"; 
import SendNotification from "@/features/notifications/components/Sendnotification";
import NotificationList from "@/features/notifications/components/NotificationList";
import AdminInboxTab from "@/features/notifications/components/AdminInboxTab";
import InboxList from "@/features/notifications/components/InboxList";
import { useAdminNotifications } from "@/features/notifications/hooks/useAdminNotifications";
import { useInbox } from "@/features/notifications/hooks/useInbox";
import LoanRulesForm from "@/features/rules/components/LoanRulesForm";
import LoanRulesView from "@/features/rules/components/LoanRulesView";
import DonatorsList from "@/features/donators/components/DonatorsList";
import DonatorForm from "@/features/donators/components/DonatorForm";
import BookReservePanel from '@/features/books/components/BookReservePanel';

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
  const [selectedTab, setSelectedTab] = useState<"add" | "remove" | "list" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Log de início de renderização do gerenciamento de livros
  console.log("🔵 [AdminPage/ManageBooks] Renderizando gerenciamento de livros");

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Gerenciamento de Livros</h2>
      <p className="text-sm sm:text-base text-gray-600">Aqui você pode adicionar ou remover livros do acervo da biblioteca.</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 sm:p-4 rounded-xl my-4 text-sm sm:text-base">
          {error}
          <Button variant="link" onClick={() => setError(null)} className="ml-2 text-xs sm:text-sm">
            Fechar
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Adicionar Livro</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-cm-green hover:bg-cm-green/90 hover:scale-105 text-sm sm:text-base transition-transform" 
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
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Remover Livro</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-cm-red hover:bg-cm-red/90 hover:scale-105 text-sm sm:text-base transition-transform"
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
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Todos os Livros</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-cm-blue hover:bg-cm-blue/90 hover:scale-105 text-sm sm:text-base transition-transform"
              onClick={() => {
                console.log("🔵 [AdminPage/ManageBooks] Selecionado: Ver Todos os Livros");
                setSelectedTab("list");
              }}
              disabled={isLoading}
            >
              Ver Todos
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
      
      {selectedTab === "list" && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => {
              console.warn("🟡 [AdminPage/ManageBooks] Voltar da lista de livros");
              setSelectedTab(null);
            }}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Todos os Livros</CardTitle>
            </CardHeader>
            <CardContent>
              <BooksList onClose={() => setSelectedTab(null)} />
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
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Gerenciamento de Usuários</h2>
      <p className="text-sm sm:text-base text-gray-600">Cadastre, busque ou remova usuários do sistema.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {/* Adicionar Usuário */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Adicionar Usuário</CardTitle>
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
                  className="mt-4 w-full text-sm sm:text-base"
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
                className="w-full bg-cm-green hover:bg-cm-green/90 text-sm sm:text-base"
                onClick={() => {
                  console.log("🔵 [AdminPage/ManageUsers] Selecionado: Adicionar Usuário");
                  setShowAddForm(true);
                }}
              >
                Adicionar
              </Button>
            )}
            {successMsg && (
              <div className="mt-2 text-green-700 text-sm sm:text-base">{successMsg}</div>
            )}
          </CardContent>
        </Card>
        {/* Lista de Usuários */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {showUserList ? (
              <>
                <UserList onClose={() => setShowUserList(false)} />
                <Button
                  variant="outline"
                  className="mt-4 w-full text-sm sm:text-base"
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
                className="w-full bg-cm-blue hover:bg-cm-blue/90 text-sm sm:text-base"
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
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Remover Usuário</CardTitle>
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
                  className="mt-4 w-full text-sm sm:text-base"
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
                className="w-full bg-cm-red hover:bg-cm-red/90 text-sm sm:text-base"
                onClick={() => {
                  console.log("🔵 [AdminPage/ManageUsers] Selecionado: Remover Usuário");
                  setShowRemoveForm(true);
                }}
              >
                Remover
              </Button>
            )}
            {successMsg && (
              <div className="mt-2 text-green-700 text-sm sm:text-base">{successMsg}</div>
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
  const [showLoansList, setShowLoansList] = useState(false);
  const [showInternalUseForm, setShowInternalUseForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [internalUseCode, setInternalUseCode] = useState("");
  const [internalUseLoading, setInternalUseLoading] = useState(false);
  const [internalUseError, setInternalUseError] = useState("");
  const [internalUseSuccess, setInternalUseSuccess] = useState("");

  // Log de início de renderização do gerenciamento de empréstimos
  console.log("🔵 [AdminPage/ManageLoans] Renderizando gerenciamento de empréstimos");

  const handleLoanSuccess = () => {
    setShowLoanForm(false);
    setRefreshKey(prev => prev + 1); // Força recarregar a lista
    console.log("🟢 [AdminPage/ManageLoans] Empréstimo registrado com sucesso");
  };

  const handleInternalUse = async () => {
    if (!internalUseCode) {
      setInternalUseError("Informe o código do livro");
      return;
    }

    setInternalUseLoading(true);
    setInternalUseError("");
    setInternalUseSuccess("");

    try {
      const res = await fetch("/api/loans/internal-use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_code: internalUseCode })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao registrar uso interno");
      }

      setInternalUseSuccess("Uso interno registrado com sucesso!");
      setInternalUseCode("");
      setTimeout(() => {
        setInternalUseSuccess("");
      }, 3000);
      console.log("🟢 [AdminPage/ManageLoans] Uso interno registrado");
    } catch (err: any) {
      setInternalUseError(err.message);
      console.error("🔴 [AdminPage/ManageLoans] Erro ao registrar uso interno:", err);
    } finally {
      setInternalUseLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Gerenciamento de Empréstimos</h2>
      <p className="text-sm sm:text-base text-gray-600">Gerencie empréstimos e visualize todos os empréstimos ativos.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {/* Empréstimo/Devolução */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Empréstimo/Devolução</CardTitle>
          </CardHeader>
          <CardContent>
            {showLoanForm ? (
              <>
                <LoanForm 
                  isAdminMode={true}
                  onSuccess={handleLoanSuccess} 
                />
                <Button
                  variant="outline"
                  className="mt-4 w-full text-sm sm:text-base"
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
                className="w-full bg-cm-green hover:bg-cm-green/90 text-sm sm:text-base"
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

        {/* Lista de Empréstimos Ativos */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Empréstimos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {showLoansList ? (
              <>
                <ActiveLoansList key={refreshKey} onClose={() => setShowLoansList(false)} />
                <Button
                  variant="outline"
                  className="mt-4 w-full text-sm sm:text-base"
                  onClick={() => {
                    console.warn("🟡 [AdminPage/ManageLoans] Fechar lista de empréstimos");
                    setShowLoansList(false);
                  }}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-blue hover:bg-cm-blue/90 text-sm sm:text-base"
                onClick={() => {
                  console.log("🔵 [AdminPage/ManageLoans] Selecionado: Ver Empréstimos Ativos");
                  setShowLoansList(true);
                }}
              >
                Ver Todos
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Uso Interno */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Uso Interno</CardTitle>
          </CardHeader>
          <CardContent>
            {showInternalUseForm ? (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-gray-600">
                  Registre livros usados internamente na biblioteca (sem empréstimo externo)
                </p>
                <div>
                  <label className="text-xs sm:text-sm font-medium">Código do Livro:</label>
                  <Input
                    type="text"
                    value={internalUseCode}
                    onChange={(e) => setInternalUseCode(e.target.value)}
                    placeholder="Ex: 123"
                    disabled={internalUseLoading}
                    className="text-sm sm:text-base"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleInternalUse();
                      }
                    }}
                  />
                </div>
                {internalUseError && (
                  <div className="text-red-600 text-xs sm:text-sm">{internalUseError}</div>
                )}
                {internalUseSuccess && (
                  <div className="text-green-600 text-xs sm:text-sm">{internalUseSuccess}</div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    className="flex-1 bg-cm-purple hover:bg-cm-purple/90 text-sm sm:text-base"
                    onClick={handleInternalUse}
                    disabled={internalUseLoading}
                  >
                    {internalUseLoading ? "Registrando..." : "Registrar"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-sm sm:text-base"
                    onClick={() => {
                      setShowInternalUseForm(false);
                      setInternalUseCode("");
                      setInternalUseError("");
                      setInternalUseSuccess("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full bg-cm-purple hover:bg-cm-purple/90 text-sm sm:text-base"
                onClick={() => {
                  console.log("🔵 [AdminPage/ManageLoans] Selecionado: Uso Interno");
                  setShowInternalUseForm(true);
                }}
              >
                Registrar Uso
              </Button>
            )}
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
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Notificações</h2>
      <p className="text-sm sm:text-base text-gray-600">Envie notificações para usuários sobre devoluções e eventos.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {/* Enviar Avisos */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Enviar Avisos</CardTitle>
          </CardHeader>
          <CardContent>
            {showSend ? (
              <>
                <SendNotification />
                <Button
                  variant="outline"
                  className="mt-4 w-full text-sm sm:text-base"
                  onClick={() => setShowSend(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-green hover:bg-cm-green/90 text-sm sm:text-base"
                onClick={() => setShowSend(true)}
              >
                Enviar Aviso
              </Button>
            )}
          </CardContent>
        </Card>
        {/* Histórico de Notificações */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Histórico de Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            {showHistory ? (
              <>
                <NotificationList notifications={notifications} loading={loading} adminSearch />
                <Button
                  variant="outline"
                  className="mt-4 w-full text-sm sm:text-base"
                  onClick={() => setShowHistory(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-blue hover:bg-cm-blue/90 text-sm sm:text-base"
                onClick={() => setShowHistory(true)}
              >
                Ver Histórico
              </Button>
            )}
          </CardContent>
        </Card>
        {/* Caixa de Entrada */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Caixa de Entrada</CardTitle>
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
                  className="mt-4 w-full text-sm sm:text-base"
                  onClick={() => setShowInbox(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-orange hover:bg-cm-orange/90 text-sm sm:text-base"
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
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Relatórios</h2>
      <p className="text-sm sm:text-base text-gray-600">Visualize estatísticas e relatórios sobre o uso da biblioteca.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-blue hover:bg-cm-blue/90 text-sm sm:text-base">Visualizar</Button>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-orange hover:bg-cm-orange/90 text-sm sm:text-base">Visualizar</Button>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Acervo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-cm-green hover:bg-cm-green/90 text-sm sm:text-base">Visualizar</Button>
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
  const [showRulesForm, setShowRulesForm] = useState(false);
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Configurações</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {/* Painel de Reserva Didática substitui Configurações Gerais */}
        <BookReservePanel />
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Regras de Empréstimo</CardTitle>
          </CardHeader>
          <CardContent>
            {showRulesForm ? (
              <>
                <LoanRulesForm onSuccess={() => setShowRulesForm(false)} />
                <Button variant="outline" className="mt-4 w-full text-sm sm:text-base" onClick={() => setShowRulesForm(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <LoanRulesView />
                <Button className="w-full bg-cm-blue hover:bg-cm-blue/90 mt-4 text-sm sm:text-base" onClick={() => setShowRulesForm(true)}>
                  Editar Regras
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Gerenciamento de Doadores ---
const ManageDonators = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Gerenciamento de Doadores</h2>
      <p className="text-sm sm:text-base text-gray-600">Cadastre, busque ou visualize doadores do sistema.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {/* Adicionar Doador */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Adicionar Doador</CardTitle>
          </CardHeader>
          <CardContent>
            {showAddForm ? (
              <>
                <DonatorForm
                  onSuccess={() => {
                    setShowAddForm(false);
                    setSuccessMsg("Doador adicionado com sucesso!");
                  }}
                  onError={(err) => setSuccessMsg(`Erro: ${err.message}`)}
                />
                <Button
                  variant="outline"
                  className="mt-4 w-full text-sm sm:text-base"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-green hover:bg-cm-green/90 text-sm sm:text-base"
                onClick={() => setShowAddForm(true)}
              >
                Adicionar
              </Button>
            )}
            {successMsg && (
              <div className="mt-2 text-green-700 text-sm sm:text-base">{successMsg}</div>
            )}
          </CardContent>
        </Card>
        {/* Lista de Doadores */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg md:text-xl">Lista de Doadores</CardTitle>
          </CardHeader>
          <CardContent>
            {showList ? (
              <>
                <DonatorsList />
                <Button
                  variant="outline"
                  className="mt-4 w-full text-sm sm:text-base"
                  onClick={() => setShowList(false)}
                >
                  Fechar
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-cm-blue hover:bg-cm-blue/90 text-sm sm:text-base"
                onClick={() => setShowList(true)}
              >
                Ver Todos
              </Button>
            )}
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
      <div className="flex-grow bg-cm-bg py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bebas mb-4 sm:mb-6 md:mb-8">Painel do Administrador</h1>
          
          <ErrorBoundary>
            <Tabs defaultValue="books" onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap gap-1 sm:gap-2 bg-white p-1.5 sm:p-2 rounded-t-2xl shadow-sm relative border-b border-gray-200">
                {[
                  { value: "books", label: "Livros", color: "bg-cm-red text-white" },
                  { value: "users", label: "Usuários", color: "bg-cm-orange text-white" },
                  { value: "loans", label: "Empréstimos", color: "bg-cm-yellow text-white" },
                  { value: "donators", label: "Doadores", color: "bg-cm-green text-white" },
                  { value: "notifications", label: "Notificações", color: "bg-cm-green text-white" },
                  { value: "reports", label: "Relatórios", color: "bg-cm-blue text-white" },
                  { value: "settings", label: "Configurações", color: "bg-gray-700 text-white" },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`
                      px-2 sm:px-3 py-1 sm:py-1.5 mx-0.5 sm:mx-1 rounded-t-xl sm:rounded-t-2xl font-semibold transition-all duration-200 relative text-xs sm:text-sm md:text-base
                      ${activeTab === tab.value 
                        ? "!bg-gray-200 !text-gray-900 shadow-lg scale-105 z-20 border-b-0"
                        : `${tab.color} z-10 border-b-2 border-gray-200`
                      }
                      hover:scale-105 sm:hover:scale-110 hover:shadow-xl
                    `}
                    style={{ minWidth: "70px" }}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
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
                  <TabsContent value="donators">
                    <ErrorBoundary>
                      <ManageDonators />
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