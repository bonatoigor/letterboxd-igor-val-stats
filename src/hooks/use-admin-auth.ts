import { useEffect, useState } from "react";

const AUTH_KEY = "lb_admin_auth";
const AUTH_EVENT = "lb-admin-auth-change";

const readAuthed = () => {
  try {
    return localStorage.getItem(AUTH_KEY) === "true";
  } catch {
    return false;
  }
};

export function useAdminAuth() {
  const [authed, setAuthed] = useState(readAuthed);

  // Keep every component using the hook in sync when someone logs in or out.
  useEffect(() => {
    const sync = () => setAuthed(readAuthed());
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const login = (user: string, pass: string) => {
    if (user === "igorbonato" && pass === "C@melodromo12") {
      localStorage.setItem(AUTH_KEY, "true");
      window.dispatchEvent(new Event(AUTH_EVENT));
      return true;
    }
    return false;
  };
  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event(AUTH_EVENT));
  };
  return { authed, login, logout };
}
