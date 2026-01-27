import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";

// Log de início de renderização da página de login
console.log("🔵 [LoginPage] Renderizando página de login");

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-cm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
