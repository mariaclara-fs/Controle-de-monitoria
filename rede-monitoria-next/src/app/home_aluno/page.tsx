"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Turma } from "@/types/turma";

export default function HomeAluno() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [carregandoTurmas, setCarregandoTurmas] = useState(true);
  const [erroTurmas, setErroTurmas] = useState("");
  const [perfilUsuario, setPerfilUsuario] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setErroTurmas("");
      setCarregandoTurmas(true);

      try {
        // 1. Obtém o usuário logado
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) throw new Error("Usuário não autenticado");

        // 2. Busca o perfil para identificar o tipo de usuário (aluno ou monitor)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("perfil, turma_id")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        
        if (ativo) setPerfilUsuario(profile.perfil);

        // 3. Aplica a regra de negócio baseada no perfil
        if (profile.perfil === "monitor") {
          // Monitor: Só vê a turma na qual foi designado
          if (!profile.turma_id) {
            if (ativo) setTurmas([]); 
            return;
          }

          const { data: turmaMonitor, error: errorTurma } = await supabase
            .from("turmas")
            .select("*")
            .eq("id", profile.turma_id);

          if (errorTurma) throw errorTurma;
          if (ativo) setTurmas(turmaMonitor ?? []);

        } else {
          // Aluno (ou outros perfis): Vê TODAS as turmas do sistema comercial livremente
          const { data: todasTurmas, error: errorTodas } = await supabase
            .from("turmas")
            .select("*");

          if (errorTodas) throw errorTodas;
          if (ativo) setTurmas(todasTurmas ?? []);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        if (ativo) {
          setErroTurmas("Não foi possível carregar as turmas no momento.");
        }
      } finally {
        if (ativo) {
          setCarregandoTurmas(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gray-100">
        
        <header className="bg-[#166534] text-white">
          <div className="w-full px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/Logo_RDM.png" alt="Rede de Monitoria" className="w-9 h-9 rounded" />
              <h1 className="font-bold text-lg">Rede de Monitoria</h1>
            </div>
            <h1 className="text-xl md:text-2xl font-bold">Turmas</h1>
            
            <div className="relative">
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="w-9 h-9 rounded-full border border-white flex items-center justify-center font-medium text-white cursor-pointer hover:bg-white hover:text-[#166534] transition-all duration-200"
              >
                <i className="fa-solid fa-user text-base"></i>
              </button>

              {menuAberto && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                  <Link href="/perfil" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100">
                    <i className="fa-solid fa-user"></i> Meu perfil
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-gray-100 cursor-pointer">
                    <i className="fa-solid fa-right-from-bracket"></i> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-16">
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                {perfilUsuario === "monitor" ? "Sua Disciplina" : "Turmas Disponíveis"}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {perfilUsuario === "monitor" 
                  ? "Gerencie os conteúdos e acompanhe os alunos da sua turma de monitoria."
                  : "Acesse qualquer turma para acompanhar os conteúdos disponibilizados pelos monitores."}
              </p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {carregandoTurmas ? (
                <div className="md:col-span-2 lg:col-span-3 rounded-xl bg-white p-8 text-center text-gray-600">
                  Carregando turmas...
                </div>
              ) : erroTurmas ? (
                <div className="md:col-span-2 lg:col-span-3 rounded-xl bg-white p-8 text-center text-red-600">
                  {erroTurmas}
                </div>
              ) : turmas.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 rounded-xl bg-white p-8 text-center text-gray-600">
                  {perfilUsuario === "monitor" 
                    ? "Você ainda não foi vinculado a nenhuma turma pelo coordenador." 
                    : "Nenhuma turma cadastrada no sistema."}
                </div>
              ) : (
                turmas.map((turma) => (
                  <div key={turma.id} className="bg-white rounded-xl shadow-sm p-8 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#166534] mb-4">{turma.nome}</h3>
                      <p className="text-gray-600 mb-6">Curso: {turma.curso}</p>
                    </div>

                    {/* Todos os cards agora possuem apenas a ação direta de Acessar */}
                    <Link
                      href={`/disciplina/${turma.id}`}
                      className="inline-block text-center bg-[#166534] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Acessar turma
                    </Link>
                  </div>
                ))
              )}
            </section>

          </div>
        </main>

        <footer className="bg-[#166534] text-white text-center text-xs py-2.5">
          &copy; 2026 - Rede de Monitoria. Todos os direitos reservados.
        </footer>
      </div>
    </ProtectedRoute>
  );
}