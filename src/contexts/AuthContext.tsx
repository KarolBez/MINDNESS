// src/contexts/AuthContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Paciente = { id?: number; nome?: string; cpf?: string } | null;

type AuthCtx = {
  paciente: Paciente;
  token: string | null;
  setToken: (t: string | null) => void;
  setPaciente: (p: Paciente) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({} as any);

export function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [paciente, setPaciente] = useState<Paciente>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("TISAUDE_PATIENT_BEARER");
    const p = localStorage.getItem("TISAUDE_PACIENTE");
    if (t) setTokenState(t);
    if (p) setPaciente(JSON.parse(p));
  }, []);

  function setToken(t: string | null) {
    setTokenState(t);
    if (t) localStorage.setItem("TISAUDE_PATIENT_BEARER", t);
    else localStorage.removeItem("TISAUDE_PATIENT_BEARER");
  }

  function logout() {
    localStorage.removeItem("TISAUDE_PATIENT_BEARER");
    localStorage.removeItem("TISAUDE_PACIENTE");
    setPaciente(null);
    setTokenState(null);
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  return (
    <Ctx.Provider value={{ paciente, token, setToken, setPaciente, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
export default Ctx;
