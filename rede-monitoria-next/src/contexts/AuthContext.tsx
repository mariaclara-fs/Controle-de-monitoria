"use client";

import { createContext, ReactNode, useMemo } from "react";

type AuthContextType = {
  usuario: null;
};

export const AuthContext = createContext<AuthContextType>({
  usuario: null
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useMemo(() => ({ usuario: null }), []);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}