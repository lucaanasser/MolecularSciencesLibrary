import { useEffect, useState } from "react";
import { User } from "../features/users/types/user";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

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