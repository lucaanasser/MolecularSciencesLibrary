
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";
import { PageContainer } from "@/lib/PageContainer";

// Log de início de renderização da página de login
console.log("🔵 [LoginPage] Renderizando página de login");

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PageContainer className="py-16">
        <h2>Login</h2>
        <p>
          É bom te ver por aqui de novo! Insira seu email ou NUSP e senha pessoal para logar no site e acessar todos os recursos da Biblioteca Moleculares.
        </p>
         <div className="w-full">
            <LoginForm />
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
};

export default LoginPage;
