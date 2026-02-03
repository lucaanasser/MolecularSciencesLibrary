import React from "react";
import CSVImportWizard from "@/features/admin/components/CSVImportWizard";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const ImportUsers: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  // Template CSV para usuários com todos os campos
  const templateCsv = `name,NUSP,email,phone,role,class,profile_image,password_hash
João Silva,12345678,joao@email.com,+5511999998888,aluno,33,,
Maria Santos,87654321,maria@email.com,+5511988887777,aluno,33,,
Pedro Proaluno,11223344,pedro@email.com,+5511977776666,proaluno,,,
Admin User,99887766,admin@email.com,+5511966665555,admin,,,$2b$10$abcdefghijklmnopqrstuvwxyz123456789`;

  // Instruções customizadas
  const instructions = (
    <div className="prose-xs">
      <div className="font-semibold">Campos obrigatórios:</div>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>name</strong>: Nome completo do usuário</li>
        <li><strong>NUSP</strong>: Número USP (apenas dígitos, deve ser único)</li>
        <li><strong>email</strong>: Email (deve ser único)</li>
        <li><strong>phone</strong>: Telefone com DDD (formato: +5511999998888 ou 11999998888)</li>
        <li><strong>role</strong>: Tipo de usuário - "admin", "aluno" ou "proaluno"</li>
        <li><strong>class</strong>: Turma (ex: "33", "34")</li>
      </ul>
      
      <div className="font-semibold mt-4">Campos opcionais:</div>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>profile_image</strong>: Caminho da imagem de perfil (ex: /images/foto.png)</li>
        <li><strong>password_hash</strong>: Hash bcrypt da senha (para migrações/backups)</li>
      </ul>

      <div className="bg-cm-yellow/20 rounded-xl px-4 py-2 my-4">
        <div className="font-semibold text-yellow-600">Importante:</div>
        <ul className="list-disc list-inside space-y-1">
          <li> <strong>Novos usuários:</strong> Deixe o campo <code>password_hash</code> <b>vazio</b>. O usuário receberá automaticamente um e-mail de boas-vindas com um link para criar sua própria senha.</li>
          <li> <strong>Migração ou restauração de backups:</strong> Preencha o campo <code>password_hash</code> com o hash <b>bcrypt</b> da senha desejada. O hash será usado diretamente no banco de dados. Use esta opção apenas em processos de migração ou restauração.</li>
        </ul>
      </div>

    </div>
  );

  return (
    <CSVImportWizard
      endpoint="/api/users/import/csv"
      requiredFields={["name", "NUSP", "email", "phone", "role", "class"]}
      instructions={instructions}
      onCancel={onBack}
      onSuccess={(results: any) => onSuccess(`Importação concluída: ${results.success} sucesso, ${results.failed} falhas`)}
      onError={onError}
      templateCsv={templateCsv}
      templateName="template_usuarios.csv"
    />
  );
};

export default ImportUsers;
