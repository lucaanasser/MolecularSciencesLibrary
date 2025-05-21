import { useEffect, useState } from "react";

export interface CurrentUser {
  name: string;
  role: string;
  NUSP?: number;
  email?: string;
  photoUrl?: string;
  token?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
    else setUser(null);
  }, []);

  // Atualiza o hook caso o localStorage mude (ex: logout em outra aba)
  useEffect(() => {
    const handler = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));
      else setUser(null);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return user;
}