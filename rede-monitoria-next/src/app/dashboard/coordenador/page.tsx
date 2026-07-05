"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  listarTurmas,
  deletarTurma
} from "@/services/turmaService";

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
  ativo: boolean;
}

const ITENS_POR_PAGINA = 10;

export default function DashboardCoordenador() {

  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const [paginaTurmas, setPaginaTurmas] = useState(1);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function carregarTurmas() {

    const data = await listarTurmas();

    setTurmas(data ?? []);

  }

  async function carregarUsuarios() {

    const { data, error } = await supabase

      .from("profiles")

      .select("id, nome, matricula, perfil, ativo")

      .eq("ativo", true)

      .order("nome");

    if (error) {

      console.error(error);

      setUsuarios([]);

      return;

    }

    setUsuarios(data ?? []);

  }

  async function handleDeleteTurma(id: string) {

    const confirmar = confirm(
      "Deseja realmente excluir esta turma?"
    );

    if (!confirmar)
      return;

    try {

      await deletarTurma(id);

      await carregarTurmas();
      setPaginaTurmas(1);

      alert("Turma excluída com sucesso!");

    } catch {

      alert("Erro ao excluir turma.");

    }

  }

  async function handleDeleteUsuario(id: string) {

    const confirmar = confirm(
      "Deseja realmente desativar este usuário?"
    );

    if (!confirmar)
      return;

    const { error } = await supabase

      .from("profiles")

      .update({
        ativo: false
      })

      .eq("id", id);

    if (error) {

      alert("Erro ao desativar usuário.");

      return;

    }

    await carregarUsuarios();
    setPaginaUsuarios(1);

    alert("Usuário desativado com sucesso!");

  }

  useEffect(() => {

    carregarTurmas();

    carregarUsuarios();

  }, []);

  const totalPaginasUsuarios = Math.max(
    1,
    Math.ceil(usuarios.length / ITENS_POR_PAGINA)
  );

  const totalPaginasTurmas = Math.max(
    1,
    Math.ceil(turmas.length / ITENS_POR_PAGINA)
  );

  const usuariosPagina = usuarios.slice(
    (paginaUsuarios - 1) * ITENS_POR_PAGINA,
    paginaUsuarios * ITENS_POR_PAGINA
  );

  const turmasPagina = turmas.slice(
    (paginaTurmas - 1) * ITENS_POR_PAGINA,
    paginaTurmas * ITENS_POR_PAGINA
  );

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
              Dashboard
            </h1>

            <div className="relative">

              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="w-9 h-9 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#166534] transition-all duration-200 cursor-pointer"
              >
                <i className="fa-solid fa-user"></i>
              </button>

              {menuAberto && (

                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg overflow-hidden z-50">

                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100"
                  >
                    <i className="fa-solid fa-user"></i>
                    Meu perfil
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

        <main className="flex-1 px-6 py-12">

          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">

              <div>

                <h2 className="text-3xl font-bold text-gray-800">
                  Painel do Coordenador
                </h2>

                <p className="text-gray-600 mt-2">
                  Gerencie usuários e turmas da plataforma.
                </p>

              </div>

              <Link
                href="/dashboard/coordenador/turmas/nova"
                className="mt-5 md:mt-0 bg-[#166534] text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm hover:shadow-md"
              >
                Nova Turma
              </Link>

            </div>

            <div className="grid gap-8 lg:grid-cols-2">

              <section className="bg-white rounded-xl shadow-sm p-6">

                <h3 className="text-2xl font-bold text-[#166534] mb-6">
                  Usuários
                </h3>

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="bg-[#166534] text-white">

                        <th className="text-left py-3 px-3">
                          Nome
                        </th>

                        <th className="text-left py-3 px-3">
                          Matrícula
                        </th>

                        <th className="text-left py-3 px-3">
                          Perfil
                        </th>

                        <th className="text-center py-3 px-3">
                          Ações
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {usuariosPagina.length === 0 ? (

                        <tr>

                          <td
                            colSpan={4}
                            className="text-center py-6 text-gray-500"
                          >
                            Nenhum usuário cadastrado.
                          </td>

                        </tr>

                      ) : (

                        usuariosPagina.map((usuario, index) => (

                          <tr
                            key={usuario.id}
                            className={`border-b hover:bg-green-50 transition ${
                              index % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50"
                            }`}
                          >

                            <td className="py-3 px-3">
                              {usuario.nome}
                            </td>

                            <td className="py-3 px-3">
                              {usuario.matricula}
                            </td>

                            <td className="py-3 px-3 capitalize">
                              {usuario.perfil}
                            </td>

                            <td className="py-3 px-3 text-center">

                              <button
                                onClick={() =>
                                  handleDeleteUsuario(usuario.id)
                                }
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition cursor-pointer"
                              >
                                Desativar
                              </button>

                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

                <div className="flex justify-between items-center mt-5">

                  <button

                    disabled={paginaUsuarios === 1}

                    onClick={() =>
                      setPaginaUsuarios(paginaUsuarios - 1)
                    }

                    className="px-3 py-2 rounded bg-gray-200 disabled:opacity-40"

                  >
                    Anterior
                  </button>

                  <span className="font-medium">

                    Página {paginaUsuarios} de {totalPaginasUsuarios}

                  </span>

                  <button

                    disabled={paginaUsuarios >= totalPaginasUsuarios}

                    onClick={() =>
                      setPaginaUsuarios(paginaUsuarios + 1)
                    }

                    className="px-3 py-2 rounded bg-gray-200 disabled:opacity-40"

                  >
                    Próxima
                  </button>

                </div>

              </section>

              <section className="bg-white rounded-xl shadow-sm p-6">

                <h3 className="text-2xl font-bold text-[#166534] mb-6">
                  Turmas
                </h3>

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="bg-[#166534] text-white">

                        <th className="text-left py-3 px-3">
                          Nome
                        </th>

                        <th className="text-left py-3 px-3">
                          Curso
                        </th>

                        <th className="text-center py-3 px-3">
                          Ações
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {turmasPagina.length === 0 ? (

                        <tr>

                          <td
                            colSpan={3}
                            className="text-center py-6 text-gray-500"
                          >
                            Nenhuma turma cadastrada.
                          </td>

                        </tr>

                      ) : (

                        turmasPagina.map((turma, index) => (

                          <tr
                            key={turma.id}
                            className={`border-b hover:bg-green-50 transition ${
                              index % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50"
                            }`}
                          >

                            <td className="py-3 px-3">
                              {turma.nome}
                            </td>

                            <td className="py-3 px-3">
                              {turma.curso}
                            </td>

                            <td className="py-3 px-3">

                              <div className="flex justify-center gap-2">

                                <Link
                                  href={`/dashboard/coordenador/turmas/editar/${turma.id}`}
                                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                                >
                                  Editar
                                </Link>

                                <button
                                  onClick={() =>
                                    handleDeleteTurma(turma.id)
                                  }
                                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition cursor-pointer"
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

                <div className="flex justify-between items-center mt-5">

                  <button

                    disabled={paginaTurmas === 1}

                    onClick={() =>
                      setPaginaTurmas(paginaTurmas - 1)
                    }

                    className="px-3 py-2 rounded bg-gray-200 disabled:opacity-40 cursor-pointer"

                  >
                    Anterior
                  </button>

                  <span className="font-medium">

                    Página {paginaTurmas} de {totalPaginasTurmas}

                  </span>

                  <button

                    disabled={paginaTurmas >= totalPaginasTurmas}

                    onClick={() =>
                      setPaginaTurmas(paginaTurmas + 1)
                    }

                    className="px-3 py-2 rounded bg-gray-200 disabled:opacity-40 cursor-pointer"

                  >
                    Próxima
                  </button>

                </div>

              </section>

            </div>

          </div>

        </main>

        <footer className="bg-[#166534] text-white text-center text-xs py-2.5">
          &copy; 2026 - Rede de Monitoria. Todos os direitos reservados.
        </footer>

      </div>

    </ProtectedRoute>

  );

}