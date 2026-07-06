"use client";

import Link from "next/link";
import { supabase } from "@/services/supabase";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { listarMateriais, criarMaterial, atualizarMaterial, deletarMaterial, } from "@/services/materialService";

type Material = {
  id: string;
  titulo: string;
  arquivo_url: string;
  turma_id?: string;
};

export default function Disciplina(){
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [nome, setNome] = useState("Nome da disciplina");
  const [professor, setProfessor] = useState("Indefinido");
  const [turma, setTurma] = useState("-");
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [tituloMaterial, setTituloMaterial] = useState("");
  const [linkMaterial, setLinkMaterial] = useState("");
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [carregandoMateriais, setCarregandoMateriais] = useState(false);
  const [erroMateriais, setErroMateriais] = useState("");
  const [perfilUsuario, setPerfilUsuario] = useState("aluno");
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

async function carregarMateriais() {
    if (!id) return;

    setErroMateriais("");
    setCarregandoMateriais(true);

    try {
      const dados = await listarMateriais(id);
      
      const materiaisFormatados = (dados || []).map((item: any) => ({
        id: item.id,
        titulo: item.titulo,
        arquivo_url: item.arquivo_url,
        turma_id: item.turma_id
      }));

      setMateriais(materiaisFormatados);
    } catch (error: any) {
      console.error(error);
      setErroMateriais("Erro do banco: " + (error?.message || error));
    } finally {
      setCarregandoMateriais(false);
    }
  }

async function handleSalvarMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tituloMaterial.trim() || !linkMaterial.trim()) {
      setErroMateriais("Preencha título e link do material.");
      return;
    }

  try {
    if (editingMaterialId) {
      await atualizarMaterial(editingMaterialId, tituloMaterial.trim(), linkMaterial.trim());
    } else 
    if (id) {
      await criarMaterial(id, tituloMaterial.trim(), linkMaterial.trim());
    }

      setTituloMaterial("");
      setLinkMaterial("");
      setEditingMaterialId(null);
      
      await carregarMateriais(); 
     } catch (error: any) {
      console.error(error);

      const mensagemErro = error?.message || error?.details || JSON.stringify(error);
      setErroMateriais(`Erro no Banco: ${mensagemErro}`);
    }
  }

  async function handleExcluirMaterial(materialId: string) {
    if (!confirm("Deseja excluir este material?")) {
      return;
    }

    try {
      await deletarMaterial(materialId);
      await carregarMateriais();
    } catch (error) {
      console.error(error);
      setErroMateriais("Não foi possível excluir o material.");
    }
  }

  function handleEditarMaterial(material: Material) {
    setEditingMaterialId(material.id);
    setTituloMaterial(material.titulo);       
    setLinkMaterial(material.arquivo_url);    
    setErroMateriais("");
  }

  function handleCancelarEdicao() {
    setEditingMaterialId(null);
    setTituloMaterial("");
    setLinkMaterial("");
    setErroMateriais("");
  }

useEffect(() => {
    async function carregarPerfil() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setPerfilUsuario("aluno");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("perfil")
          .eq("id", user.id)
          .single();

        if (!error && data?.perfil) {
          setPerfilUsuario(data.perfil);
        } else {
          setPerfilUsuario("aluno");
        }
      } catch (error) {
        console.error("Erro ao carregar perfil do usuário:", error);
        setPerfilUsuario("aluno");
      }
    }

    async function carregarDadosTurma() {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("turmas")
          .select("nome, curso")
          .eq("id", id)
          .single();

        if (data && !error) {
          setNome(data.nome);
          setProfessor(data.curso); 
          setTurma("CT-01");
        } else {
          setNome("Disciplina não encontrada");
          setProfessor("-");
        }
      } catch (error) {
        console.error("Erro ao carregar dados da turma:", error);
      }
    }

    carregarPerfil();

    if (id) {
      carregarDadosTurma();
      carregarMateriais();
    }
  }, [id]);

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
            Disciplina
          </h1>

          <div className="relative">

            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="w-9 h-9 rounded-full border border-white flex items-center justify-center font-medium text-white hover:bg-white hover:text-[#166534] transition-all duration-200 cursor-pointer"
            >
              <i className="fa-solid fa-user text-base"></i>
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

      <main className="flex-1 px-6 py-16">

        <div className="max-w-6xl mx-auto">

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>
                <h2 className="text-3xl font-bold text-[#166534] mb-2">
                  {nome}
                </h2>

                <p className="text-gray-600">
                  Professor: {professor}
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-gray-500">
                  Período
                </p>

                <p className="text-xl font-semibold text-gray-800">
                  {turma}
                </p>
              </div>

            </div>

          </div>

          <section className="grid grid-cols-1 gap-8">
            {perfilUsuario === "monitor" ? (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-bold text-[#166534] mb-6">
                  Adicionar material
                </h3>

                <form onSubmit={handleSalvarMaterial} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título do material</label>
                    <input
                      value={tituloMaterial}
                      onChange={(event) => setTituloMaterial(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#166534] focus:outline-none"
                      placeholder="Ex: Aula 03 - Exercícios"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link do material</label>
                    <input
                      value={linkMaterial}
                      onChange={(event) => setLinkMaterial(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#166534] focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>

                  {erroMateriais ? (
                    <p className="text-sm text-red-600">{erroMateriais}</p>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      className="rounded-lg bg-[#166534] px-4 py-2 text-white hover:bg-[#14532d] transition"
                    >
                      {editingMaterialId ? "Salvar edição" : "Adicionar material"}
                    </button>

                    {editingMaterialId ? (
                      <button
                        type="button"
                        onClick={handleCancelarEdicao}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancelar edição
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>
            ) : null}

            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-[#166534] mb-6">
                Materiais
              </h3>

              <div className="space-y-4">
                {carregandoMateriais ? (
                  <p className="text-sm text-gray-500">Carregando materiais...</p>
                ) : materiais.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum material cadastrado ainda.</p>
                ) : (
                  <div className="space-y-3">
                    {materiais.map((material) => (
                      <div
                        key={material.id}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <a
                              href={material.arquivo_url}
                              className="font-medium text-gray-800 hover:text-[#166534]"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {material.titulo}
                            </a>
                            <p className="text-xs text-gray-500 mt-1">{material.arquivo_url}</p>
                          </div>

                          {perfilUsuario === "monitor" ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditarMaterial(material)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExcluirMaterial(material.id)}
                                className="rounded-lg border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 transition"
                              >
                                Excluir
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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