"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import TurmaForm from "@/components/turmas/TurmaForm";
import { buscarTurmaPorId } from "@/services/turmaService";
import { TurmaFormData } from "@/schemas/turmaSchema";
import { supabase } from "@/services/supabase";

export default function EditarTurmaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [defaultValues, setDefaultValues] = useState<TurmaFormData>();
  
  const [nomeMonitor, setNomeMonitor] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const { data: turma, error } = await supabase
          .from("turmas")
          .select("*, profiles!monitor_id(nome)") 
          .eq("id", id)
          .single();

        if (error || !turma) throw new Error("Erro ao carregar");

        setDefaultValues({
          nome: turma.nome,
          curso: turma.curso,
        });

        if (turma.profiles?.nome) {
          setNomeMonitor(turma.profiles.nome);
        }

      } catch {
        alert("Erro ao carregar turma.");
        router.push("/dashboard/coordenador");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id, router]);

  async function handleUpdate(data: TurmaFormData) {
    setSalvando(true);

    try {
      const nome = data.nome.trim();
      const curso = data.curso.trim();
      const nomeLimpo = nomeMonitor.trim();

      const { data: turmaExistente } = await supabase
        .from("turmas")
        .select("id")
        .ilike("nome", nome)
        .neq("id", id)
        .maybeSingle();

      if (turmaExistente) {
        alert("Já existe uma turma cadastrada com esse nome.");
        setSalvando(false);
        return;
      }

      let monitorUuid: string | null = null;

      if (nomeLimpo !== "") {
        const { data: perfilMonitor, error: erroPerfil } = await supabase
          .from("profiles")
          .select("id, perfil")
          .ilike("nome", nomeLimpo)
          .maybeSingle();

        if (erroPerfil) throw erroPerfil;

        if (!perfilMonitor) {
          alert(`Nenhum usuário encontrado com o nome "${nomeLimpo}". Certifique-se de que ele já possui cadastro.`);
          setSalvando(false);
          return;
        }

        if (perfilMonitor.perfil !== "monitor") {
          alert("O usuário encontrado possui esse nome, mas o perfil dele não é 'monitor'.");
          setSalvando(false);
          return;
        }

        monitorUuid = perfilMonitor.id;
      }

  
      const { error: erroUpdate } = await supabase
        .from("turmas")
        .update({
          nome,
          curso,
          monitor_id: monitorUuid 
        })
        .eq("id", id);

      if (erroUpdate) throw erroUpdate;

      alert("Turma updated com sucesso!");
      router.push("/dashboard/coordenador");

    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar turma.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
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
            <h1 className="text-xl md:text-2xl font-bold">Editar Turma</h1>
            
            <div className="relative">
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="w-9 h-9 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#166534] transition-all duration-200 cursor-pointer"
              >
                <i className="fa-solid fa-user"></i>
              </button>
              {menuAberto && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white shadow-lg overflow-hidden z-50">
                  <Link href="/perfil" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100">
                    <i className="fa-solid fa-user"></i> Perfil
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-gray-100 cursor-pointer">
                    <i className="fa-solid fa-right-from-bracket"></i> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar turma</h2>
            
            <TurmaForm
              defaultValues={defaultValues}
              loading={salvando}
              onSubmit={handleUpdate}
            >
              <div className="mb-6 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Monitor Responsável
                </label>
                <input
                  type="text"
                  value={nomeMonitor}
                  onChange={(e) => setNomeMonitor(e.target.value)}
                  placeholder="Ex: João Silva Santos"
                  disabled={salvando}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#166534] focus:border-transparent outline-none disabled:bg-gray-100 text-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Insira o nome completo ou exatamente como o monitor se cadastrou. Deixe em branco para remover o monitor.
                </p>
              </div>
            </TurmaForm>
          </div>
        </main>

        <footer className="bg-[#166534] py-2.5 text-center text-xs text-white">
          &copy; 2026 - Rede de Monitoria. Todos os direitos reservados.
        </footer>
      </div>
    </ProtectedRoute>
  );
}