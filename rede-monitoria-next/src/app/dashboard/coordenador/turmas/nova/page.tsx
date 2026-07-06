"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import TurmaForm from "@/components/turmas/TurmaForm";

import { TurmaFormData } from "@/schemas/turmaSchema";
import { criarTurma } from "@/services/turmaService";
import { supabase } from "@/services/supabase";

export default function NovaTurmaPage() {

  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acessoPermitido, setAcessoPermitido] = useState(false);
  const [carregandoAcesso, setCarregandoAcesso] = useState(true);

  async function handleCreate(data: TurmaFormData) {

    setLoading(true);

    try {

      const nome = data.nome.trim();
      const curso = data.curso.trim();

      const { data: turmaExistente, error: erroBusca } = await supabase
        .from("turmas")
        .select("id")
        .ilike("nome", nome)
        .maybeSingle();

      if (erroBusca) {
        throw erroBusca;
      }

      if (turmaExistente) {
        alert("Já existe uma turma cadastrada com esse nome.");
        return;
      }

      await criarTurma(nome, curso);

      alert("Turma criada com sucesso!");

      router.push("/dashboard/coordenador");

    } catch (error) {

      console.error(error);

      alert("Erro ao criar turma.");

    } finally {

      setLoading(false);

    }

  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  useState(() => {
    let ativo = true;

    async function verificarAcesso() {
      setCarregandoAcesso(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (ativo) {
            router.replace("/login");
          }
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("perfil")
          .eq("id", user.id)
          .single();

        if (!ativo) return;

        if (error || data?.perfil !== "coordenador") {
          router.replace("/home_aluno");
          return;
        }

        setAcessoPermitido(true);
      } catch (error) {
        console.error("Erro ao validar acesso do coordenador:", error);
        if (ativo) {
          router.replace("/home_aluno");
        }
      } finally {
        if (ativo) {
          setCarregandoAcesso(false);
        }
      }
    }

    verificarAcesso();

    return () => {
      ativo = false;
    };
  });

  if (carregandoAcesso || !acessoPermitido) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (

    <ProtectedRoute>

      <div className="min-h-screen flex flex-col bg-gray-100">

        <header className="bg-[#166534] text-white">

          <div className="w-full px-6 py-2.5 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <img
                src="/Logo_RDM.png"
                alt="Rede de Monitoria"
                className="w-9 h-9 rounded"
              />

              <h1 className="font-bold text-lg">
                Rede de Monitoria
              </h1>

            </div>

            <h1 className="text-xl md:text-2xl font-bold">
              Nova Turma
            </h1>

            <div className="relative">

              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="w-9 h-9 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#166534] transition-all duration-200 cursor-pointer"
              >
                <i className="fa-solid fa-user"></i>
              </button>

              {menuAberto && (

                <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white shadow-lg overflow-hidden z-50">

                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100"
                  >
                    <i className="fa-solid fa-user"></i>
                    Perfil
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Sair
                  </button>

                </div>

              )}

            </div>

          </div>

        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-xl rounded-xl bg-white shadow-sm p-8">

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-2xl font-bold text-gray-800">
                Cadastrar turma
              </h2>

            </div>

            <TurmaForm
              loading={loading}
              onSubmit={handleCreate}
            />

          </div>

        </main>

        <footer className="bg-[#166534] py-2.5 text-center text-xs text-white">
          &copy; 2026 - Rede de Monitoria. Todos os direitos reservados.
        </footer>

      </div>

    </ProtectedRoute>

  );
}