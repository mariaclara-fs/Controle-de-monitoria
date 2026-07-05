"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children
}: ProtectedRouteProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    verificarUsuario();
  }, [router]);

  async function verificarUsuario() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("ativo")
      .eq("id", user.id)
      .single();

    if (!profile?.ativo) {
      await supabase.auth.signOut();
      router.replace("/login");
      return;
    }

    setCarregando(false);
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">
          Carregando...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}