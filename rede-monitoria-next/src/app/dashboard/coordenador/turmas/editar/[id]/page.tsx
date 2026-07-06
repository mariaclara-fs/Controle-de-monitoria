"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import TurmaForm from "@/components/turmas/TurmaForm";
import { TurmaFormData } from "@/schemas/turmaSchema";
import { supabase } from "@/services/supabase";

export default function EditarTurmaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [defaultValues, setDefaultValues] = useState<TurmaFormData>();
  const [alunos, setAlunos] = useState<{ id: string; nome: string }[]>([]);
  const [monitorSelecionado, setMonitorSelecionado] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const [{ data: turma, error }, { data: alunosDaTurma, error: erroAlunos }] = await Promise.all([
          supabase
            .from("turmas")
            .select("*, profiles!monitor_id(nome)")
            .eq("id", id)
            .single(),
          supabase
            .from("profiles")
            .select("id, nome")
            .eq("perfil", "aluno")
            .order("nome", { ascending: true }),
        ]);

        if (error || !turma) throw new Error("Erro ao carregar");
        if (erroAlunos) throw erroAlunos;

        setDefaultValues({
          nome: turma.nome,
          curso: turma.curso,
        });

        setAlunos(alunosDaTurma ?? []);
        setMonitorSelecionado(turma.monitor_id ?? "");

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
      const monitorId = monitorSelecionado.trim();

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
      let monitorAnteriorId: string | null = null;

      const { data: turmaAtual, error: erroTurmaAtual } = await supabase
        .from("turmas")
        .select("monitor_id")
        .eq("id", id)
        .single();

      if (erroTurmaAtual) throw erroTurmaAtual;
      monitorAnteriorId = turmaAtual?.monitor_id ?? null;

      if (monitorId !== "") {
        const { data: alunoSelecionado, error: erroPerfil } = await supabase
          .from("profiles")
          .select("id, perfil")
          .eq("id", monitorId)
          .maybeSingle();

        if (erroPerfil) throw erroPerfil;

        if (!alunoSelecionado) {
          alert("O aluno selecionado não foi encontrado. Tente novamente.");
          setSalvando(false);
          return;
        }

        if (alunoSelecionado.perfil !== "aluno") {
          alert("Selecione um usuário com perfil de aluno para definir como monitor.");
          setSalvando(false);
          return;
        }

        monitorUuid = alunoSelecionado.id;
      }

      const { error: erroUpdate } = await supabase
        .from("turmas")
        .update({
          nome,
          curso,
          monitor_id: monitorUuid,
        })
        .eq("id", id);

      if (erroUpdate) throw erroUpdate;

      if (monitorAnteriorId && monitorAnteriorId !== monitorUuid) {
        await supabase
          .from("profiles")
          .update({ perfil: "aluno", turma_id: null })
          .eq("id", monitorAnteriorId);
      }

      if (monitorUuid) {
        await supabase
          .from("profiles")
          .update({ perfil: "monitor", turma_id: id })
          .eq("id", monitorUuid);
      }

      if (erroUpdate) throw erroUpdate;

      alert("Turma editada com sucesso!");
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
                <label htmlFor="nomeMonitor" className="block text-sm font-medium text-gray-700 mb-2">
                  Aluno monitor responsável
                </label>
                <select
                  id="nomeMonitor"
                  value={monitorSelecionado}
                  onChange={(e) => setMonitorSelecionado(e.target.value)}
                  disabled={salvando}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none disabled:bg-gray-100 text-gray-800"
                >
                  <option value="">Nenhum monitor</option>
                  {alunos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecione um aluno para definir como monitor da turma. Deixe em branco para remover o monitor.
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