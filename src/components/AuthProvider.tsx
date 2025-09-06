"use client";
import { AuthProviderInner } from "@/contexts/AuthContext";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderInner>{children}</AuthProviderInner>;
}
