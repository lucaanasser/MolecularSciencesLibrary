import LoginForm from "@/components/LoginForm";

// Log de início de renderização da página de login
console.log("🔵 [LoginPage] Renderizando página de login");

const LoginPage = () => {
  return (
    <div className="content-container">
        <h2>Login</h2>
        <p>
          É bom te ver por aqui de novo! 
          Insira seu email ou NUSP e senha pessoal para logar no site 
          e acessar todos os recursos da Biblioteca Moleculares.
        </p>
         <div className="w-full">
            <LoginForm />
        </div>      
    </div>
  );
};

export default LoginPage;
