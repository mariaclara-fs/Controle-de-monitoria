"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "@/components/ProtectedRoute";
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

  async function handleDelete(id: string) {
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void carregarTurmas();
      void carregarUsuarios();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <ProtectedRoute>
      <main className="max-w-6xl mx-auto mt-8 px-4 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gerenciamento de Turmas</h1>
          <Link
            href="/dashboard/coordenador/turmas/nova"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Nova Turma
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Turmas</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border-b border-gray-300 p-3 text-left">Nome</th>
                  <th className="border-b border-gray-300 p-3 text-left">Curso</th>
                  <th className="border-b border-gray-300 p-3 text-center w-56">Ações</th>
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
                    <tr key={turma.id} className="hover:bg-gray-50">
                      <td className="border-b border-gray-200 p-3">{turma.nome}</td>
                      <td className="border-b border-gray-200 p-3">{turma.curso}</td>
                      <td className="border-b border-gray-200 p-3">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/dashboard/coordenador/turmas/editar/${turma.id}`}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(turma.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Usuários</h2>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border-b border-gray-300 p-3 text-left">Nome</th>
                  <th className="border-b border-gray-300 p-3 text-left">Matrícula</th>
                  <th className="border-b border-gray-300 p-3 text-left">Perfil</th>
                  <th className="border-b border-gray-300 p-3 text-center w-56">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="border-b border-gray-200 p-3">{usuario.nome}</td>
                      <td className="border-b border-gray-200 p-3">
                        {usuario.matricula ?? "-"}
                      </td>
                      <td className="border-b border-gray-200 p-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-sm font-medium ${
                            usuario.perfil === "coordenador"
                              ? "bg-purple-100 text-purple-700"
                              : usuario.perfil === "monitor"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {usuario.perfil ?? "aluno"}
                        </span>
                      </td>
                      <td className="border-b border-gray-200 p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            Editar perfil
                          </button>
                          <button
                            type="button"
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
        </section>
      </main>
    </ProtectedRoute>
  );
}