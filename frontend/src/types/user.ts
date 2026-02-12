import { Role, ImagePath } from "@/constants/users";

export interface User {
  id: number;
  name: string;
  role: Role;
  
  class?: number;
  NUSP?: number;
  email?: string;
  phone?: string;

  profile_image?: ImagePath;
}