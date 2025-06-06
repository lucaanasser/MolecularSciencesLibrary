/**
 * Tipos relacionados a usuários.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export interface User {
  id?: number;
  name: string;
  role: string;
  NUSP?: number;
  email?: string;
  photoUrl?: string;
  token?: string;
  profile_image?: string; // Caminho da imagem de perfil
}