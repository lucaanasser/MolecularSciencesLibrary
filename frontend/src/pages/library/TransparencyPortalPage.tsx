import { logger } from "@/utils/logger";
import { BookOpen, Users, TrendingUp, BarChart3 } from "lucide-react";
import { BooksReportView } from '@/features/reports/components';
import { LoansReportView } from '@/features/reports/components';
import { UsersReportView } from '@/features/reports/components';
import { DonatorsReportView } from '@/features/reports/components';


export default function TransparencyPortalPage() {
  logger.log("🔵 [TransparencyPortalPage] Renderizando página do portal de transparência");
  return (
    <div className="content-container">
      
      
      {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-20">
          
          {/* Ícones decorativos */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-4">
              <div className="h-16 w-16 rounded-2xl bg-library-purple/20 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-library-purple" />
              </div>
              <div className="h-16 w-16 rounded-2xl bg-cm-blue/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-cm-blue" />
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-8">
              <div className="h-16 w-16 rounded-2xl bg-cm-yellow/20 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-cm-orange" />
              </div>
              <div className="h-16 w-16 rounded-2xl bg-cm-green/20 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-cm-green" />
              </div>
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1">
            <h2>Biblioteca em Dados</h2>
            <p>
              Acompanhe em tempo real os dados e estatísticas da biblioteca. 
              Transparência e prestação de contas para toda a comunidade.
            </p>
          </div>
        </div>

      <BooksReportView />
      <div className='mb-20'/>
      <LoansReportView />
      <div className='mb-20'/>
      
        {/* Nota sobre transparência */}
        <div className="flex items-start gap-4 bg-cm-blue/10 rounded-xl p-6">
          <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4>Sobre este Portal</h4>
            <p>
              Este portal tem como objetivo promover a transparência na gestão da biblioteca, 
              apresentando dados agregados e estatísticas sobre o uso do acervo, sem expor 
              informações pessoais dos usuários.
            </p>
            <p>
              Todos os dados são atualizados em tempo real e refletem o estado atual da biblioteca. 
              No futuro, quando a biblioteca começar a receber doações, informações sobre os doadores 
              e o destino dos recursos também serão publicadas aqui.
            </p>
          </div>
        </div>

    </div>      
  );
}
