import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import AddBookForm from "@/components/AddBookForm";

// --- Gerenciamento de Livros ---
const ManageBooks = () => {
  const [selectedTab, setSelectedTab] = useState<"add" | "remove" | null>(null);

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Gerenciamento de Livros</h2>
      <p>Aqui você pode adicionar ou remover livros do acervo da biblioteca.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Adicionar Livro</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-cm-green hover:bg-cm-green/90 hover:scale-110" 
              onClick={() => setSelectedTab("add")}
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
            <Button className="w-full bg-cm-red hover:bg-cm-red/90 hover:scale-110"
              onClick={() => setSelectedTab("remove")}
            >Remover</Button>
          </CardContent>
        </Card>
      </div>
      {selectedTab === "add" && (
        <div className="mt-6">
          <Button variant="outline" className="mb-4 rounded-xl" onClick={() => setSelectedTab(null)}>
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Adicionar Novo Livro</CardTitle>
            </CardHeader>
            <CardContent>
              <AddBookForm
                onCancel={() => setSelectedTab(null)}
                onSuccess={() => setSelectedTab(null)}
              />
            </CardContent>
          </Card>
        </div>
      )}
      {selectedTab === "remove" && (
        <div className="mt-6">
          <Button variant="outline" className="mb-4 rounded-xl" onClick={() => setSelectedTab(null)}>
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Remover Livro</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Aqui você pode implementar a lógica de remoção futuramente */}
              <p>Em breve: funcionalidade para remover livros do acervo.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// --- Gerenciamento de Usuários ---
const ManageUsers = () => (
  <div className="p-4">
    <h2 className="text-2xl mb-4">Gerenciamento de Usuários</h2>
    <p>Cadastre novos usuários ou edite informações de usuários existentes.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Adicionar Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-cm-green hover:bg-cm-green/90">Adicionar</Button>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-cm-blue hover:bg-cm-blue/90">Ver Todos</Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

// --- Gerenciamento de Empréstimos ---
const ManageLoans = () => (
  <div className="p-4">
    <h2 className="text-2xl mb-4">Gerenciamento de Empréstimos</h2>
    <p>Gerencie empréstimos, devoluções e multas dos usuários.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Novos Empréstimos</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-cm-green hover:bg-cm-green/90">Registrar</Button>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Devoluções</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-cm-orange hover:bg-cm-orange/90">Processar</Button>
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

// --- Notificações ---
const Notifications = () => (
  <div className="p-4">
    <h2 className="text-2xl mb-4">Notificações</h2>
    <p>Envie notificações para usuários sobre devoluções e eventos.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Enviar Avisos</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-cm-yellow hover:bg-cm-yellow/90 text-black">Enviar</Button>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-cm-blue hover:bg-cm-blue/90">Ver Todos</Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

// --- Relatórios ---
const Reports = () => (
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

// --- Configurações ---
const Settings = () => (
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

// --- Página Principal do Admin ---
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("books");

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-cm-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bebas mb-8">Painel do Administrador</h1>
          
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
                  <ManageBooks />
                </TabsContent>
                <TabsContent value="users">
                  <ManageUsers />
                </TabsContent>
                <TabsContent value="loans">
                  <ManageLoans />
                </TabsContent>
                <TabsContent value="notifications">
                  <Notifications />
                </TabsContent>
                <TabsContent value="reports">
                  <Reports />
                </TabsContent>
                <TabsContent value="settings">
                  <Settings />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
          
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
