import { Role } from "@/constants/users";

export interface User {
  id: number;
  name: string;
  role: Role;
  
  class?: number;
  NUSP?: number;
  email?: string;
  phone?: string;

  profile_image?: string; // qual o formato? url?
  
  token?: string; // é o token para definição de senha??
}