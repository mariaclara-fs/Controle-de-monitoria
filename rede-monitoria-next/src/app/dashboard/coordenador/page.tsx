"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { listarTurmas, deletarTurma } from "@/services/turmaService";
import { supabase } from "@/services/supabase";

interface Turma {
  id: string;
  nome: string;
  curso: string;
}

interface Usuario {
  id: string;
  nome: string;
  matricula: number | null;
  perfil: string | null;
}

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  async function carregarTurmas() {
    const data = await listarTurmas();
    setTurmas(data ?? []);
  }

  async function carregarUsuarios() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome, matricula, perfil")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsuarios([]);
      return;
    }

    setUsuarios(data ?? []);
  }

  async function handleDeleteTurma(id: string) {
    const confirmar = confirm("Deseja realmente excluir esta turma?");

    if (!confirmar) return;

    try {
      await deletarTurma(id);
      await carregarTurmas();
      alert("Turma excluída com sucesso!");
    } catch {
      alert("Erro ao excluir turma.");
    }
  }

  async function handleDeleteUsuario(id: string) {
    const confirmar = confirm("Deseja realmente excluir este usuário?");

    if (!confirmar) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir usuário.");
      return;
    }

    await carregarUsuarios();
    alert("Usuário excluído com sucesso!");
  }

  useEffect(() => {
    carregarTurmas();
    carregarUsuarios();
  }, []);

  return (
    <main className="max-w-6xl mx-auto mt-8 space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Turmas e Usuários</h1>
        </div>
        <Link
          href="/dashboard/coordenador/turmas/nova"
          className="inline-flex items-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Nova Turma
        </Link>
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Usuários</h2>
              <p className="text-gray-500">Tabela de usuários carregada diretamente do Supabase.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2 text-left">Nome</th>
                  <th className="border p-2 text-left">Matrícula</th>
                  <th className="border p-2 text-left">Perfil</th>
                  <th className="border p-2 w-52 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-500">
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="border p-2">{usuario.nome}</td>
                      <td className="border p-2">{usuario.matricula ?? "-"}</td>
                      <td className="border p-2">{usuario.perfil ?? "aluno"}</td>
                      <td className="border p-2">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteUsuario(usuario.id)}
                            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Turmas</h2>
              <p className="text-gray-500">Lista de turmas com ações de edição e exclusão.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2 text-left">Nome</th>
                  <th className="border p-2 text-left">Curso</th>
                  <th className="border p-2 w-56 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {turmas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-4 text-gray-500">
                      Nenhuma turma cadastrada.
                    </td>
                  </tr>
                ) : (
                  turmas.map((turma) => (
                    <tr key={turma.id}>
                      <td className="border p-2">{turma.nome}</td>
                      <td className="border p-2">{turma.curso}</td>
                      <td className="border p-2">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/dashboard/coordenador/turmas/editar/${turma.id}`}
                            className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteTurma(turma.id)}
                            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
