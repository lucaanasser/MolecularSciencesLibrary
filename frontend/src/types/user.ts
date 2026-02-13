import { ROLES, IMAGE_PATHS } from "@/constants/users";

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

export type Role = typeof ROLES[number];
export type ImagePath = typeof IMAGE_PATHS[number];