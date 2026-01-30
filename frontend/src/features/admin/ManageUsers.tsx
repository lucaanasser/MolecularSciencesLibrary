import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AddUserForm from "@/features/users/components/AddUserForm";
import UserList from "@/features/users/components/UserList";
import RemoveUserForm from "@/features/users/components/RemoveUserForm";

const ManageUsers = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  return (
    <div className="p-3 sm:p-4 md:p-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Gerenciamento de Usuários</h2>
        <p className="text-sm sm:text-base text-gray-600">Cadastre, busque ou remova usuários do sistema.</p>
        {!showAddForm && !showUserList && !showRemoveForm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            {/* Adicionar Usuário */}
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base md:text-lg">Adicionar Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                <Button
                    className="w-full bg-cm-green hover:bg-cm-green/90 text-xs sm:text-sm"
                    onClick={() => {
                    console.log("🔵 [AdminPage/ManageUsers] Selecionado: Adicionar Usuário");
                    setShowAddForm(true);
                    }}
                >
                    Adicionar
                </Button>
                </CardContent>
            </Card>
            
            {/* Lista de Usuários */}
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base md:text-lg">Lista de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                <Button
                    className="w-full bg-cm-blue hover:bg-cm-blue/90 text-xs sm:text-sm"
                    onClick={() => {
                    console.log("🔵 [AdminPage/ManageUsers] Selecionado: Ver Todos Usuários");
                    setShowUserList(true);
                    }}
                >
                    Ver Todos
                </Button>
                </CardContent>
            </Card>
            
            {/* Remover Usuário */}
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base md:text-lg">Remover Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                <Button
                    className="w-full bg-cm-red hover:bg-cm-red/90 text-xs sm:text-sm"
                    onClick={() => {
                    console.log("🔵 [AdminPage/ManageUsers] Selecionado: Remover Usuário");
                    setShowRemoveForm(true);
                    }}
                >
                    Remover
                </Button>
                </CardContent>
            </Card>
            </div>
        )}

        {successMsg && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs sm:text-sm">
            {successMsg}
            </div>
        )}

        {/* Formulário de adicionar usuário */}
        {showAddForm && (
            <div className="mt-6">
            <Button 
                variant="outline" 
                className="mb-4 rounded-xl" 
                onClick={() => {
                console.warn("🟡 [AdminPage/ManageUsers] Voltar de adicionar usuário");
                setShowAddForm(false);
                }}
            >
                Voltar
            </Button>
            <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                <CardTitle className="text-xl">Adicionar Usuário</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
            </div>
        )}

        {/* Lista de usuários */}
        {showUserList && (
            <div className="mt-6">
            <Button 
                variant="outline" 
                className="mb-4 rounded-xl" 
                onClick={() => {
                console.warn("🟡 [AdminPage/ManageUsers] Voltar da lista de usuários");
                setShowUserList(false);
                }}
            >
                Voltar
            </Button>
            <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                <CardTitle className="text-xl">Todos os Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                <UserList onClose={() => setShowUserList(false)} />
                </CardContent>
            </Card>
            </div>
        )}

        {/* Formulário de remover usuário */}
        {showRemoveForm && (
            <div className="mt-6">
            <Button 
                variant="outline" 
                className="mb-4 rounded-xl" 
                onClick={() => {
                console.warn("🟡 [AdminPage/ManageUsers] Voltar de remover usuário");
                setShowRemoveForm(false);
                }}
            >
                Voltar
            </Button>
            <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                <CardTitle className="text-xl">Remover Usuário</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
            </div>
        )}
        </div>
    );
};

export default ManageUsers;
