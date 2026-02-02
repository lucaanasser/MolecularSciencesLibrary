import React from "react";
import CSVImportWizard from "@/features/admin/components/CSVImportWizard";

interface ImportUsersProps {
  onBack: () => void;
  onCancel: () => void;
  onSuccess: (results: any) => void;
  onError: (err: Error) => void;
}

const ImportUsers: React.FC<ImportUsersProps> = ({ onBack, onCancel, onSuccess, onError }) => {
  // Template CSV para usuários com todos os campos
  const templateCsv = `name,NUSP,email,phone,role,class,profile_image,password_hash
João Silva,12345678,joao@email.com,+5511999998888,aluno,33,,
Maria Santos,87654321,maria@email.com,+5511988887777,aluno,33,,
Pedro Proaluno,11223344,pedro@email.com,+5511977776666,proaluno,,,
Admin User,99887766,admin@email.com,+5511966665555,admin,,,$2b$10$abcdefghijklmnopqrstuvwxyz123456789`;

  // Instruções customizadas
  const instructions = (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">Campos obrigatórios:</p>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li><strong>name</strong>: Nome completo do usuário</li>
        <li><strong>NUSP</strong>: Número USP (apenas dígitos, deve ser único)</li>
        <li><strong>email</strong>: Email (deve ser único)</li>
        <li><strong>phone</strong>: Telefone com DDD (formato: +5511999998888 ou 11999998888)</li>
        <li><strong>role</strong>: Tipo de usuário - "admin", "aluno" ou "proaluno"</li>
        <li><strong>class</strong>: Turma (ex: "33", "34")</li>
      </ul>
      
      <p className="text-sm font-semibold text-gray-700 mt-4">Campos opcionais:</p>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li><strong>profile_image</strong>: Caminho da imagem de perfil (ex: /images/foto.png)</li>
        <li><strong>password_hash</strong>: Hash bcrypt da senha (para migrações/backups)</li>
      </ul>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
        <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Importante sobre senhas:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
          <li><strong>Se password_hash estiver VAZIO</strong>: O usuário receberá um email de boas-vindas com link para criar sua senha (recomendado para novos usuários)</li>
          <li><strong>Se password_hash estiver PREENCHIDO</strong>: O hash bcrypt será usado diretamente no banco de dados (apenas para migrações ou restauração de backups)</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <p className="text-sm font-semibold text-blue-800 mb-1">💡 Dica:</p>
        <p className="text-sm text-blue-700">
          Para criar novos usuários, deixe o campo <code className="bg-blue-100 px-1 rounded">password_hash</code> vazio. 
          Os usuários receberão automaticamente um email para configurar sua senha.
        </p>
      </div>
    </div>
  );

  return (
    <CSVImportWizard
      endpoint="/api/users/import/csv"
      requiredFields={["name", "NUSP", "email", "phone", "role", "class"]}
      instructions={instructions}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onError={onError}
      templateCsv={templateCsv}
      templateName="template_usuarios.csv"
    />
  );
};

export default ImportUsers;
