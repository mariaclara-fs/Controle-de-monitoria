"use client";

import { useEffect, useState } from "react";
import { Material } from "@/types/material";
import { useParams } from "next/navigation";
import { listarMateriais, criarMaterial, atualizarMaterial, deletarMaterial, } from "@/services/materialService";

type Duvida = {
  id: string;
  question: string;
  author: string;
};

export default function Disciplina() {
  const { id } = useParams();
  const disciplinaId = Array.isArray(id) ? id[0] : id;

  const [nome, setNome] = useState("Nome da disciplina");
  const [professor, setProfessor] = useState("Indefinido");
  const [turma, setTurma] = useState("-");
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [materialEditando, setMaterialEditando] = useState<string | null>(null);

  async function adicionarMaterial() {
    if (!disciplinaId) {
      console.error("ID da disciplina não encontrado.");
      return;
    }

    try {
      if (materialEditando) {
        await atualizarMaterial(materialEditando, titulo, link);
        setMaterialEditando(null);
      } else {
        await criarMaterial(disciplinaId, titulo, link);
      }

      setTitulo("");
      setLink("");
      await carregarMateriais();
    } catch (error) {
      console.error("Erro ao salvar material:", error);
    }
  }

  async function excluirMaterial(idMaterial: string) {
    try {
      await deletarMaterial(idMaterial);
      await carregarMateriais();
    } catch (error) {
      console.error("Erro ao excluir material:", error);
    }
  }

  async function carregarMateriais() {
    if (!id) {
      return;
    }

    try {
      const data = await listarMateriais(disciplinaId);
      setMateriais(data);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
    }
  }

  useEffect(() => {
    if (id) {
      setNome(`Disciplina ${id}`);
      setProfessor("Prof. Exemplo");
      setTurma("CT-01");
      carregarMateriais();
      setDuvidas([
        { id: "1", question: "Quando é a entrega do trabalho?", author: "Aluno A" },
        { id: "2", question: "Qual o peso da avaliação?", author: "Aluno B" },
      ]);
    }
  }, [id]);

  return(
    <div className="bg-[#f5f5f2] min-h-screen">
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-br from-green-500 to-green-800">
          <div className="flex items-center gap-3">
            <img src="/Logo_RDM.png" className="w-14 md:w-20" alt="logo" />
            <div>
              <h1 className="font-bold text-white">Rede de</h1>
              <h1 className="font-bold text-white">Monitoria IFPB</h1>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white hidden md:block">Disciplina</h1>
        </header>

        <main className="flex flex-1 px-6 py-8">
          <div className="max-w-6xl mx-auto w-full space-y-6">
            <section className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-green-900">{nome}</h1>
                  <p className="mt-2 text-gray-700">{professor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">2026.1</p>
                  <p className="text-xl font-semibold text-gray-900">{turma}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800">Materiais</h2>

                <div className="mt-4 space-y-3">
                  <input type="text" placeholder="Título do material" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2"/>
                  <input type="text" placeholder="Link do material" value={link} onChange={(e) => setLink(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2"/>
                  <button onClick={adicionarMaterial}
                    className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800">
                    {materialEditando ? "Salvar Alterações" : "Adicionar Material"}
                  </button>
                </div>
                <ul className="mt-6 space-y-4 text-gray-700">
                  {materiais.map((material) => (
                    <li key={material.id} className="flex items-center justify-between border-b pb-2">
                      <a href={material.link} target="_blank" rel="noopener noreferrer" className="font-medium text-green-800 hover:underline"> 
                        {material.title}
                      </a>
                      <div className="flex gap-2">
                        <button onClick={() => {
                            setMaterialEditando(material.id);
                            setTitulo(material.title);
                            setLink(material.link);
                          }}
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">Editar</button>
                        <button onClick={() => excluirMaterial(material.id)} className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">Excluir</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800">Dúvidas</h2>
                  <ul className="mt-4 space-y-3 text-gray-700">
                    {duvidas.map((duvida) => (
                      <li key={duvida.id}>
                        <p className="font-medium">{duvida.question}</p>
                        <p className="text-sm text-gray-500">{duvida.author}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <footer className="bg-[#166534] text-white text-center text-xs py-2">
        &copy; 2026 - Rede de Monitoria. Todos os direitos reservados.
      </footer>
    </div>
  );
}