"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Shell({ children }: { children: React.ReactNode }) {
  const { paciente, logout } = useAuth();
  return (
    <div className="max-w-5xl mx-auto p-4">
      <nav className="flex items-center justify-between mb-6">
        <div className="flex gap-4 text-sm">
          <Link href="/agendamento" className="underline">Agendamento</Link>
          <Link href="/minha-agenda" className="underline">Minha agenda</Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {paciente?.nome && <span className="text-gray-600">{paciente.nome}</span>}
          <button onClick={logout} className="px-3 py-1 rounded bg-gray-200">Sair</button>
        </div>
      </nav>
      {children}
    </div>
  );
}
