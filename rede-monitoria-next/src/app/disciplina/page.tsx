"use client";

import Link from "next/link";
import { supabase } from "@/services/supabase";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

type Material = {
  id: string;
  title: string;
  link: string;
};

type Duvida = {
  id: string;
  question: string;
  author: string;
};

export default function Disciplina(){
  const { id } = useParams();
  const [nome, setNome] = useState("Nome da disciplina");
  const [professor, setProfessor] = useState("Indefinido");
  const [turma, setTurma] = useState("-");
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  useEffect(() => {
    if (id) {
      setNome(`Disciplina ${id}`);
      setProfessor("Prof. Exemplo");
      setTurma("CT-01");
      setMateriais([
        { id: "1", title: "Aula 1 - Introdução", link: "#" },
        { id: "2", title: "Aula 2 - Material de apoio", link: "#" },
      ]);
      setDuvidas([
        { id: "1", question: "Quando é a entrega do trabalho?", author: "Aluno A" },
        { id: "2", question: "Qual o peso da avaliação?", author: "Aluno B" },
      ]);
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

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="bg-white rounded-xl shadow-sm p-8">

              <h3 className="text-xl font-bold text-[#166534] mb-6">
                Materiais
              </h3>

              <div className="space-y-4">

                {materiais.map((material) => (
                  <a
                    key={material.id}
                    href={material.link}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:border-green-700 hover:bg-green-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-file-lines text-[#166534]"></i>

                      <span className="font-medium text-gray-800">
                        {material.title}
                      </span>
                    </div>

                    <i className="fa-solid fa-arrow-up-right-from-square text-gray-500"></i>
                  </a>
                ))}

              </div>

            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">

              <h3 className="text-xl font-bold text-[#166534] mb-6">
                Dúvidas
              </h3>

              <div className="space-y-4">

                {duvidas.map((duvida) => (
                  <div
                    key={duvida.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <p className="font-semibold text-gray-800 mb-2">
                      {duvida.question}
                    </p>

                    <p className="text-sm text-gray-500">
                      {duvida.author}
                    </p>
                  </div>
                ))}

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